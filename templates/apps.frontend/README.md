# Frontend Template

Copy this directory into `apps/frontend.<name>`, rename the package, adjust the
development port, then run `pnpm install` from the repository root.

A Next.js App Router application with TypeScript, ESLint, Prettier, unit tests
(`node --test` with tsx) and browser tests (Playwright).

## Layout

This is the canonical shape. See
[frontend rules](../../docs/repository/frontend.md#application-structure).

```text
src/
  app/                       routes only: layout, page, error, loading
    page.tsx                 composes; reads the filter from the URL
  features/articles/         the reference feature
    index.ts                 client-safe entry: UI, types, pure helpers
    server.ts                server-only entry: fetchers
    api/articles.server.ts   imports 'server-only'
    model/article.ts         types and pure filter logic
    ui/article-list.tsx      server component, takes data as props
    ui/article-filter.tsx    'use client' -- the only interactive piece
  shared/                    app-local pieces not worth promoting
tests/
  article.test.ts            unit tests for the pure model
  browser/articles.spec.ts   proves the filter really lives in the URL
```

What the reference feature demonstrates, each of which is a rule elsewhere:

- **The URL owns the filter.** No `useState` mirroring it, no `useEffect`
  syncing two copies. Reload, share or bookmark the page and the view is the
  same — that is what the browser test asserts.
- **`'use client'` sits on the smallest interactive piece**, not on the page.
  Pushing it up a file to satisfy one interactive child is a decomposition
  signal.
- **Two public entries, split by environment.** `index.ts` is client-safe;
  `server.ts` holds anything importing `server-only`. One barrel re-exporting
  both would drag server code into the client graph. Both use named re-exports,
  never `export *`.
- **The page composes and lays out.** No business branching lives in `app/`.

`pnpm deps:check` enforces the boundaries: features are reachable only through
their entries, and `shared` may not import `features`.

## Commands

```sh
pnpm --filter @apps/frontend-template dev
pnpm --filter @apps/frontend-template test
pnpm --filter @apps/frontend-template test:browser
pnpm --filter @apps/frontend-template lint
pnpm --filter @apps/frontend-template typecheck
```

`test:browser` needs Playwright Chromium: `pnpm exec playwright install chromium`.

Replace the articles feature and `src/shared/theme-showcase.tsx` with real ones.
They are scaffolding — keep the structure, not the content.
