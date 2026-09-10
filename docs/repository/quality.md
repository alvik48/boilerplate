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
do not rewrite skill texts wholesale and bury the local edits marked inside them.
Review those files as prose; see [skills.md](skills.md#editing-a-skill).

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

### Complexity Signals

`base` reports four size and complexity measures as **warnings**, never errors:

| Rule                     | Threshold                               |
| ------------------------ | --------------------------------------- |
| `max-lines`              | 300 (blank lines and comments excluded) |
| `max-lines-per-function` | 60                                      |
| `max-depth`              | 4                                       |
| `complexity`             | 12                                      |

They are warnings on purpose. As errors they would reward splitting a file to
satisfy a counter, which produces fragments that must be read together — worse
than the long file. Treat a warning as a prompt to apply the decomposition
criteria in [code-design.md](code-design.md#decomposition-criteria), not as a
defect to silence.

Disabled for tests, and for `packages/ui/src/components/**` where the code is
vendored from the shadcn registry.

### Architecture Boundaries

Enforcement is split by what each tool can actually decide.

**`no-restricted-imports`** handles flat prohibitions on the import specifier
alone: relative escapes out of a package at any depth, deep imports into another
package's `src/**`, framework and ORM imports inside `domain/`, and Prisma
outside the data layer. Note that its `patterns` use gitignore syntax, not
minimatch — `!(index)` is inert there, and a pattern like `../../packages/**` is
anchored to exactly two levels.

**`architecture/thin-controller`** is a local rule in `@packages/eslint-config`.
See [The Thin-Controller Rule](#the-thin-controller-rule).

**dependency-cruiser** carries everything needing importer↔target correlation or
module resolution. See [Dependency Graph Checks](#dependency-graph-checks).

#### The Thin-Controller Rule

Enforces the orchestration rule from
[backend.md](backend.md#the-orchestration-rule). `max-statements` and
`max-lines-per-function` do **not** enforce it: a handler with three sequential
collaborator calls and a return is four statements in well under twenty lines.

Scope:

- Only methods carrying a route decorator on an `@Controller` class. Helper
  methods are a legitimate way to keep a handler readable.
- Injected dependencies whose names match `logger|metrics|config|tracer|clock`
  are cross-cutting and do not count. Configurable via `ignoredDependencies`.
- Flags: two or more collaborator call sites; a collaborator call inside a loop
  or callback; aliasing a collaborator into a local.
- Two mutually exclusive branches calling different collaborators are flagged
  **deliberately**, with their own message. Only one branch runs, so it is not
  "two operations" — but choosing a collaborator by request content is business
  branching, which a controller must not do.

**Known blind spot:** a private controller method that itself calls three
services. Catching that needs cross-method analysis, which the rule does not
attempt. It is a detector for known shapes, not a guarantee; review owns the
rest. If it ever proves noisy in practice, drop it rather than weakening it to a
warning — a rule that fires on legitimate code trains agents to add disable
comments, which is worse than no rule.

### Guardrail Fixtures

`packages/eslint-config/fixtures/` holds committed examples asserted in both
directions by `pnpm --filter @packages/eslint-config test`:

- `invalid/` — each file must report its expected rule and message id.
- `valid/` — each file must be completely clean.

`valid/` matters more. False positives are the failure mode that gets rules
disabled. The suite runs through ESLint's `Linter` API with type-aware rules
excluded, so the fixtures need no tsconfig or generated artifacts. The fixtures
are excluded from repo-wide lint and from dependency-cruiser, because they carry
deliberate violations.

### Exceptions Policy

A narrow, file- or line-scoped `eslint-disable` with a comment naming the reason
is acceptable.

Widening or removing a rule in the shared config to make CI green is **not** —
that silently drops the guarantee for every package in the repository.

### Dependency Graph Checks

```sh
pnpm deps:check
```

Runs dependency-cruiser over `apps packages templates` against
`.dependency-cruiser.cjs`. It carries the rules ESLint provably cannot express,
because `no-restricted-imports` sees only the import string and never the
importing file's location:

| Rule                             | Severity | Catches                                                                                                             |
| -------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `no-circular`                    | error    | Import cycles                                                                                                       |
| `not-to-dev-dep`                 | error    | Runtime code importing a devDependency                                                                              |
| `no-orphans`                     | warn     | Modules nothing imports (package export entries excluded)                                                           |
| `domain-stays-pure`              | error    | `domain/` reaching NestJS, Prisma or `data/`, **including transitively**                                            |
| `shared-must-not-reach-features` | error    | `src/shared` depending on `src/features`                                                                            |
| `feature-entry-points-only`      | error    | Importing another feature's internals rather than its `index.ts` / `server.ts`                                      |
| `no-sibling-package-escape`      | error    | `../../ui/src/lib/utils` — a sibling-package escape with no `packages/` segment, which defeats every string pattern |

It runs against **resolved** paths, so aliases and re-export chains are followed
rather than string-matched.

### Cache Invalidation

A shared-config change must re-run the dependent checks, or the guardrails go
stale without anyone noticing. This is not automatic: `lint` and `typecheck`
declare explicit `inputs` pointing at `packages/eslint-config` and
`packages/typescript-config` respectively.

Without them, packages whose `lint` does not depend on a `build` task —
`@packages/ui`, both app templates, the DB template — stayed cache HITs after a
`base.mjs` edit and silently skipped the new rules. Verify after changing task
wiring:

```sh
pnpm lint                                    # warm the cache
# edit packages/eslint-config/base.mjs
pnpm exec turbo run lint --dry=json          # every lint task must show MISS
```

Note that a package-specific task entry such as `@apps/frontend.docs#lint`
**replaces** the generic entry rather than merging with it, so its `inputs` must
repeat the shared-config paths.

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

Each template ships a working test setup, so an app copied from one is covered
from the first commit rather than silently skipped by `turbo run test`:

| Template                  | Unit tests                                          | Other                                      |
| ------------------------- | --------------------------------------------------- | ------------------------------------------ |
| `templates/apps.backend`  | Jest (`*.spec.ts` under `src/`)                     | `node --test` contract tests under `test/` |
| `templates/apps.frontend` | `node --test` with `tsx` (`tests/*.test.ts`)        | Playwright (`pnpm test:browser`)           |
| `templates/packages.db`   | `node --test` (`tests/*.test.mjs`, against `dist/`) | —                                          |

`node --test` and Playwright mirror what `apps/frontend.docs` already uses. Do
not introduce Vitest.

`test:browser` is a separate task from `test`; `turbo run test` does not imply
it. Both run in CI.

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

## Continuous Integration

`.github/workflows/ci.yml` runs on pushes to `main` and on every pull request,
in two jobs:

- **verify** — `turbo run lint typecheck test build`, then `pnpm deps:check` and
  `pnpm docs:check`, then `git diff --exit-code` so a green run cannot depend on
  an autofix applied inside the runner.
- **browser** — installs Chromium and runs `turbo run test:browser`, uploading
  the Playwright report on failure.

They are separate jobs on purpose: `turbo run test` does **not** imply
`test:browser`, and a browser-download outage must not block the type and lint
signal.

Making these **required status checks** is a GitHub branch-protection setting
that has to be enabled in repository settings. It cannot be committed.

## Pre-Commit And Commit Messages

Husky pre-commit runs `lint-staged`: Prettier plus a **syntax-only** ESLint pass
over staged files.

```sh
pnpm exec lint-staged
```

The hook previously ran `pnpm build && pnpm lint`. Swapping that for
`turbo run lint typecheck` would not have helped: `@apps/frontend.docs#lint`
depends on `docs:prepare` → `docs:generate` → `^build`, so linting the docs app
builds the backend template. And the docs app's type-aware rules genuinely need
the generated `.source` types — measured, ESLint on `src/lib/source.ts` exits 0
with `.source` present and 1 without it. So the fix is to split the **rule set**,
not the file list.

`@packages/eslint-config/fast` (via root `eslint.config.fast.mjs`) drops the
`typescript-eslint` type-checked rules and keeps everything decidable from the
AST — including the import boundaries and `architecture/thin-controller`, neither
of which needs type information. Type-aware lint, `typecheck`, `build`, `test`
and the generators they need all run in CI.

Measured on one edited shared-UI file: **16.4s → 1.5s**.

`fast` and `base` share their style rules from `packages/eslint-config/rules/style.mjs`.
Declaring them separately made the hook demand an import order that `pnpm lint`
then rejected.

**Do not add `tsc` over staged files.** Passing a file list builds a different
program than the project and silently changes the result. If typechecking belongs
in a hook at all, run `tsc -p <project> --noEmit` with the project's generated
artifacts already present.

Commitlint extends conventional commits and requires a non-empty scope:

```text
feat(frontend.admin): add shell navigation
fix(backend.core): validate health config
chore(db-core): regenerate prisma client
```

## Definition Of Done

A code change is complete when:

- The documents and skills loaded, and the owning boundary, were stated before
  editing. See [change-workflow.md](change-workflow.md).
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
- Relevant format, lint, typecheck, build, test, and `pnpm deps:check` commands
  passed.
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
