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
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
    },
  ];
}

export default backendConfig;
