import { existsSync } from 'node:fs';
import { rm, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import prompts from 'prompts';
import { green, bold, dim, yellow } from 'kolorist';
import { glob } from 'glob';
import {
  copyDir,
  emptyDir,
  isEmpty,
  removePkgDependencies,
  removePkgFields,
  toValidPkgName,
} from './utils';

/** List of relative paths in the template to be _removed_ from new projects. */
const TEMPLATE_EXCLUDE_PATHS = ['node_modules', 'dist', 'scripts'];

/** List of dependencies in the template to be _removed_ from new projects. */
const TEMPLATE_EXCLUDE_DEPS = ['@carto/create-common'];

/**
 * List of package.json fields to clear from new projects.
 * See: https://docs.npmjs.com/cli/v10/configuring-npm/package-json
 */
const TEMPLATE_EXCLUDE_PKG_FIELDS = [
  'author',
  'bin',
  'bugs',
  'description',
  'files',
  'homepage',
  'keywords',
  'license',
  'publishConfig',
  'repository',
  'version',
];

/**
 * List of template-relative paths that may contain tokens for replacement,
 * such as `<!-- replace:title:begin -->`.
 */
const TEMPLATE_UPDATE_PATHS = ['index.html', 'src/context.ts', '.env'];

interface ProjectConfig {
  title: string;
  accessToken: string;
}

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
${green('✔')} ${bold('Template directory')} ${dim('…')} ${templateDir}
${green('✔')} ${bold('Target directory')} ${dim('…')} ${targetDir}
  `);

  console.log(dim('…\n'));

  /****************************************************************************
   * Validate target directory.
   */

  // Prevent overwriting the template directory.
  if (targetDir === templateDir) {
    throw new Error(`Target and template directories cannot be the same.`);
  }

  // If target directory contains existing files, prompt user before overwriting.
  if (existsSync(targetDir) && !isEmpty(targetDir)) {
    const { overwrite } = await prompts([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Target directory "${targetDir}" is not empty. Overwrite?`,
      },
    ]);

    if (!overwrite) {
      console.warn(`Project creation cancelled.`);
      process.exit(2);
    }
  } else if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
  }

  /****************************************************************************
   * Project configuration.
   */

  const config: ProjectConfig = await prompts(
    [
      {
        name: 'title',
        type: 'text',
        message: 'Title for the application',
        validate: (text) => (text.length === 0 ? 'Title is required' : true),
      },
      // TODO(impl): Prompt about authentication, enable/disable access token prompt.
      {
        name: 'accessToken',
        type: 'password',
        message: 'Access token for CARTO API',
        validate: (text) =>
          text.length === 0 ? 'Access token is required' : true,
      },
      // {
      //   name: 'apiBaseUrl',
      //   type: 'text',
      //   message: 'Base URL for CARTO API (optional)',
      // },
      // {
      //   name: 'basemap',
      //   type: 'toggle',
      //   message: 'Basemap',
      //   inactive: 'maplibre',
      //   active: 'google maps',
      //   initial: false, // maplibre
      // },
    ],
    {
      onCancel: () => {
        console.warn(`Project creation cancelled.`);
        process.exit(2);
      },
    },
  );

  console.log(dim('\n…'));

  /****************************************************************************
   * Populate project directory.
   */

  // Overwrite was explicitly approved by user above.
  if (existsSync(targetDir) && !isEmpty(targetDir)) {
    await emptyDir(targetDir);
  }

  await copyDir(templateDir, targetDir);

  // Remove template files not needed in project.
  for (const excludePath of TEMPLATE_EXCLUDE_PATHS) {
    await rm(resolve(targetDir, excludePath), { recursive: true, force: true });
  }

  // Set up package.json.
  const pkgPath = resolve(targetDir, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  removePkgDependencies(pkg, TEMPLATE_EXCLUDE_DEPS);
  removePkgFields(pkg, TEMPLATE_EXCLUDE_PKG_FIELDS);
  pkg.name = toValidPkgName(config.title);
  pkg.private = true;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2));

  // Apply config data — set title, access token, etc.
  const updatePaths = await glob(TEMPLATE_UPDATE_PATHS, {
    cwd: targetDir,
    absolute: true,
  });
  for (const path of updatePaths) {
    updateTemplate(path, config);
  }

  // Create empty yarn.lock. Required when working in sandbox/.
  await writeFile(resolve(targetDir, 'yarn.lock'), '');

  // Suggest next steps
  const steps = [
    ...(inputTargetDir !== '.' ? [`${dim('$')} cd ${inputTargetDir}`] : []),
    `${dim('$')} yarn`,
    `${dim('$')} yarn dev`,
  ];

  console.log(`
${green('✔')} ${bold(`Project "${config.title}" was created!`)}

${bold(yellow('!'))} ${bold('Next steps')}:

${steps.join('\n')}
  `);
}

async function updateTemplate(
  path: string,
  config: ProjectConfig,
): Promise<void> {
  let content = await readFile(path, 'utf8');

  for (const key in config) {
    const value = config[key as keyof ProjectConfig];
    content = content.replaceAll(`$${key}`, value);
  }

  await writeFile(path, content);
}
