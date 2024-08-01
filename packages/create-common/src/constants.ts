/** List of relative paths in the template to be _removed_ from new projects. */
export const TEMPLATE_EXCLUDE_PATHS = [
  'node_modules',
  'dist',
  'scripts',
  '.vscode',
  '.yarn',
  '.env.local',
];

/** List of dependencies in the template to be _removed_ from new projects. */
export const TEMPLATE_EXCLUDE_DEPS = ['@carto/create-common'];

/**
 * List of package.json fields to clear from new projects.
 * See: https://docs.npmjs.com/cli/v10/configuring-npm/package-json
 */
export const TEMPLATE_EXCLUDE_PKG_FIELDS = [
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
export const TEMPLATE_UPDATE_PATHS = [
  'index.html',
  'src/context.ts',
  'src/main.{ts,tsx}',
  '.env',
];