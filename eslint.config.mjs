import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh';
import eslintPluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const languageOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  globals: globals.browser,
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    parser: typescriptEslint.parser,
  },
};

export default typescriptEslint.config(
  { ignores: ['*.d.ts', '**/coverage', '**/dist', '**/.angular'] },

  // Common
  {
    files: ['packages/**/*.{ts,tsx,vue}'],
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
    ],
    languageOptions,
  },

  // React
  {
    files: ['packages/create-react/**/*.{ts,tsx}'],
    extends: [
      ...compat.extends('plugin:react-hooks/recommended'),
      eslintPluginReactRefresh.configs.recommended,
    ],
    languageOptions,
  },

  // Vue
  {
    files: ['packages/create-vue/**/*.{ts,vue}'],
    extends: [...eslintPluginVue.configs['flat/recommended']],
    languageOptions,
    rules: {
      // Single-word component names are discouraged in Vue, but used here
      // for consistency across templates.
      'vue/multi-word-component-names': 'off',
    },
  },
  eslintConfigPrettier,
);
