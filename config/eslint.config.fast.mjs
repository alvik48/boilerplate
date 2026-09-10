// Config for the pre-commit hook only. Package `lint` scripts keep using their
// own type-aware configs; this one is invoked explicitly by lint-staged with
// --config plus --no-config-lookup, so living outside the repository root costs
// nothing: `eslint.config.fast.mjs` was never a name ESLint's own lookup
// considers, and every pattern in the rule set is `**/`-anchored.
//
// See packages/eslint-config/fast.mjs for why the rule set is split this way.
import { fastConfig } from '@packages/eslint-config/fast';

export default fastConfig();
