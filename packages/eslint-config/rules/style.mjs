// @ts-check
//
// Rules decidable from the AST alone, shared by `base` (type-aware, used by
// package lint scripts) and `fast` (syntax-only, used by the pre-commit hook).
//
// They MUST come from one definition. When the hook and the package configs
// each declare their own import-order or blank-line rules, they disagree, and
// the hook starts demanding a shape that `pnpm lint` then rejects.

// Statements that must be surrounded by blank lines. `block-like` covers braced
// bodies; the explicit keywords also catch brace-less one-liners.
const BLOCK_STATEMENTS = ['block-like', 'if', 'for', 'while', 'do', 'switch', 'try'];

export const SYNTACTIC_RULES = {
  'prettier/prettier': ['error', { endOfLine: 'auto' }],
  curly: ['error', 'all'],
  'func-style': ['error', 'expression', { allowArrowFunctions: true }],
  'simple-import-sort/imports': [
    'error',
    {
      groups: [['^\\u0000'], ['^node:'], ['^@?\\w'], ['^@(apps|packages)/'], ['^\\.\\.'], ['^\\./'], ['^.+\\.s?css$']],
    },
  ],
  'simple-import-sort/exports': 'error',
  // The last matching entry wins, so the `any` exemptions sit above the block
  // rules. That lets runs of plain imports or exports stay packed while a braced
  // one is still separated from its neighbours.
  '@stylistic/padding-line-between-statements': [
    'error',
    { blankLine: 'always', prev: '*', next: 'return' },
    { blankLine: 'always', prev: ['const', 'let'], next: '*' },
    { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
    { blankLine: 'always', prev: '*', next: ['case', 'default'] },
    // `any` between same-kind statements keeps simple-import-sort in charge of
    // how it groups and separates them.
    { blankLine: 'always', prev: 'import', next: '*' },
    { blankLine: 'any', prev: 'import', next: 'import' },
    { blankLine: 'always', prev: '*', next: 'export' },
    { blankLine: 'any', prev: 'export', next: 'export' },
    { blankLine: 'always', prev: '*', next: BLOCK_STATEMENTS },
    { blankLine: 'always', prev: BLOCK_STATEMENTS, next: '*' },
  ],
};

// Complexity SIGNALS, deliberately warnings rather than errors. Line count is a
// signal, not a standard: as errors these would reward splitting files to
// satisfy a counter, which produces fragments that must be read together.
// See docs/repository/code-design.md, "Decomposition Criteria".
export const COMPLEXITY_SIGNALS = {
  'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': ['warn', { max: 60, skipBlankLines: true, skipComments: true }],
  'max-depth': ['warn', 4],
  complexity: ['warn', 12],
};

/** Vendored shadcn registry code keeps its upstream shape and size. */
export const VENDORED_UI_FILES = ['**/packages/ui/src/components/**/*.tsx', '**/packages/ui/src/lib/utils.ts'];

export const VENDORED_UI_EXEMPTIONS = {
  'func-style': 'off',
  'max-lines': 'off',
  'max-lines-per-function': 'off',
  complexity: 'off',
};

export const TEST_FILES = ['**/*.spec.{ts,tsx}', '**/*.test.{ts,tsx,mjs}', '**/tests/**', '**/test/**'];
