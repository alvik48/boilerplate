// @ts-check
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { baseConfig } from './base.mjs';

export function reactLibraryConfig(tsconfigRootDir) {
  return [
    ...baseConfig(tsconfigRootDir),
    {
      ignores: ['node_modules/**'],
    },
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
        },
      },
      plugins: {
        'react-hooks': reactHooks,
      },
      rules: {
        ...reactHooks.configs.recommended.rules,
      },
    },
  ];
}

export default reactLibraryConfig;
