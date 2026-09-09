---
id: repository-quality
title: 'Quality'
description: 'Quality for contributors working in this monorepo.'
type: guide
audience: [developer, agent]
---

# Quality

## Formatting

Root Prettier config:

```json
{
  "printWidth": 120,
  "singleQuote": true,
  "bracketSpacing": true,
  "trailingComma": "all",
  "arrowParens": "always"
}
```

Run:

```sh
pnpm format
pnpm --filter <package> format
```

Formatting scripts write files.

Root `.prettierignore` excludes `.agents/skills` so repository-wide Prettier runs
preserve vendored skill contents and their recorded hashes. Review upstream skill
formatting as part of explicit skill maintenance rather than applying project
formatting to those files.

## Linting

Run:

```sh
pnpm lint
pnpm --filter <package> lint
pnpm lint:fix
pnpm --filter <package> lint:fix
```

`lint` never writes. `lint:fix` is the only form that applies autofixes. Every
package follows this split, so a `lint` exit code means what it says.

Do not add `--fix` back into a `lint` script. ESLint repairs the violation in the
working copy and exits 0, so CI reports success over source that was never fixed.

Shared ESLint configs live in `packages/eslint-config`:

- `@packages/eslint-config/base`.
- `@packages/eslint-config/backend`.
- `@packages/eslint-config/next`.
- `@packages/eslint-config/react-library`.

### Style Rules

Prettier owns formatting. It does not sort imports, insert blank lines, or
choose a function form, so `base` enforces those separately:

- `simple-import-sort/imports` groups imports as side effects, `node:` builtins,
  external packages, `@apps/*` and `@packages/*` workspace packages, parent
  imports, sibling imports, then styles. `simple-import-sort/exports` sorts
  re-exports.
- `@stylistic/padding-line-between-statements` requires a blank line around
  `if`, `for`, `while`, `do`, `switch`, `try`, and any braced body, before
  `return` and before every `export`, above every `case` except the first, and
  after the import block. Runs of plain `const`/`let` declarations, of imports,
  and of exports may stay packed, which leaves import and export grouping to
  the sorter. A braced statement is always separated even inside such a run, so
  a multi-line arrow assigned to a `const` still gets its blank lines. Entry
  order in the rule encodes that precedence: the last match wins.
- `curly` requires braces on every control statement, which also makes
  brace-less one-liners subject to the blank-line rule.
- `func-style` requires function expressions, so use
  `export const handler = () => {}` instead of `export function handler() {}`.
  Default exports are exempt, so Next.js pages and layouts keep their
  conventional `export default function` form.

`func-style` is disabled for `packages/ui/src/components/**` and
`packages/ui/src/lib/utils.ts`. That code is vendored from the shadcn registry
and refreshed through its CLI, so it keeps the upstream function-declaration
shape; see [frontend.md](frontend.md#shadcn-and-styling).

Blank-line and import-order violations are autofixable. `func-style` is not,
because converting a declaration to an expression changes hoisting.

## Typechecking

Run:

```sh
pnpm typecheck
pnpm --filter <package> typecheck
```

Shared TypeScript configs live in `packages/typescript-config`.

All four shared configs set `strict: true`. `nest.json` was the lone outlier —
it enabled only `strictNullChecks` and explicitly disabled `noImplicitAny` and
`strictBindCallApply` — and is now aligned. Measured cost at the time of the
change: zero errors across the backend template.

`@packages/eslint-config/backend` correspondingly no longer disables
`no-explicit-any` or the `no-unsafe-*` rules, and `no-floating-promises` is an
error rather than a warning. In practice the lint rules matter more than the
tsconfig here: an unawaited promise in a service loses its error and its stack
trace.

When class fields assigned by the framework start tripping
`strictPropertyInitialization`, use definite assignment (`declare` or `!`) on the
individual field. Do not relax the shared config.

## Tests

Run:

```sh
pnpm test
pnpm --filter <package> test
```

Backend template uses Jest. DB template uses `node --test tests/*.test.mjs`.
Add tests proportionally to risk:

- Unit tests for pure logic and service behavior.
- Integration tests for database queries and migrations.
- E2E tests for critical HTTP/API flows.
- Browser verification for visible frontend changes.

## Build

Run:

```sh
pnpm build
pnpm --filter <package> build
```

Turbo build outputs include `dist/**` and `.next/**` while excluding
`.next/cache/**`.

## Pre-Commit And Commit Messages

Husky pre-commit runs:

```sh
pnpm build
pnpm lint
```

Commitlint extends conventional commits and requires a non-empty scope:

```text
feat(frontend.admin): add shell navigation
fix(backend.core): validate health config
chore(db-core): regenerate prisma client
```

## Definition Of Done

A code change is complete when:

- Relevant repository docs and local skills were consulted.
- Affected docs were checked against the final code and config, and any drift
  was fixed in the same change.
- The change stays inside the correct app/package boundary.
- External contract or behavior changes include current integration guides,
  schemas, verified examples, and compatibility/migration guidance under
  [documentation.md](documentation.md). Verify generated references and MCP content
  for the same revision.
- New apps/packages were created from templates.
- Package names, ports, metadata, README files, and env examples were adapted.
- Cross-package dependencies are declared with `workspace:*`.
- Generated files were regenerated, not hand-edited.
- `.env` files and secrets were not committed.
- Relevant format, lint, typecheck, build, and test commands passed.
- Any skipped verification is explicitly reported with the reason.
- User-facing frontend changes were checked in a browser when a dev server can
  run.

## Documentation Validation

Run `pnpm docs:check` for content metadata, links/anchors, workspace inventory,
integration coverage, schema examples, generated artifact parity and reproducibility.
Declared JSON examples refer to actual fenced guide blocks and validate against
operation response schemas. Backend tests compare the actual HTTP response and
runtime JSON to the offline contract; MCP tests cover SDK transport and authorization.

`pnpm --filter @apps/frontend.docs test:browser` exercises navigation, scoped search,
mobile layout, real health requests, an authenticated body/error fixture, credential
nonpersistence, and root Markdown hot reload. It needs Playwright Chromium installed.
The fixture route is development-only and omitted from all public discovery surfaces.

Always review behavioral compatibility and prose accuracy, even when coverage checks
pass. Run root Markdown formatting explicitly as described in [commands](commands.md).
