import { nextConfig } from '@packages/eslint-config/next';
export default [
  ...nextConfig(import.meta.dirname),
  {
    ignores: [
      '.source/**',
      'generated/**',
      'next.config.mjs',
      'scripts/*.mjs',
      'tests/**/*.mjs',
      'test-results/**',
      'playwright-report/**',
    ],
  },
];
