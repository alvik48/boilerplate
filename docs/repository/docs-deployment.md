---
id: repository-docs-deployment
title: 'Documentation deployment'
description: 'Documentation deployment and verification instructions.'
type: guide
audience: [developer, agent]
---

# Documentation Deployment

Use Node.js 24.11 or newer, pnpm 10.20.0 and the monorepo root as build context.
The application is a Node deployment because `/mcp` and search have route handlers.
Static export alone is insufficient.

## Configure and Build

Set environment variables in the build process (CI secret/config store or exported
shell variables). `pnpm docs:*` does not load `.env.local` into generation scripts.
The app-local `.env.example` documents safe values; never put service credentials
in a spec or public environment URL.

- `DOCS_ORIGIN`: canonical absolute origin, default `http://localhost:3002`.
- `DOCS_SOURCE_URL`: HTTPS repository blob URL including branch or commit; default
  `https://github.com/alvik48/boilerplate/blob/main`. Use an immutable commit in production.
- `DOCS_API_BACKEND_TEMPLATE_URL`: public example API base URL, default `http://localhost:3000`.
- `DOCS_REVISION`: optional release commit/label prefix; a content hash is always appended.

```sh
pnpm install --frozen-lockfile
pnpm docs:check
pnpm docs:build
pnpm docs:package
```

`docs:package` copies Next's standalone output and static files to
`apps/frontend.docs/dist/deploy/`. Ship that directory as an immutable release.
Start from its root:

```sh
PORT=3002 HOSTNAME=127.0.0.1 node apps/frontend.docs/server.js
```

Source Markdown and backend folders are not required at runtime. PM2's
`frontend_docs` entry starts the packaged artifact from the repository checkout.
For a separate release directory, use its absolute server path and working directory.

## Reverse Proxy

Preserve Host as the canonical host and forward `/docs`, `/markdown`, `/openapi`,
`/api/search`, `/mcp`, `/llms.txt`, `/llms-full.txt` and `/sitemap.xml`. Serve Next
static assets from the same release. Terminate TLS at the proxy, limit MCP bodies to
64 KiB and apply per-client rate limits across replicas. The application additionally
allows 120 MCP requests per process per minute; clients must honor Retry-After.

POST `/mcp` uses SDK Streamable HTTP with JSON responses, no session affinity and no
long-lived GET stream. Set proxy timeouts above the application's 10-second budget.
If streaming is enabled in a future revision, disable proxy buffering for MCP.

## Atomic Releases and Rollback

Publish HTML/RSC, search, Markdown, specs and MCP from one artifact. Do not regenerate
content in a running production instance. Revision headers and MCP results identify
the release. Roll back by switching to the previous complete deployment directory;
keep service API versions independent of documentation revisions.

## Validation in CI

Run `pnpm docs:check` on every docs or contract change, including root `docs/` edits;
package-only affected selection can miss them. Run root lint, typecheck, test and
build, plus `pnpm --filter @apps/frontend.docs test:browser` after preparation.
The browser suite starts the development docs app and example backend to verify
hot reload as well as browser interactions. Validate the packaged production
artifact separately, including its routes with the backend stopped.
