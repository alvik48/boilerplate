# Project Documentation App

Fumadocs application copied from `templates/apps.frontend`, renamed and configured
for public Integration, API and Repository sections. Local port: 3002.

## Compatibility

Validated with Node.js 24.11.0, pnpm 10.20.0, Next.js 16.2.9, React 19.2.5,
TypeScript 6.0.3 and Tailwind 4.2.4. Pinned documentation dependencies:

| Package                     | Version            |
| --------------------------- | ------------------ |
| fumadocs-core / fumadocs-ui | 16.15.8            |
| fumadocs-mdx                | 15.4.0             |
| fumadocs-openapi            | 11.4.1             |
| @modelcontextprotocol/sdk   | 1.30.0             |
| @nestjs/swagger             | 11.4.4 (NestJS 11) |

ESM is used by the docs app/core/MCP; the shared API package is CommonJS-compatible
for the backend template. The Next config is ESM. Build and prepare use Fumadocs'
configuration collection API, not an external scaffold.

Upstream Fumadocs persists auth inputs by default. The small reviewed pnpm patch in
`patches/fumadocs-openapi@11.4.1.patch` adds `persistAuthorization`; our APIPage sets
it to false and omits browser cookies. Revalidate the patch and authenticated browser
fixture when upgrading. Server environment selection may persist; credentials do not.

## Commands from the Repository Root

```sh
pnpm docs:dev
pnpm docs:generate
pnpm docs:check
pnpm docs:build
pnpm docs:package
pnpm --filter @apps/frontend.docs test:browser
```

The Turbo graph prepares shared packages and backend artifacts before Fumadocs
imports, typechecking and builds. Direct package commands assume their prerequisites
already exist. `docs:dev` runs the Next server alongside single-writer docs and
backend contract watchers. Root docs changes, including add/rename/delete, regenerate
all publication surfaces. Backend source changes compile via Nest before regeneration.
Registry/dependency changes require restarting the development command.

## Content and Routes

`docs/` is canonical. Generation emits normalized Markdown into `generated/content`,
contracts into `generated/openapi`, and `generated/manifest.json`. Fumadocs preparation
emits `.source/`. All are ignored. Authoring source links resolve through the manifest;
there are no hand-maintained website or AI copies.

Published routes: `/docs`, `/api/search`, `/docs.md`, `/docs/<slug>.md`, `/llms.txt`,
`/llms-full.txt`, `/openapi/<service>.json`, `/mcp`, `/sitemap.xml`.
The SDK supports protocol 2025-11-25 and its legacy list; tests cover the current
client and 2025-03-26. No backend is contacted when serving docs or MCP.

`/test-fixtures/playground` exists only in development with `DOCS_TEST_FIXTURES=1`
for the browser test suite. Production always returns 404. Its echo API is test-only,
not in the service registry, manifest, search or MCP.

See [authoring rules](../../docs/repository/documentation.md),
[deployment](../../docs/repository/docs-deployment.md), and
[MCP consumers](../../docs/integration/mcp/README.md).

## Upstream References

- [Fumadocs collections](https://www.fumadocs.dev/docs/mdx/collections)
- [Fumadocs Next integration](https://www.fumadocs.dev/docs/mdx/next)
- [Fumadocs OpenAPI](https://www.fumadocs.dev/docs/integrations/openapi)
- [Nest OpenAPI](https://docs.nestjs.com/openapi/introduction)
- [Official MCP SDK v1](https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x)
