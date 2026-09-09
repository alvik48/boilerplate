// @ts-check
import globals from 'globals';

import { baseConfig } from './base.mjs';
import { RESTRICTED_IMPORTS_BACKEND, RESTRICTED_IMPORTS_DATA, RESTRICTED_IMPORTS_DOMAIN } from './rules/boundaries.mjs';
import { thinController } from './rules/thin-controller.mjs';

const architecturePlugin = {
  rules: {
    'thin-controller': thinController,
  },
};

export function backendConfig(tsconfigRootDir) {
  return [
    ...baseConfig(tsconfigRootDir),
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
        sourceType: 'commonjs',
      },
      plugins: {
        architecture: architecturePlugin,
      },
      // The backend used to switch off `no-explicit-any` and three `no-unsafe-*`
      // rules and downgrade `no-floating-promises` to a warning. That mattered
      // more than the tsconfig in practice: the linter stayed silent on a
      // hand-written `any`, and an unawaited promise in a service — a lost error
      // with no stack trace — only warned.
      //
      // Where a Nest idiom genuinely needs an escape, add a file-scoped override
      // with a comment naming the reason. Never widen the shared config.
      rules: {
        'architecture/thin-controller': 'error',
        'no-restricted-imports': ['error', RESTRICTED_IMPORTS_BACKEND],
      },
    },
    {
      // Domain purity. Duplicated in dependency-cruiser on purpose: that layer
      // also catches transitive reach, which a specifier-only rule cannot see.
      files: ['**/domain/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error', RESTRICTED_IMPORTS_DOMAIN],
      },
    },
    {
      // The data layer is exactly where query construction and Prisma belong, so
      // the backend-wide Prisma restriction is lifted here. Must come after the
      // entry that sets it: in flat config the last matching entry wins.
      files: ['**/data/**/*.ts', '**/*.repository.ts'],
      rules: {
        'no-restricted-imports': ['error', RESTRICTED_IMPORTS_DATA],
      },
    },
    {
      files: ['**/*.spec.ts', '**/test/**/*.ts', '**/tests/**/*.ts'],
      rules: {
        'architecture/thin-controller': 'off',
      },
    },
  ];
}

export default backendConfig;
