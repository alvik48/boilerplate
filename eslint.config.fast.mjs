// Root config for the pre-commit hook only. Package `lint` scripts keep using
// their own type-aware configs; this one is invoked explicitly by lint-staged
// with --no-config-lookup so it never shadows them.
//
// See packages/eslint-config/fast.mjs for why the rule set is split this way.
import { fastConfig } from '@packages/eslint-config/fast';

export default fastConfig();
