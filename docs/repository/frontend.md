---
id: repository-frontend
title: 'Frontend Development'
description: 'Frontend Development for contributors working in this monorepo.'
type: guide
audience: [developer, agent]
---

# Frontend Development

Frontend apps are Next.js App Router applications under `apps/frontend.<name>`.

## Starting Point

Create new frontend apps by copying `templates/apps.frontend`. See
[templates.md](templates.md).

The template includes:

- Next.js 16.
- React 19.
- App Router under `src/app`.
- ESLint and Prettier scripts.
- A placeholder page and metadata that must be replaced for a real app.

See [code-design.md](code-design.md) for decomposition, over-engineering, and
performance rules that apply to every change.

## Application Structure

```text
src/app/**             routes only: layout, page, error, loading, route handlers.
                       Composition and kicking off server data loading.
                       No business branching.
src/features/<name>/   ui/       feature components
                       model/    hooks, state, business logic
                       api/      server functions, fetchers, server actions
                       index.ts  client-safe public entry: UI, hooks, types
                       server.ts public entry for server-only code (add when needed)
src/shared/            app-local primitives and helpers not worth promoting
packages/ui            cross-app primitives only
```

Rules:

- A page composes and lays out. Business rules, multi-step flows, and non-trivial
  transformations get named functions, hooks, or modules inside the feature.
- Features import other features only through those public entries.
- `shared` never imports `features`.
- **A business component does not move to `packages/ui` because it might be
  reused.** It moves when a second app actually imports it.
- Pushing `'use client'` up a file to satisfy one interactive child is a
  decomposition signal — extract the interactive part instead of converting the
  parent.

### Feature Public Entries

Public entries are split **by environment**, not merged into one barrel. A single
`index.ts` re-exporting both client components and server fetchers pulls
server-only dependencies into the client graph the moment anything imports it,
and it is the catch-all barrel
[code-design.md](code-design.md#anti-over-engineering) already rules out.

- `index.ts` — client-safe only: components, hooks, types.
- `server.ts` — fetchers, data access, anything importing `server-only`.
- Each entry re-exports a **named** public API. Never `export *`.
- Modules that must never reach the browser import the `server-only` package,
  which turns a boundary violation into a build error rather than a silent leak.
- Server Actions are importable from Client Components by design — that is not a
  violation. Keep them in `api/` and export them from whichever entry their
  consumers use.

Reference:
[Preventing environment poisoning](https://nextjs.org/docs/app/getting-started/server-and-client-components#preventing-environment-poisoning).

## State Ownership

| State                                                              | Owner                                                                                                |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Ephemeral UI: menu open, hover, local toggle                       | `useState` in the nearest owning component                                                           |
| Form values                                                        | The form root                                                                                        |
| Filters, sort, pagination that must survive reload or be shareable | The URL (`searchParams`)                                                                             |
| Server data                                                        | Server Component fetch or route cache. A client cache only when the client genuinely owns refetching |
| Shared by sibling components                                       | Nearest common parent                                                                                |
| Genuinely app-wide: theme, session, locale                         | One documented provider                                                                              |
| Derivable from other state                                         | Not stored — derived during render                                                                   |

A deliberate editable draft of server data is separate state, and belongs to
whichever component owns the edit.

**Hard rule: no `useEffect` that copies props into state, or that keeps two
copies of the same value in sync.** Derive during render, lift the state, or key
the component instead.

Reference:
[Choosing the state structure](https://react.dev/learn/choosing-the-state-structure).

## Next.js Rules

- Prefer Server Components by default.
- Add `'use client'` only where browser state, effects, event handlers, or
  browser-only APIs are required.
- Keep server-only code out of Client Components.
- Treat `params`, `searchParams`, `cookies()`, and `headers()` as async APIs in
  modern Next.js.
- Use `next/image` for images unless a specific exception is justified.
- Use `next/font` for app fonts when adding custom typography.
- Use route handlers for HTTP integration points and Server Actions for form or
  mutation flows owned by the UI.
- Add `error.tsx`, `not-found.tsx`, loading states, and Suspense boundaries when
  the route shape needs them.
- If enabling Cache Components, use `cacheComponents: true`, `use cache`,
  `cacheLife`, and `cacheTag` deliberately. Do not read runtime APIs inside
  cached functions unless using `use cache: private`.

## Shared UI Package

Use `packages/ui` for reusable UI primitives and shared visual system pieces.
The package currently exports:

- `./styles.css` and `./globals.css`.
- `./components/*`.
- `./lib/*`.
- `./themes/*`.

There is deliberately no `./hooks/*` export. Add one together with the first
hook that two apps actually import, not before — an export subpath pointing at a
directory that does not exist is a broken contract, and inventing a hook to
justify the subpath is a speculative abstraction.

Rules:

- App-specific layouts and pages stay in the app.
- Components reused by multiple apps belong in `packages/ui`.
- Use package exports such as `@packages/ui/components/button`.
- Do not import internal source files through relative paths.
- Keep `packages/ui/components.json` as the shadcn source of truth.

## shadcn And Styling

- Check existing `packages/ui/src/components` before adding a new component.
- Use shadcn CLI or MCP tooling for registry components.
- Prefer existing component variants before adding custom styling.
- Use semantic tokens and CSS variables rather than raw one-off color classes.
- Use `lucide-react` icons because `packages/ui/components.json` sets
  `iconLibrary` to `lucide`.
- For shared UI changes, verify exports and consumers.

## Environment

- Browser-exposed variables must use `NEXT_PUBLIC_`.
- Secrets must stay server-side and must not be read by Client Components.
- Commit app-local `.env.example`; do not commit `.env`.

See [env.md](env.md).

## Quality Commands

```sh
pnpm --filter @apps/frontend.<name> lint
pnpm --filter @apps/frontend.<name> typecheck
pnpm --filter @apps/frontend.<name> build

pnpm --filter @packages/ui lint
pnpm --filter @packages/ui typecheck
```

When changing visible UI, run the app and verify in a browser. For Next.js apps,
prefer Next.js runtime diagnostics and browser verification over plain HTTP
fetches.

## Skills

Load these local skills when working on frontend code:

- `next-cache-components-adoption` when enabling Cache Components or migrating
  an existing app to use them.
- `next-cache-components-optimizer` for cache boundaries and prerendering
  performance in apps using Cache Components.
- `frontend-design` for substantial visual design or redesign tasks.
- `shadcn` for shared UI components, registries, forms, icons, and composition.
- `typescript-magician` for type issues.

For App Router, RSC boundaries, metadata, route handlers, images, fonts,
hydration, and Next.js upgrades, consult documentation matching the app's
installed Next.js version through `next-devtools`. The upstream
`next-best-practices` and `next-upgrade` skills have been retired.

See [skills.md](skills.md) for the source migration and
[mcp-servers.md](mcp-servers.md) for Next.js tooling.

## Documentation Application

`apps/frontend.docs` was copied from the frontend template and serves Fumadocs on
port 3002. Its server routes expose search, Markdown, specs and public MCP using a
single generated manifest. Integration, API and Repository are peer navigation
sections selected through the sidebar dropdown, with per-section page lists.
Root Markdown is normalized into a generated
collection, and new pages require no route code.

Use `pnpm docs:dev` and `pnpm docs:build` so contract generation and Fumadocs
preparation run first. The pinned playground's credential persistence is disabled
through a reviewed pnpm patch. [Deployment](docs-deployment.md) requires Node and
bundles content; the docs application does not use static export.
