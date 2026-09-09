// @ts-check
import { reactLibraryConfig } from '@packages/eslint-config/react-library';

export default [
  ...reactLibraryConfig(import.meta.dirname),
  {
    // Registry code is vendored from shadcn and refreshed through its CLI, so it
    // keeps the upstream `function Component() {}` shape. Enforcing func-style
    // here would conflict with every `shadcn add` update.
    files: ['src/components/**/*.tsx', 'src/lib/utils.ts'],
    rules: {
      'func-style': 'off',
    },
  },
];
