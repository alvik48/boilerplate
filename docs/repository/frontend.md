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
- `./hooks/*`.
- `./lib/*`.
- `./themes/*`.

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
