// @ts-check
//
// Syntax-only rule set for the pre-commit hook.
//
// Why this exists: swapping the hook's command achieves nothing on its own.
// `turbo run lint` chains @apps/frontend.docs#lint -> docs:prepare ->
// docs:generate -> ^build, so linting the docs app builds the backend template.
// And the docs app's type-aware rules genuinely need the generated `.source`
// types -- measured: ESLint on src/lib/source.ts exits 0 with `.source` present
// and 1 without it. So the fix is to split the RULE SET, not the file list.
//
// Everything here works from the AST alone: no `projectService`, no tsconfig, no
// generated artifacts. That keeps every architecture boundary rule in the hook
// -- import boundaries and thin-controller need no type information -- while the
// type-aware rules and typecheck move to CI, where the generators run.
//
// Deliberately NOT here: `tsc` over staged files. Passing a file list builds a
// different program than the project and silently changes the result. If
// typechecking belongs in a hook at all, run `tsc -p <project> --noEmit`.
// https://www.typescriptlang.org/docs/handbook/compiler-options.html

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { RESTRICTED_IMPORTS_BACKEND, RESTRICTED_IMPORTS_BASE, RESTRICTED_IMPORTS_DOMAIN } from './rules/boundaries.mjs';
import { SYNTACTIC_RULES, TEST_FILES, VENDORED_UI_EXEMPTIONS, VENDORED_UI_FILES } from './rules/style.mjs';
import { thinController } from './rules/thin-controller.mjs';

const architecturePlugin = { rules: { 'thin-controller': thinController } };

export function fastConfig() {
  return tseslint.config(
    {
      ignores: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/.source/**',
        '**/.turbo/**',
        '**/coverage/**',
        '**/generated/**',
        '**/playwright-report/**',
        '**/test-results/**',
        '**/.agents/skills/**',
        '**/packages/eslint-config/fixtures/**',
        // Files no package `lint` script covers. The hook must not enforce rules
        // that `pnpm lint` never checks, or it demands a shape CI does not want.
        // Prettier still formats these -- it runs as its own lint-staged task.
        '**/next-env.d.ts',
        '**/next.config.mjs',
        '**/scripts/*.{mjs,cjs}',
        '**/tests/**/*.{mjs,cjs}',
        '**/test/**/*.{mjs,cjs}',
      ],
    },
    eslint.configs.recommended,
    // `recommended`, NOT `recommendedTypeChecked`: the type-aware rules are what
    // require the generated artifacts this hook exists to avoid building.
    ...tseslint.configs.recommended,
    eslintPluginPrettierRecommended,
    {
      files: ['**/*.{ts,tsx,mts,cts,mjs,cjs,js,jsx}'],
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: { ...globals.node, ...globals.browser },
      },
      plugins: {
        '@stylistic': stylistic,
        architecture: architecturePlugin,
        'simple-import-sort': simpleImportSort,
      },
      // Everything here is safe on plain JavaScript as well as TypeScript.
      rules: {
        'prettier/prettier': SYNTACTIC_RULES['prettier/prettier'],
        'simple-import-sort/imports': SYNTACTIC_RULES['simple-import-sort/imports'],
        'simple-import-sort/exports': SYNTACTIC_RULES['simple-import-sort/exports'],
      },
    },
    {
      // The rest of the shared set is scoped to ts/tsx, exactly as base.mjs
      // scopes it. Applying `func-style` to .mjs too made the hook reject the
      // `export function baseConfig()` factories that `pnpm lint` accepts --
      // the precise class of hook-versus-CI disagreement this file must avoid.
      files: ['**/*.{ts,tsx}'],
      rules: {
        // Shared with base.mjs. If these were declared separately the hook would
        // demand an import order that `pnpm lint` then rejected.
        ...SYNTACTIC_RULES,
        'no-restricted-imports': ['error', RESTRICTED_IMPORTS_BASE],
      },
    },
    {
      files: VENDORED_UI_FILES,
      rules: VENDORED_UI_EXEMPTIONS,
    },
    {
      // The architecture rules run in the hook because they are purely
      // syntactic: neither needs type information.
      files: ['**/apps/backend*/**/*.ts', '**/templates/apps.backend/**/*.ts'],
      rules: {
        'architecture/thin-controller': 'error',
        'no-restricted-imports': ['error', RESTRICTED_IMPORTS_BACKEND],
      },
    },
    {
      files: ['**/domain/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error', RESTRICTED_IMPORTS_DOMAIN],
      },
    },
    {
      files: TEST_FILES,
      rules: {
        'architecture/thin-controller': 'off',
      },
    },
  );
}

export default fastConfig;
