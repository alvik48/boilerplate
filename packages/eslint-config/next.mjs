// @ts-check
import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { baseConfig } from './base.mjs';

export function nextConfig(tsconfigRootDir) {
  return [
    ...baseConfig(tsconfigRootDir),
    {
      ignores: [
        '.next/**',
        'next-env.d.ts',
        'node_modules/**',
        'postcss.config.mjs',
      ],
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
        '@next/next': nextPlugin,
        'react-hooks': reactHooks,
      },
      settings: {
        next: {
          rootDir: tsconfigRootDir,
        },
      },
      rules: {
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs['core-web-vitals'].rules,
        ...reactHooks.configs.recommended.rules,
      },
    },
  ];
}

export default nextConfig;
