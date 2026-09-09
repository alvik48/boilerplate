// @ts-check
import globals from 'globals';
import { baseConfig } from './base.mjs';

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
      // The backend used to switch off `no-explicit-any` and three `no-unsafe-*`
      // rules and downgrade `no-floating-promises` to a warning. That mattered
      // more than the tsconfig in practice: the linter stayed silent on a
      // hand-written `any`, and an unawaited promise in a service — a lost error
      // with no stack trace — only warned.
      //
      // Where a Nest idiom genuinely needs an escape, add a file-scoped override
      // with a comment naming the reason. Never widen the shared config.
      rules: {},
    },
  ];
}

export default backendConfig;
