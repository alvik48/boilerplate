---
name: project-migration-workflow
description: |
  Procedure for moving a project that currently lives outside this workspace into
  it: inventory, owner mapping, a green skeleton from templates/*, then one
  vertical slice at a time until the legacy service is decommissioned. Triggers
  on: migrating, porting, importing, adopting, or absorbing an existing
  repository, service, app, worker, or script; "move my Express/Fastify/Koa/
  CRA/Vite/standalone Next project into the monorepo"; "put this project on the
  boilerplate's rails"; onboarding or rehoming legacy code; "перенести проект в
  монорепу", "перевести проект на рельсы шаблона", "портировать сервис".

  Use when the source code starts outside this workspace. For a feature inside a
  package that already exists here, use project-feature-workflow instead. Not for
  dependency upgrades, and not for moving code between existing workspace
  packages.
metadata:
  owner: project
  source: local
---

# Project Migration Workflow

A procedure, not a rulebook. It **links** the rules rather than restating them,
so it cannot drift from them.

Project documents beat this skill wherever they disagree; see
[precedence](../../../docs/repository/development-rules.md#precedence).

## Why not a single port commit

The target shape is not described anywhere in prose — it is encoded in
`templates/*` and in the gates. Legacy code meets those gates all at once, so a
one-shot port opens `architecture/thin-controller`, `domain-stays-pure`, strict
type-aware lint, phantom dependencies and missing integration guides
simultaneously. Dozens of concurrent failures cannot be attributed to a cause,
which is what makes a big-bang port unrecoverable rather than merely slow.

So: **a green skeleton first, then one vertical slice at a time**, each ending on
a passing gate run. The legacy project keeps serving traffic until its last slice
is cut over.

## State lives in one plan file

Create `.agents/plans/<slug>-migration.md` and keep the inventory, the owner map,
the slice queue and the decisions there. Rules and lifecycle:
[temporary implementation plans](../../../docs/repository/change-workflow.md#temporary-implementation-plans).

Use [references/inventory-template.md](references/inventory-template.md) as its
starting structure. One slice in flight at a time; a resumed session reads the
plan, not the diff.

## 1. Inventory the source, change nothing

Read-only pass over the legacy project. Record, with file paths:

- entry points and processes (HTTP server, workers, cron, CLI);
- the HTTP surface, one row per operation: method, path, auth, request and
  response shape, current consumers;
- persistence: schema, ORM, migration history, raw SQL;
- env variables and where each is read;
- outbound integrations and their credentials;
- build, test, and lint tooling, with versions;
- dependencies, with versions and which ones are actually imported.

Boundary decisions depend on the whole surface, so an edit before the inventory
is a decision taken without the data. Dead code found here is deleted at the
source, not carried across.

**Exit:** every legacy file is accounted for by some row, or explicitly listed as
dropped.

## 2. Map every row to an owner

Each inventory row gets an address, or is dropped:

| Legacy thing                      | Target                                                           |
| --------------------------------- | ---------------------------------------------------------------- |
| One deployable HTTP process       | `apps/backend.<name>`                                            |
| One deployable UI                 | `apps/frontend.<name>`                                           |
| Schema, migrations, query helpers | `packages/db-<domain>` — never inside an app                     |
| Code a **second** app imports     | `packages/<name>`                                                |
| Code one app imports              | Stays in that app                                                |
| A pattern new packages inherit    | `templates/*`                                                    |
| Unused, duplicated, or superseded | Dropped, recorded in the plan                                    |

Rules that decide the hard cases:
[package boundaries](../../../docs/repository/structure.md#package-boundaries),
[naming conventions](../../../docs/repository/structure.md#naming-conventions),
and the reuse corollary in
[code-design.md](../../../docs/repository/code-design.md#anti-over-engineering) —
code moves to a shared package when a second consumer actually imports it, not
because a legacy `utils/` folder happened to hold it.

Record rejected placements with their reason. Without that, the next session
re-litigates the same choice.

**Exit:** the owner map is in the plan, and no row reads "somewhere in
`packages/`".

## 3. Stand up a green skeleton, with no legacy code in it

Copy the template and complete **every** adaptation in
[templates.md](../../../docs/repository/templates.md) for that template — package
name, ports, metadata, README, `.env.example`. For a backend app that also means
the registration chain, which nothing discovers by convention:

- `apiContract` metadata in `package.json` (`kind`, `serviceId`, `artifact`);
- a service entry with per-operation `guides` in `apps/frontend.docs/services.ts`;
- an `@apps/<package>#openapi:check` edge on `@apps/frontend.docs#docs:generate`
  in `turbo.json`, which must stay strict JSON — see
  [comments in turbo.json](../../../docs/repository/quality.md#comments-in-turbojson),
  because a stray comment there fails every root gate with a docs-app error
  message.

Then run the full gate set on the empty skeleton:

```sh
pnpm install
pnpm exec turbo run lint typecheck test build --filter=<package>
pnpm deps:check
pnpm docs:check
```

This is the green baseline. Skip it and the first slice's failures are
indistinguishable from an incomplete registration.

**Exit:** all four commands pass with no legacy code present.

## 4. Reconcile dependencies, versions, and test runners

Its own phase, because this is where "mysterious" failures come from later.

- Declare every dependency in the package that imports it, even when the root
  manifest has it. Shared versions go in the `catalog:` block and are referenced
  as `"catalog:"`; cross-package deps use `workspace:*`. Both rules, and why a
  phantom dependency survives local runs but not `pnpm deploy`:
  [dependency rules](../../../docs/repository/development-rules.md#dependency-rules).
- Map the legacy test runner onto what the templates already use — Jest,
  `node --test`, Playwright — per
  [tests](../../../docs/repository/quality.md#tests). **Do not introduce Vitest.**
- A legacy version that cannot be adopted is recorded in the plan with the
  reason, not silently pinned.

**Exit:** `pnpm install` is clean, the gate set still passes, and no package
relies on a transitive dependency.

## 5. Port one vertical slice at a time

A slice is one capability end to end — usually one resource or one screen. Per
slice:

1. **Characterization test first.** Legacy behavior is the specification and it
   is almost never written down. Port with no test and "equivalent" is
   unverifiable. Same rule as a regression test in
   [testing proportionality](../../../docs/repository/code-design.md#testing-proportionality).
2. **Place each piece by responsibility**, not by its legacy filename:
   [backend layers](../../../docs/repository/backend.md#layer-responsibilities),
   [frontend structure](../../../docs/repository/frontend.md#application-structure),
   [state ownership](../../../docs/repository/frontend.md#state-ownership). A
   layer appears when its responsibility appears.
3. **Copy the shape from the reference features** and follow
   [project-feature-workflow](../project-feature-workflow/SKILL.md) for the code
   itself. This skill does not repeat it.
4. **Gates, then one commit** with a conventional scope — see
   [commit messages](../../../docs/repository/quality.md#pre-commit-and-commit-messages).

**A file is never moved as-is into a layer folder.** Its shape is the reason the
legacy code fails the gates; relocating it only moves the failure.

**Exit per slice:** the gate set passes, the characterization test passes against
the new implementation, and the slice is ticked off in the plan.

## 6. Publish the external contract

For every ported HTTP operation: regenerate the contract, then author the guide.

```sh
pnpm openapi:generate
pnpm docs:check
```

`docs:check` requires an authored guide per operation, so a 40-endpoint service
cannot be documented in one pass at the end — this is a reason slices stay small.
Content requirements and what a guide must explain:
[documentation.md](../../../docs/repository/documentation.md) and the
[integration index](../../../docs/integration/README.md). Generated schemas are
not a substitute for the workflow, error, and compatibility prose.

Existing consumers of the legacy service need the differences spelled out: base
URL, auth, error shape, removed fields, and the cutover window.

**Exit:** `pnpm docs:check` passes and every ported operation has a guide.

## 7. Cut over, then decommission

1. Parity check: same inputs against legacy and new, responses compared.
2. Move env and secrets per [env.md](../../../docs/repository/env.md); `.env`
   files are never committed.
3. Switch traffic.
4. Delete the legacy code only after parity holds.
5. Write the resulting architecture and decisions into permanent docs, then
   delete the plan file.

**Exit:** the [Definition of Done](../../../docs/repository/quality.md#definition-of-done)
holds for the whole migration, and `.agents/plans/` no longer has this plan.

## Invariants

Five rules that close the ways an agent breaks a migration:

- **Every phase ends on a command with an exit code.** Progress is decided by
  that code, never by "looks done".
- **The plan file is the only state.** One slice in flight.
- **Legacy code is a read-only input** until its slice is cut over. Editing
  source and target together destroys the parity check.
- **A red gate is never fixed by widening a shared config.** Narrow, commented
  `eslint-disable` is allowed; changing `packages/eslint-config` to go green is
  not — [exceptions policy](../../../docs/repository/quality.md#exceptions-policy).
- **Behavior-preserving and shape-changing edits go in separate commits.**
  Otherwise `git bisect` cannot find a ported regression.

## Where legacy shapes fail, and what to do

The most common rejections, with the gate that catches each:

| Legacy shape                                  | Rejected by                                      | Target                                                      |
| --------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| Route handler holding the business sequence   | `architecture/thin-controller`                   | Thin controller + use-case service                           |
| ORM entities with business methods            | `domain-stays-pure`, including transitively      | Pure functions in `domain/`, mapping in `data/`              |
| Schema and migrations inside the app          | Review, [database access](../../../docs/repository/backend.md#database-access) | `packages/db-<domain>`, consumed through its exports        |
| `utils/index.ts` re-exporting everything      | `no-orphans`, anti-over-engineering              | Split by purpose, named exports only                         |
| `require('../../other/module')`               | `no-restricted-imports`, `no-sibling-package-escape` | Module or package public entry                           |
| Importing another feature's internals         | `feature-entry-points-only`                      | Its `index.ts` / `server.ts` — never `export *`              |
| `export function handler()`                   | `func-style`, and it is **not** autofixable      | `export const handler = () => {}`                            |
| Config singleton reading `process.env` on import | Review                                        | `ConfigModule.forRoot({ isGlobal: true })`                   |
| Client-side `useEffect` fetch                 | [state ownership](../../../docs/repository/frontend.md#state-ownership) | Server Component fetch in the feature's `api/`    |
| Filters or pagination in `useState` or Redux  | [state ownership](../../../docs/repository/frontend.md#state-ownership) | The URL (`searchParams`)                          |
| Vitest suite                                  | [tests](../../../docs/repository/quality.md#tests) | Jest, `node --test`, or Playwright                         |
| One process serving HTTP **and** workers      | [package boundaries](../../../docs/repository/structure.md#package-boundaries) | Separate apps, or `apiContract.kind: worker` with a reason |

Import order and blank-line violations are autofixable — run
`pnpm --filter <package> lint:fix` and stop hand-fixing them. `func-style` is
not, because converting a declaration to an expression changes hoisting.

## Worked example

A standalone Express service with `routes/`, `models/` (Sequelize), `utils/`, and
a Jest suite:

1. **Inventory** — 11 operations, 6 Sequelize models, 3 env vars, `utils/` is 4
   real helpers plus 2 dead files.
2. **Owners** — one `apps/backend.billing`; models become
   `packages/db-billing` with Prisma; 2 of the 4 helpers are imported by nothing
   else and stay in the app; the dead files are dropped.
3. **Skeleton** — backend template copied, `serviceId: billing`, registered in
   `services.ts` and `turbo.json`, gates green while still empty.
4. **Dependencies** — `express` drops out, `@packages/db-billing` added as
   `workspace:*`, Jest kept, `date-fns` moved to `catalog:` since the frontend
   uses it too.
5. **Slices** — invoices first (4 operations): characterization tests from the
   legacy responses, then controller → `CreateInvoiceUseCase` → `domain/totals.ts`
   → `data/`. Sequelize's `Invoice.calculateTotal()` becomes a pure function with
   its own unit test. Commit `feat(backend.billing): port invoice operations`.
6. **Contract** — `openapi:generate`, one guide covering the invoice workflow,
   `docs:check` green.
7. **Cutover** — replay a day of production requests against both, compare, move
   DNS, delete the old repo, write the architecture into `docs/`, delete the plan.
