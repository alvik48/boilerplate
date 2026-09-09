/**
 * Graph rules that ESLint provably cannot express.
 *
 * `no-restricted-imports` sees only the import STRING, never the importing
 * file's location, so every rule phrased "...from outside its own X" is
 * inexpressible there. dependency-cruiser correlates importer and target and
 * resolves modules, so it can also follow aliases (`@/...`) and re-export chains
 * rather than string-matching them.
 *
 * See docs/repository/quality.md, "Dependency Graph Checks".
 */

const { readdirSync, readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

/**
 * Sources behind a package's declared `exports` are entry points by definition,
 * so nothing in this repository importing them does not make them orphans.
 *
 * Derived from the manifests rather than hardcoded, so adding an export does not
 * silently produce a new false warning.
 */
const packageExportEntryPatterns = () => {
  const patterns = new Set();

  for (const workspace of ['apps', 'packages', 'templates']) {
    if (!existsSync(workspace)) {
      continue;
    }

    for (const entry of readdirSync(workspace, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const manifestPath = join(workspace, entry.name, 'package.json');

      if (!existsSync(manifestPath)) {
        continue;
      }

      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

      for (const target of JSON.stringify(manifest.exports ?? {}).matchAll(/\.\/(?:dist\/)?(?:src\/)?([\w./-]+?)\.(?:js|ts|tsx|mjs|cjs)/g)) {
        patterns.add(`${workspace}/${entry.name}/src/${target[1]}\\.tsx?$`);
      }
    }
  }

  return [...patterns];
};

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'An import cycle makes module initialization order significant and defeats tree-shaking. Extract the shared piece into its own module.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'not-to-dev-dep',
      severity: 'error',
      comment:
        'Runtime code must not import a devDependency: it resolves locally and disappears from a pruned production install.',
      from: { path: '^(apps|packages|templates)', pathNot: '\\.(spec|test)\\.[cm]?[jt]sx?$|/(tests?|fixtures)/' },
      to: { dependencyTypes: ['npm-dev'], dependencyTypesNot: ['type-only'] },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'An orphan module is imported by nothing. Either wire it up or delete it.',
      from: {
        orphan: true,
        pathNot: [
          '\\.d\\.ts$',
          '(^|/)\\.[^/]+\\.[cm]?[jt]s$',
          '\\.config\\.[cm]?[jt]s$',
          '(^|/)(main|index|layout|page|route|sitemap|not-found|error|loading)\\.[cm]?[jt]sx?$',
          ...packageExportEntryPatterns(),
        ],
      },
      to: {},
    },

    // ---------------------------------------------------------------------
    // Layer rules. The domain rule is duplicated from ESLint on purpose: this
    // one also catches TRANSITIVE reach, which a specifier-only rule cannot see.
    // ---------------------------------------------------------------------
    {
      name: 'domain-stays-pure',
      severity: 'error',
      comment:
        'Domain code holds business invariants as plain functions and classes, testable without HTTP and without a database. See docs/repository/backend.md, "Layer Responsibilities".',
      from: { path: '/domain/' },
      to: {
        path: '(^|/)node_modules/(@nestjs|@prisma)/|/data/|/generated/prisma/',
      },
    },
    {
      name: 'shared-must-not-reach-features',
      severity: 'error',
      comment:
        'src/shared holds app-local primitives. Depending on a feature inverts the direction and creates cycles. See docs/repository/frontend.md, "Application Structure".',
      from: { path: '/src/shared/' },
      to: { path: '/src/features/' },
    },
    {
      name: 'feature-entry-points-only',
      severity: 'error',
      comment:
        'Import another feature through its public entry (index.ts client-safe, server.ts server-only), not its internals. The backreference on the captured feature name is what ESLint has no way to express. See docs/repository/frontend.md, "Feature Public Entries".',
      from: { path: '/src/features/([^/]+)/' },
      to: {
        path: '/src/features/([^/]+)/',
        pathNot: '/src/features/$1/|/src/features/[^/]+/(index|server)\\.[cm]?tsx?$',
      },
    },
    {
      name: 'no-sibling-package-escape',
      severity: 'error',
      comment:
        'Reach another workspace package by its package name, not through the filesystem. This catches the relative escapes that never pass through a "packages/" segment (../ui/src/lib/utils), which defeat every string pattern.',
      from: { path: '^(apps|packages|templates)/([^/]+)/' },
      to: {
        path: '^(apps|packages|templates)/([^/]+)/',
        pathNot: '^$1/$2/',
        dependencyTypes: ['local'],
      },
    },
  ],

  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: {
      path: [
        'node_modules',
        '\\.next/',
        '(^|/)dist/',
        '(^|/)generated/',
        '(^|/)coverage/',
        '(^|/)\\.turbo/',
        '(^|/)\\.source/',
        'packages/eslint-config/fixtures/',
      ],
    },
    tsPreCompilationDeps: true,
    combinedDependencies: true,
    // Resolve through each package's own tsconfig so aliases (@/...) and
    // workspace package names are followed rather than string-matched.
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
