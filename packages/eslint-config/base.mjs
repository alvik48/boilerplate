// @ts-check
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { RESTRICTED_IMPORTS_BASE } from './rules/boundaries.mjs';

// Statements that must be surrounded by blank lines. `block-like` covers braced
// bodies; the explicit keywords also catch brace-less one-liners.
const BLOCK_STATEMENTS = ['block-like', 'if', 'for', 'while', 'do', 'switch', 'try'];

// Complexity SIGNALS, deliberately warnings rather than errors. Line count is a
// signal, not a standard: as errors these would reward splitting files to
// satisfy a counter, which produces fragments that must be read together.
// See docs/repository/code-design.md, "Decomposition Criteria".
const COMPLEXITY_SIGNALS = {
  'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': ['warn', { max: 60, skipBlankLines: true, skipComments: true }],
  'max-depth': ['warn', 4],
  complexity: ['warn', 12],
};

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
        // Guardrail fixtures contain deliberate violations; the fixture suite
        // asserts against them directly. Linting them repo-wide would fail by
        // design.
        'fixtures/**',
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
        ...COMPLEXITY_SIGNALS,
        'no-restricted-imports': ['error', RESTRICTED_IMPORTS_BASE],
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
        // The last matching entry wins, so the `any` exemptions sit above the
        // block rules. That lets runs of plain imports or exports stay packed
        // while a braced one is still separated from its neighbours.
        '@stylistic/padding-line-between-statements': [
          'error',
          { blankLine: 'always', prev: '*', next: 'return' },
          { blankLine: 'always', prev: ['const', 'let'], next: '*' },
          { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
          { blankLine: 'always', prev: '*', next: ['case', 'default'] },
          // `any` between same-kind statements keeps simple-import-sort in
          // charge of how it groups and separates them.
          { blankLine: 'always', prev: 'import', next: '*' },
          { blankLine: 'any', prev: 'import', next: 'import' },
          { blankLine: 'always', prev: '*', next: 'export' },
          { blankLine: 'any', prev: 'export', next: 'export' },
          { blankLine: 'always', prev: '*', next: BLOCK_STATEMENTS },
          { blankLine: 'always', prev: BLOCK_STATEMENTS, next: '*' },
        ],
      },
    },
    {
      // Tests are long by nature: setup, many cases, and assertions that read
      // better inline than extracted. The size signals say nothing useful here.
      files: ['**/*.spec.{ts,tsx}', '**/*.test.{ts,tsx,mjs}', '**/tests/**', '**/test/**'],
      rules: {
        'max-lines': 'off',
        'max-lines-per-function': 'off',
      },
    },
  );
}

export default baseConfig;
