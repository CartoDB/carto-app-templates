import { createProjectFromConfig } from '@carto/create-common';
import { resolve } from 'node:path';

/**
 * Helper script to generate test projects in CI. Given a template/framework
 * name, a target project path, and an access token, creates a new project
 * (without user interaction with the usual CLI) in that directory.
 */

const [_execPath, _scriptPath, template, projectPath, accessToken] =
  process.argv;

const TemplatePath = {
  angular: './packages/create-angular',
  react: './packages/create-react',
  vue: './packages/create-vue',
};

if (!TemplatePath[template]) {
  throw new Error(`Unexpected template, "${template}"`);
}

await createProjectFromConfig(
  resolve(process.cwd(), TemplatePath[template]),
  resolve(process.cwd(), projectPath),
  {
    title: `CI Test (${template})`,
    authEnabled: false,
    accessToken,
    apiBaseURL: 'https://gcp-us-east1.api.carto.com',
  },
);
