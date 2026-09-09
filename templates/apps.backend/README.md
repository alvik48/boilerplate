# Backend Template

Copy into `apps/backend.<name>`, rename the package and its `apiContract.serviceId`,
then adapt `src/api.config.ts`, environment values and docs service registration.
Run `pnpm install` from the root.

NestJS 11 serves `GET /health` and `GET /users`, Swagger UI at `/docs`, and
`/openapi.json`. No infrastructure is required.

## Layout

This is the canonical shape. Organize by feature folder, not by technical layer
directories at `src/` root.

```text
src/
  api.config.ts, create-app.ts, main.ts, openapi.*.ts   composition root
  health/
    health.controller.ts
    dto/health-response.dto.ts        NO health.service.ts -- see below
  users/
    users.module.ts
    users.controller.ts               routes; exactly one call into the feature
    users.service.ts                  use case: step order and sequencing
    domain/user-status.ts             business rule, no framework imports
    domain/user-status.spec.ts        tested without HTTP or a database
    data/users.data.ts                record retrieval; no business decisions
    dto/user-summary.dto.ts
```

The two features are a deliberate contrast, and the contrast is the teaching:

- **`users/` carries the full layer stack** because it genuinely has each
  responsibility — a request to route, a sequence to run, a rule to decide, and
  records to fetch.
- **`health/` has no service at all.** It returns a constant, so routing it
  through an injected service would be a single-call-site wrapper. A layer
  appears when its responsibility appears; do not create empty ones to match a
  diagram.

`architecture/thin-controller` and `pnpm deps:check` enforce these boundaries.
See [backend rules](../../docs/repository/backend.md#layer-responsibilities) and
[code design](../../docs/repository/code-design.md).

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

Replace both example features with real ones. `users/` is scaffolding: keep its
layer boundaries, swap `data/users.data.ts` for a `packages/db-*` client, and
rewrite `docs/integration/users.md` for the real operation.
