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
- Keep controllers thin. Validation, business logic, and persistence calls belong
  in DTOs/pipes/services/repositories as appropriate.
- Avoid circular module dependencies.
- Keep provider exports explicit.
- Use events or queues for decoupled side effects when synchronous coupling would
  make services brittle.
- Add health checks for services that own external connections or background
  workers.

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
