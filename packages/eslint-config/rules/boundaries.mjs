// @ts-check
//
// Flat prohibitions expressible on the import SPECIFIER ALONE.
//
// `no-restricted-imports` sees only the import string, never the importing
// file's location, and matches with gitignore syntax (the `ignore` package) —
// not extglob, not minimatch. So `!(index)` is inert and `../../packages/**` is
// anchored to exactly two levels. Any rule phrased "...from outside its own X"
// is not expressible here at all and belongs in dependency-cruiser, which can
// correlate importer and target.
//
// These constants are exported so the guardrail fixture suite exercises the
// SHIPPED configuration rather than a re-declaration of it.

const DOCS = 'See docs/repository/structure.md and docs/repository/code-design.md.';

/** Relative escapes out of a package, at any depth, plus deep source imports. */
export const RESTRICTED_IMPORTS_BASE = {
  patterns: [
    {
      // The depth-anchored form (`../../packages/**`) missed
      // `../../../packages/...`. This matches a `packages` or `apps` path
      // segment at any depth.
      group: ['**/packages/**', '**/apps/**'],
      message: `Import across workspace packages by package name (@packages/x, @apps/x), not by relative path. A relative escape bypasses package exports and Turbo's dependency graph. ${DOCS}`,
    },
    {
      // Leaves real subpath exports (`@packages/ui/components/button`) alone.
      group: ['@packages/*/src/**', '@apps/*/src/**'],
      message: `Import another package through its declared exports, not its source tree. Reaching into src/** bypasses the package's public surface. ${DOCS}`,
    },
  ],
};

/** Domain code stays free of the framework, the ORM, and the data layer. */
export const RESTRICTED_IMPORTS_DOMAIN = {
  paths: [
    {
      name: '@prisma/client',
      message:
        'Domain code must not import Prisma. Business invariants belong in plain functions and classes that are testable without a database. See docs/repository/backend.md, "Layer Responsibilities".',
    },
  ],
  patterns: [
    {
      group: ['@nestjs/*', '@nestjs'],
      message:
        'Domain code must not import @nestjs/*. It holds business invariants, calculations and state transitions as plain functions and classes, testable without HTTP. See docs/repository/backend.md, "Layer Responsibilities".',
    },
    {
      group: ['**/data/**', '**/*.repository', '**/generated/prisma/**'],
      message:
        'Domain code must not reach into the data layer; the dependency runs the other way. See docs/repository/backend.md, "Layer Responsibilities".',
    },
  ],
};

/** Prisma belongs to the data layer and to packages/db-*. */
export const RESTRICTED_IMPORTS_BACKEND = {
  ...RESTRICTED_IMPORTS_BASE,
  paths: [
    {
      name: '@prisma/client',
      message:
        'Query construction and row mapping belong in <feature>/data/* or a packages/db-* package, not in controllers or use-case services. See docs/repository/backend.md, "Layer Responsibilities".',
    },
  ],
  patterns: [
    ...RESTRICTED_IMPORTS_BASE.patterns,
    {
      group: ['**/generated/prisma/**'],
      message:
        'Import the database package through its exports rather than its generated client. See docs/repository/databases.md.',
    },
  ],
};

/** The data layer is exactly where Prisma is allowed, so re-allow it there. */
export const RESTRICTED_IMPORTS_DATA = RESTRICTED_IMPORTS_BASE;
