import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.config({
    env: {
      browser: true,
      es6: true,
    },
    extends: ['eslint:recommended', 'airbnb-base', 'prettier'],
    globals: {
      Atomics: 'readonly',
      SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    rules: {
      'no-underscore-dangle': 'off',
      'no-console': 'off',
      'no-useless-assignment': 'off',
      'global-require': 'off',
      'no-restricted-syntax': 'off',
      'linebreak-style': 'off',
      'max-classes-per-file': 'off',
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  }),
];
