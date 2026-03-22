import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  ...compat.config({
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react-hooks'],
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
    env: {
      node: true,
      es2022: true,
    },
  }),
  {
    files: [
      'packages/core/src/terminal/**/*.{ts,tsx,js}',
      'packages/core/src/hooks/useMouse.{ts,js}',
    ],
    rules: {
      'no-control-regex': 'off',
    },
  },
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.pnpm-store/**',
      '**/coverage/**',
      '**/*.min.js',
      'packages/*/dist/**',
    ],
  },
];
