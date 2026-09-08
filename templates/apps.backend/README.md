# Backend Template

Copy into `apps/backend.<name>`, rename the package and its `apiContract.serviceId`,
then adapt `src/api.config.ts`, environment values and docs service registration.
Run `pnpm install` from the root.

NestJS 11 serves `GET /health`, Swagger UI at `/docs`, and `/openapi.json`.
The typed response is `{ "status": "ok" }`. No infrastructure is required.

```sh
pnpm openapi:generate
pnpm openapi:check
pnpm --filter @apps/backend-template start:prod
```

The offline generator uses the same Nest compiler/Swagger plugin path as runtime,
with an explicit SchemaModule that has real HTTP feature modules and no infrastructure.
Add controllers to both compositions; the parity check detects differences.
`generated/openapi.json` is deterministic and ignored by Git.

`API_HOST`, `API_PORT` and `DOCS_ORIGINS` are documented in `.env.example`.
CORS allows the docs origin and GET/HEAD/OPTIONS by default. Extend methods and
headers when introducing actual product operations.

After copying: add one entry to `apps/frontend.docs/services.ts` and its
`package#openapi:check` edge to the docs generation task. Link each operation to
an authored integration guide. Worker-only backends declare `kind: worker` and
a reason instead. See [backend rules](../../docs/repository/backend.md).
