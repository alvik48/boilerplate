---
id: repository-backend
title: 'Backend Development'
description: 'Backend Development for contributors working in this monorepo.'
type: guide
audience: [developer, agent]
---

# Backend Development

Backend apps are NestJS services under `apps/backend.<name>`.

## Starting Point

Create new services by copying `templates/apps.backend`. See
[templates.md](templates.md).

The template includes:

- NestJS 11.
- `ConfigModule.forRoot({ isGlobal: true })`.
- Health controller at `/health`.
- `API_PORT` and `API_HOST` support in `src/main.ts`.
- Jest test script.
- ESLint and Prettier scripts.

## Architecture Rules

- Organize by feature module, not by technical layer folders.
- Prefer constructor injection.
- Avoid circular module dependencies.
- Keep provider exports explicit.
- Use events or queues for decoupled side effects when synchronous coupling would
  make services brittle.
- Add health checks for services that own external connections or background
  workers.

See [code-design.md](code-design.md) for decomposition, over-engineering, and
performance rules that apply to every change.

## Layer Responsibilities

| Participant                                                 | Owns                                                                                   | Must not                                                                                                |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Controller `*.controller.ts`                                | Route, status codes, request/response DTOs, auth decorators, one call into the feature | Business branching, more than one collaborator call, Prisma/HTTP client access, building domain objects |
| DTO + pipes                                                 | Shape and format of external input                                                     | Business invariants                                                                                     |
| Use-case service `<feature>.service.ts`                     | Step order, transaction boundary, cross-collaborator sequencing, mapping domain errors | SQL/query construction, HTTP framework details beyond thrown exceptions                                 |
| Domain `<feature>/domain/*`                                 | Business invariants, calculations, state transitions — plain functions and classes     | Importing `@nestjs/*`, Prisma, or HTTP clients                                                          |
| Data access `<feature>/data/*` or a `packages/db-*` package | Query construction, row → domain mapping                                               | Business decisions                                                                                      |

**This table describes responsibilities, not a mandatory folder set.** A layer
appears when its responsibility appears. A feature with no business invariants
has no `domain/`. A feature that reads nothing has no `data/`. Creating empty
layers to match the table is exactly the speculative structure
[code-design.md](code-design.md#anti-over-engineering) rules out.

Concretely: a health endpoint returning a constant needs no service at all.
Routing `{ status: 'ok' }` through an injected service is a single-call-site
wrapper, and generating one "for consistency" is the reflex this section exists
to stop.

### The Orchestration Rule

A controller method calls **at most one collaborator**.

Two or more calls onto injected dependencies belong in the use-case service —
whether sequential, inside `Promise.all`, or in different branches. Stated as
_calls_, not `await`s, because `await Promise.all([this.a.x(), this.b.y()])` is
one `await` and two operations.

```ts
// Wrong — the controller is orchestrating.
@Post()
async create(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
  const order = await this.orders.create(user.id, dto);
  await this.payment.charge(order);
  await this.notifications.sendOrderConfirmation(order);

  return order;
}

// Right — the sequence has a name and a home.
@Post()
async create(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
  return this.createOrder.execute(user.id, dto);
}
```

`@packages/eslint-config` enforces this with a local rule. It is a detector for
known shapes, not a guarantee — see
[quality.md](quality.md#the-thin-controller-rule) for its exact scope and its
documented blind spot.

**Moving code out of the controller is not sufficient.** Dependency direction
matters too: domain code must be testable without HTTP and without a database. A
service that imports `@nestjs/common` for anything beyond `@Injectable` and its
exceptions has usually absorbed a controller's job rather than a use case.

### Repository Interfaces Only When Justified

Introduce a repository interface when at least one holds:

1. Business logic must be tested without a database.
2. More than one storage implementation exists.
3. The interface keeps Prisma types from leaking into domain code.

Otherwise inject the DB package client into a data-access service directly. Do
not add a repository interface per entity by reflex — an interface with one
implementation and one caller is a wrapper chain, not a boundary.

### Feature Folder Layout

Take only the parts a given feature needs:

```text
src/<feature>/
  <feature>.module.ts
  <feature>.controller.ts
  <feature>.service.ts     use-case orchestration
  dto/                     request/response shapes
  domain/                  pure business rules, no framework imports
  data/                    query construction and row mapping
```

### Cross-Feature Access

Cross-feature access goes through the owning module, not around it. DI export and
TypeScript import are different mechanisms, and conflating them produces a rule
nobody can follow — injecting another feature's service _requires_ importing its
class or token. Precisely:

- The consumer imports the owning **module** and relies on what that module lists
  in `exports`.
- The consumer never re-registers another feature's provider in its own
  `providers` array. That creates a second instance and silently breaks
  request and transaction scope.
- Only providers the owning module exports may be injected. A non-exported
  provider is private even though its file is reachable on disk.
- If you want a file-level public surface, make it explicit: `<feature>/index.ts`
  re-exporting the module plus the public service classes, tokens, and types —
  named re-exports, never `export *`. That boundary is enforced by
  dependency-cruiser, which can compare importer and target paths;
  `no-restricted-imports` cannot. See
  [quality.md](quality.md#dependency-graph-checks).

Reference: [NestJS shared modules](https://docs.nestjs.com/modules#shared-modules).

## Database Access

- Do not put Prisma schemas or migrations inside backend apps.
- Create or reuse a database package under `packages/*`.
- Backend apps consume DB packages through package exports, for example:

```ts
import { createPrismaClient } from '@packages/db-core';
```

- Keep transaction helpers in the DB package when they are generic. Keep
  business transactions in the backend service that owns the use case.
- Declare the DB package in backend `dependencies` with `workspace:*`.

See [databases.md](databases.md).

## Environment

Backend apps read runtime config from local env files or process env.

Common variables:

```text
API_HOST=0.0.0.0
API_PORT=3000
POSTGRES_URL=postgresql://...
```

Commit `.env.example`, not `.env`. See [env.md](env.md).

## Error Handling And API Shape

- Use NestJS HTTP exceptions for request errors.
- Validate all external input.
- Use DTOs for request/response boundaries when endpoints become more than a
  trivial health route.
- Do not leak raw database errors or secrets to HTTP responses.
- Add exception filters or interceptors when cross-cutting behavior appears in
  multiple controllers.

## API Documentation

- Backend apps that expose an HTTP API must provide auto-generated
  OpenAPI/Swagger documentation.
- Use NestJS Swagger tooling so the API contract is generated from controllers,
  DTOs, and decorators instead of maintained by hand.
- Expose Swagger UI for visual access to the generated documentation at `/docs`
  unless a service-specific deployment constraint documents a different path.
- Update the relevant `docs/integration/` guides in the same change as external
  API or behavior changes. Describe workflows, access, errors/recovery, and
  compatibility beyond generated schemas; follow [documentation.md](documentation.md).

The backend template now implements Swagger UI at `/docs`, JSON at `/openapi.json`,
a typed HealthResponseDto and offline generation. Both runtime and schema mode use
`createApp`, `configureApi` and `createApiDocument`. SchemaModule includes real
feature HTTP modules with infrastructure providers explicitly replaced. Add new
controllers to both compositions and retain the runtime/schema parity check.

`nest-cli.json` enables the Swagger compiler plugin. Generate from compiled JS,
not tsx/ts-node, so plugin metadata is present. Decorate response/error DTOs and
provide stable operation IDs, summaries, descriptions, examples and security
semantics that the compiler cannot infer.

```sh
pnpm openapi:generate
pnpm openapi:check
```

Every `apps/backend.*` package must declare `apiContract` metadata: `kind: http`,
`serviceId` and `artifact: generated/openapi.json`, or `kind: worker` with a reason.
Other HTTP frameworks use the same metadata/scripts contract. Bundled artifacts
must use OpenAPI 3.0.x and only local `#/` references. Bundle local schema files
before validation; remote/unpinned references are rejected.

Register the service once in `apps/frontend.docs/services.ts`, with environments
and operation-to-guide IDs. Add its `package#openapi:check` dependency to the docs
generation task in `turbo.json`. Inventory validation rejects missing services,
metadata, scripts and stale task edges. Endpoint references then appear automatically.

CORS permits `DOCS_ORIGINS` (comma-separated, default `http://localhost:3002`).
Update methods/headers as the service evolves. No credentials are persisted by
Swagger UI. Keep docs origin and backend public URL configuration aligned.

## Testing

- Unit-test services with NestJS testing utilities.
- E2E-test important HTTP flows with Supertest or the project's chosen HTTP test
  tool.
- Mock external services at the boundary.
- For DB behavior, prefer integration tests against a test database package setup
  instead of mocking query builders for critical paths.

## Quality Commands

```sh
pnpm --filter @apps/backend.<name> lint
pnpm --filter @apps/backend.<name> typecheck
pnpm --filter @apps/backend.<name> test
pnpm --filter @apps/backend.<name> build
```

## Skills

Load these local skills when working on backend code:

- `nestjs-best-practices` for NestJS modules, DI, API design, security,
  performance, and testing.
- `node` for Node.js runtime behavior, graceful shutdown, streams, profiling, and
  env handling.
- `prisma-client-api` and `prisma-cli` when backend changes touch database
  queries or migrations.
- `typescript-magician` for strict typing, generics, type guards, and compiler
  errors.

See [skills.md](skills.md).
