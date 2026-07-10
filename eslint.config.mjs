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
    name: 'Cutrail TypeScript Import Extensions',
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import/extensions': 'off',
    },
  },
]);
