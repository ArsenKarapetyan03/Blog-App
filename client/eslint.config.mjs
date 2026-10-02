import { config } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tsParser from '@typescript-eslint/parser';
import oxlint from 'eslint-plugin-oxlint';

export default config(
    {
      files: ['**/*.ts', '**/*.tsx'],
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      plugins: {
        ...nextVitals.plugins,
        ...nextTs.plugins,
      },
      rules: {
        ...nextVitals.rules,
        ...nextTs.rules,
      },
    },
    {
      ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
    },
    oxlint.configs['flat/recommended']
);