import { existsSync } from 'node:fs';
import { rm, copyFile, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
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
  updateTemplate,
  Token,
} from './utils';
import {
  TEMPLATE_EXCLUDE_DEPS,
  TEMPLATE_EXCLUDE_PATHS,
  TEMPLATE_EXCLUDE_PKG_FIELDS,
  TEMPLATE_UPDATE_PATHS,
} from './constants';

interface ProjectConfig {
  title: string;
  accessToken: string;
}

// TODO: Unit tests:
// - correct template and target dir
// - overwrite target dir must prompt
// - no change to template dir
// - config applied to target dir
// - files added/removed as expected

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
  const targetDirExists = existsSync(targetDir);
  const targetDirEmpty = targetDirExists && (await isEmpty(targetDir));
  if (targetDirExists && !targetDirEmpty) {
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
  } else if (!targetDirExists) {
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
        message: `Project title ${dim('(required) [.env, index.html]')}`,
        validate: (text) => (text.length === 0 ? 'Title is required' : true),
      },
      {
        name: 'authEnabled',
        type: 'toggle',
        active: 'OAuth',
        inactive: 'access token',
        message: `Authentication? ${dim('(required) [.env]')}`,
      },
      {
        name: 'accessToken',
        type: (_, config) => (config.authEnabled ? null : 'password'),
        message: `Access token for CARTO API ${dim('(required) [.env]')}`,
        validate: (text) =>
          text.length === 0 ? 'Access token is required' : true,
      },
      {
        name: 'authClientID',
        type: (_, config) => (config.authEnabled ? 'password' : null),
        message: `OAuth client ID ${dim('(required) [.env]')}`,
        validate: (text) =>
          text.length === 0 ? 'Client ID is required' : true,
      },
      {
        name: 'authOrganizationID',
        type: (_, config) => (config.authEnabled ? 'text' : null),
        message: `OAuth organization ID ${dim('(optional) [.env]')}`,
      },
      {
        name: 'authDomain',
        type: (_, config) => (config.authEnabled ? 'text' : null),
        message: `OAuth domain ${dim('(optional) [.env]')}`,
        initial: 'auth.carto.com',
      },
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
  if (targetDirExists && !targetDirEmpty) {
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

  // Replace `@carto/create-common/style.css` dependency with local file, so
  // users can easily modify project CSS.
  const srcStylePath = resolve(
    fileURLToPath(import.meta.url),
    '../../style.css',
  );
  const dstStylePath = pkg.dependencies['@angular/core']
    ? resolve(targetDir, 'style.css')
    : resolve(targetDir, 'src', 'style.css');
  await copyFile(srcStylePath, dstStylePath);

  const globConfig = { cwd: targetDir, absolute: true };

  // Replace env files with their templates. For example, .env.template
  // overwrites .env, and then the template is removed.
  for (const path of await glob(
    ['**/.env.template', '**/environment.template.ts'],
    globConfig,
  )) {
    console.log(`overwrite ${path}`);
    await copyFile(path, path.replace('.template', ''));
    await rm(path);
  }

  // Replace known tokens ($title, $accessToken, ...) in template files.
  const tokenList = createTokenList(config);
  for (const path of await glob(TEMPLATE_UPDATE_PATHS, globConfig)) {
    await updateTemplate(path, tokenList);
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

/**
 * Given a project config, creates a list of tokens to be replaced in project
 * source files. For example, "$title" and "$accessToken" are replaced with values
 * given during project initialization.
 */
function createTokenList(config: ProjectConfig): Token[] {
  const configTokens: Token[] = Object.keys(config).map((key) => [
    `$${key}`,
    config[key as keyof ProjectConfig],
  ]);
  return [...configTokens, ['@carto/create-common/style.css', './style.css']];
}
