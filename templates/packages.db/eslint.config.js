import { baseConfig } from '@packages/eslint-config/base';

export default [
  ...baseConfig(import.meta.dirname),
  {
    ignores: ['generated/**', 'dist/**'],
  },
];
