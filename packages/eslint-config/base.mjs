// @ts-check
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Statements that must be surrounded by blank lines. `block-like` covers braced
// bodies; the explicit keywords also catch brace-less one-liners.
const BLOCK_STATEMENTS = ['block-like', 'if', 'for', 'while', 'do', 'switch', 'try'];

export function baseConfig(tsconfigRootDir) {
  return tseslint.config(
    {
      ignores: [
        'eslint.config.js',
        'eslint.config.mjs',
        'dist/**',
        'coverage/**',
        'generated/**',
        'src/generated/**',
      ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        globals: {
          ...globals.node,
        },
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      plugins: {
        '@stylistic': stylistic,
        'simple-import-sort': simpleImportSort,
      },
      rules: {
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
        curly: ['error', 'all'],
        'func-style': ['error', 'expression', { allowArrowFunctions: true }],
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              ['^\\u0000'],
              ['^node:'],
              ['^@?\\w'],
              ['^@(apps|packages)/'],
              ['^\\.\\.'],
              ['^\\./'],
              ['^.+\\.s?css$'],
            ],
          },
        ],
        'simple-import-sort/exports': 'error',
        '@stylistic/padding-line-between-statements': [
          'error',
          { blankLine: 'always', prev: '*', next: BLOCK_STATEMENTS },
          { blankLine: 'always', prev: BLOCK_STATEMENTS, next: '*' },
          { blankLine: 'always', prev: '*', next: 'return' },
          { blankLine: 'always', prev: ['const', 'let'], next: '*' },
          { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
          { blankLine: 'always', prev: '*', next: ['case', 'default'] },
          // Separate the import block from the body. Listed last so it wins for
          // import pairs; `any` keeps simple-import-sort's own grouping intact.
          { blankLine: 'always', prev: 'import', next: '*' },
          { blankLine: 'any', prev: 'import', next: 'import' },
        ],
      },
    },
  );
}

export default baseConfig;
