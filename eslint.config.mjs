import js from '@eslint/js';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

const sourceFiles = ['src/**/*.{js,cjs,mjs,jsx}'];
const rootConfigFiles = [
  'eslint.config.{js,cjs,mjs}',
  '*.config.{js,cjs,mjs}',
  '.*rc.{js,cjs,mjs}',
];

export default [
  {
    name: 'Ignore Generated Files',
    ignores: ['.pnp.*', '.yarn/**', 'node_modules/**', 'dist/**'],
  },
  js.configs.recommended,
  {
    name: 'Project Source',
    files: sourceFiles,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  {
    name: 'Root Config Files',
    files: rootConfigFiles,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
];
