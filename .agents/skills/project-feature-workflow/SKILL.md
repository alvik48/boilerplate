---
name: project-feature-workflow
description: |
  Procedure for adding or changing a feature in this monorepo, from picking the
  owning package to reviewing the final diff. Triggers on: adding a feature,
  endpoint, page, filter, form, or list; changing existing behavior; "add",
  "implement", "build", "wire up", "extend"; and on any request that names no
  architecture at all but produces code.

  Use when writing product code in apps/* or packages/*. Not for pure config,
  documentation, or dependency updates.
metadata:
  owner: project
  source: local
---

# Project Feature Workflow

A procedure, not a rulebook. It **links** the rules rather than restating them,
so it cannot drift from them.

Project documents beat this skill wherever they disagree; see
[precedence](../../../docs/repository/development-rules.md#precedence).

## 1. Identify the owner of the change

Name the app, package, or template the change belongs to before writing code.

- App-only behavior stays in `apps/*`.
- Behavior a second consumer actually imports moves to `packages/*`.
- A pattern new packages should inherit goes in `templates/*`.

"Might be reused" is not a reason to move code. A second real consumer is.

Load the documents the touched paths route to:
[path-based routing](../../../docs/repository/README.md#path-based-routing). State
which ones you loaded — that is a Definition of Done item, not a formality.

## 2. Choose the boundary and the layer for each piece

Backend — [layer responsibilities](../../../docs/repository/backend.md#layer-responsibilities):

| Piece | Goes in |
| --- | --- |
| Route, status codes, request/response DTOs | Controller — **one** call into the feature |
| Step order, sequencing, transaction boundary | Use-case service |
| Business invariants, calculations, state transitions | `domain/` — no framework imports |
| Query construction, row → domain mapping | `data/` or a `packages/db-*` package |

Frontend — [application structure](../../../docs/repository/frontend.md#application-structure)
and [state ownership](../../../docs/repository/frontend.md#state-ownership):

| Piece | Goes in |
| --- | --- |
| Layout and composition | `app/` |
| Feature components | `features/<name>/ui/` |
| Hooks, state, business logic | `features/<name>/model/` |
| Fetchers and server actions | `features/<name>/api/` |
| Filters, sort, pagination that must survive reload | **The URL** |

A layer appears when its responsibility appears. Do not create empty ones to
match the table — that is the speculative structure
[code-design.md](../../../docs/repository/code-design.md#anti-over-engineering)
rules out.

## 3. Implement against the contract

Copy the shape from the reference features rather than inventing one:

- `templates/apps.backend/src/users/` — the full stack.
- `templates/apps.backend/src/health/` — deliberately no service, because a
  constant needs none.
- `templates/apps.frontend/src/features/articles/` — URL-owned filter, the
  `index.ts` / `server.ts` split, `'use client'` on the interactive piece only.

Every new abstraction must point at a problem that exists now.

## 4. Verify behavior and dependency direction

Do not stop at typecheck. Drive the thing you changed:

```sh
pnpm --filter <package> test
pnpm --filter <package> lint
pnpm deps:check
```

- Business rule → unit test on the domain function, no HTTP and no database.
- Reproducible bug → **regression test first**, then the fix.
- Visible frontend change → run it in a browser, or a Playwright test.
- External contract change → regenerate OpenAPI, author the integration guide,
  run `pnpm docs:check`.

`deps:check` is what catches a dependency pointing the wrong way — including
transitively, which lint cannot see.

## 5. Review the final diff

Against [code-design.md](../../../docs/repository/code-design.md):

- Does any file now have two independent reasons to change?
- Is there an abstraction without a present problem — a base class, a global
  store, a wrapper with one call site, a barrel re-exporting everything?
- Is filter state anywhere other than the URL?
- Did a `'use client'` move up a file instead of the interactive part moving
  down?
- Are there tests proportional to the risk, or a stated reason there are not?
- If the change touches a critical path, are there before/after numbers?

A `max-lines` warning is a prompt to apply the decomposition criteria, not a
defect to silence and not an instruction to split on the line count.

## Worked example

Adding "cancel an order, refund it, notify the customer":

1. **Owner** — the backend app that owns orders. Not a package: nothing else
   imports it.
2. **Layers** — three collaborator calls, so a `CancelOrderUseCase` service holds
   the sequence. The controller gets one `execute(...)` call; two would fail
   `architecture/thin-controller`. Whether cancellation is *allowed* (state,
   window, already refunded) is an invariant, so it goes in
   `domain/cancellation.ts` as a plain function.
3. **Implement** — mirror `src/users/`. Refund and notification are collaborators
   the service sequences, not controller concerns.
4. **Verify** — unit-test the cancellation rule directly, including the boundary
   cases; contract-test the route; regenerate OpenAPI and author the guide.
5. **Review** — no repository interface unless one of the three justifications
   holds; no event bus because there is one consumer.
