// @ts-check
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { RESTRICTED_IMPORTS_BASE } from './rules/boundaries.mjs';
import { COMPLEXITY_SIGNALS, SYNTACTIC_RULES, TEST_FILES } from './rules/style.mjs';

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
        // Shared with the pre-commit config so the hook and `pnpm lint` cannot
        // disagree about import order or blank lines.
        ...SYNTACTIC_RULES,
        'no-restricted-imports': ['error', RESTRICTED_IMPORTS_BASE],
      },
    },
    {
      // Tests are long by nature: setup, many cases, and assertions that read
      // better inline than extracted. The size signals say nothing useful here.
      files: TEST_FILES,
      rules: {
        'max-lines': 'off',
        'max-lines-per-function': 'off',
      },
    },
  );
}

export default baseConfig;
