// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

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
      rules: {
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
      },
    },
  );
}

export default baseConfig;
