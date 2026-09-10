import { baseConfig } from '@packages/eslint-config/base';

export default [
  ...baseConfig(import.meta.dirname),
  {
    // `tests/**` is plain .mjs running against dist/, so it is outside the
    // TypeScript program and type-aware rules cannot resolve it. docs-core,
    // api-contracts and mcp exclude their .mjs tests the same way, by linting
    // only `src`.
    ignores: ['generated/**', 'dist/**', 'tests/**'],
  },
];
