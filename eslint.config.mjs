import { defineConfig } from 'eslint/config';
import sabinmarcuConfig from '@sabinmarcu/eslint-config';

export default defineConfig([
  ...sabinmarcuConfig,
  {
    name: 'Cutrail Generated Files Ignore',
    ignores: ['.pnp.*', '.yarn/**', 'node_modules/**', 'dist/**', '**/*.d.ts'],
  },
  {
    name: 'Cutrail ESLint Config Compatibility',
    files: ['eslint.config.mjs'],
    rules: {
      'import/extensions': 'off',
    },
  },
  {
    name: 'Cutrail JSX Compatibility',
    files: ['src/**/*.{jsx,tsx}'],
    rules: {
      'react/prop-types': 'off',
    },
  },
  {
    name: 'Cutrail Source Rule Adjustments',
    files: ['src/**/*.{js,mjs,ts,tsx,jsx}'],
    rules: {
      'max-len': 'off',
      'no-void': 'off',
    },
  },
  {
    name: 'Cutrail ESM Import Extensions',
    files: ['src/**/*.{js,mjs}'],
    rules: {
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'always',
          mjs: 'always',
        },
      ],
    },
  },
  {
    name: 'Cutrail Main Preload JavaScript Compatibility',
    files: ['src/main/**/*.mjs', 'src/preload/**/*.mjs'],
    rules: {
      'no-underscore-dangle': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/prefer-top-level-await': 'off',
    },
  },
  {
    name: 'Cutrail Node Test Compatibility',
    files: ['src/**/*.{spec,test}.js'],
    rules: {
      'import/extensions': 'off',
      'unicorn/prefer-event-target': 'off',
    },
  },
  {
    name: 'Cutrail TypeScript Type Import Compatibility',
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
]);
