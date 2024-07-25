import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import {
  rm,
  stat,
  copyFile,
  readFile,
  writeFile,
  mkdir,
} from "node:fs/promises";
import { resolve } from "node:path";
import prompts from "prompts";
import { green, bold, dim, bgGray, bgGreen, yellow } from "kolorist";

// TODO: Simplify this.
const pkg = pkgFromUserAgent(process.env.npm_config_user_agent);
const pkgManager = pkg ? pkg.name : "npm";
const isYarn1 = pkgManager === "yarn" && pkg?.version.startsWith("1.");

/** List of relative paths in the template to be _removed_ from new projects. */
const TEMPLATE_EXCLUDE_PATHS = ["node_modules", "scripts"];

/** List of dependencies in the template to be _removed_ from new projects. */
const TEMPLATE_EXCLUDE_DEPS = ["@carto/create-common"];

/**
 * List of package.json fields to clear from new projects.
 * See: https://docs.npmjs.com/cli/v10/configuring-npm/package-json
 */
const TEMPLATE_EXCLUDE_PKG_FIELDS = [
  "author",
  "bin",
  "bugs",
  "description",
  "files",
  "homepage",
  "keywords",
  "license",
  "publishConfig",
  "repository",
  "version",
];

/**
 * Creates a new CARTO app in the target directory, given a template.
 *
 * @param templateDir Absolute path to template directory
 * @param targetDir Relative or absolute path to target directory
 */
export async function createProject(
  templateDir: string,
  inputTargetDir: string,
) {
  const targetDir = resolve(process.cwd(), inputTargetDir);

  console.log(`
${green("✔")} ${bold("Template directory")} ${dim("…")} ${templateDir}
${green("✔")} ${bold("Target directory")} ${dim("…")} ${targetDir}
  `);

  console.log(dim("…\n"));

  /****************************************************************************
   * Validate target directory.
   */

  if (targetDir === templateDir) {
    throw new Error(`Target and template directories cannot be the same.`);
  }

  if (existsSync(targetDir) && !isEmpty(targetDir)) {
    const { overwrite } = await prompts([
      {
        type: "confirm",
        name: "overwrite",
        message: `Target directory "${targetDir}" is not empty. Overwrite?`,
      },
    ]);

    if (!overwrite) {
      console.warn(`Project creation cancelled.`);
      process.exit(2);
    }
  } else if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  /****************************************************************************
   * Project configuration.
   */

  const config = await prompts(
    [
      {
        name: "title",
        type: "text",
        message: "Title for the application",
        validate: (text) => (text.length === 0 ? "Title is required" : true),
      },
      {
        name: "accessToken",
        type: "password",
        message: "Access token for CARTO API",
        validate: (text) =>
          text.length === 0 ? "Access token is required" : true,
      },
      {
        name: "apiBaseUrl",
        type: "text",
        message: "Base URL for CARTO API (optional)",
      },
    ],
    {
      onCancel: () => {
        console.warn(`Project creation cancelled.`);
        process.exit(2);
      },
    },
  );

  console.log(dim("\n…"));

  /****************************************************************************
   * Populate project directory.
   */

  // Overwrite was explicitly approved by user above.
  if (existsSync(targetDir) && !isEmpty(targetDir)) {
    emptyDir(targetDir);
  }

  copyDir(templateDir, targetDir);

  // Remove template files not needed in project.
  for (const excludePath of TEMPLATE_EXCLUDE_PATHS) {
    await rm(resolve(targetDir, excludePath), { recursive: true, force: true });
  }

  // Set up package.json.
  const pkgPath = resolve(targetDir, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  removePkgDependencies(pkg, TEMPLATE_EXCLUDE_DEPS);
  removePkgFields(pkg, TEMPLATE_EXCLUDE_PKG_FIELDS);
  pkg.name = toValidPackageName(config.title);
  pkg.private = true;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2));

  // Suggest next steps
  console.log(`
${green("✔")} ${bold(`Project "${config.title}" was created!`)}

${bold(yellow("!"))} ${bold("Next steps")}:

${[
  ...(inputTargetDir !== "." ? [`${dim("$")} cd ${inputTargetDir}`] : []),
  `${dim("$")} yarn`,
  `${dim("$")} yarn dev`,
].join("\n")}
  `);
}

/******************************************************************************
 * Utility functions.
 *
 * References:
 * - https://github.com/vitejs/vite/blob/main/packages/create-vite/src/index.ts
 */

function removePkgDependencies<T extends Record<string, unknown>>(
  pkg: T,
  excludeDeps: string[],
): T {
  const dependencyTypes = [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
  ];

  for (const exclude of excludeDeps) {
    for (const type of dependencyTypes) {
      const dependencies = pkg[type] as Record<string, string> | undefined;
      if (dependencies && dependencies[exclude]) {
        delete dependencies[exclude];
      }
    }
  }

  return pkg;
}

function removePkgFields<T extends Record<string, unknown>>(
  pkg: T,
  excludeFields: string[],
): T {
  for (const field of TEMPLATE_EXCLUDE_PKG_FIELDS) {
    delete pkg[field];
  }
  return pkg;
}

function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, "");
}

function copy(src: string, dest: string) {
  const stat = statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    copyFileSync(src, dest);
  }
}

const VALIDATE_PKG_NAME_REGEX =
  /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/;

function toValidPackageName(projectName: string) {
  if (VALIDATE_PKG_NAME_REGEX.test(projectName)) {
    return projectName;
  }

  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
}

function copyDir(srcDir: string, destDir: string) {
  mkdirSync(destDir, { recursive: true });
  for (const file of readdirSync(srcDir)) {
    const srcFile = resolve(srcDir, file);
    const destFile = resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

function isEmpty(path: string) {
  const files = readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

function emptyDir(dir: string) {
  if (!existsSync(dir)) {
    return;
  }
  for (const file of readdirSync(dir)) {
    if (file === ".git") {
      continue;
    }
    rmSync(resolve(dir, file), { recursive: true, force: true });
  }
}

function pkgFromUserAgent(userAgent: string | undefined) {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/");
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}
