---
id: repository-databases
title: 'Database Development'
description: 'Database Development for contributors working in this monorepo.'
type: guide
audience: [developer, agent]
---

# Database Development

Database code belongs in reusable packages under `packages/*`. Apps consume those
packages; apps do not own Prisma schemas directly.

## Starting Point

Create new database packages by copying `templates/packages.db`. See
[templates.md](templates.md).

The template uses Prisma 7 style:

- `prisma/schema.prisma`.
- `prisma.config.ts`.
- `generator client { provider = "prisma-client"; output = "../generated/prisma" }`.
- `@prisma/adapter-pg`.
- `POSTGRES_URL` loaded via `dotenv/config`.
- Public `createPrismaClient(connectionString)` helper.
- Shared transaction types and helper.

## Package Shape

Expected database package layout:

```text
packages/db-<name>/
  prisma/
    schema.prisma
    migrations/
  src/
    index.ts
    raw-sql.ts
    transactions.ts
  generated/
  prisma.config.ts
  .env.example
  package.json
  tsconfig.json
```

`generated/` is ignored and must be recreated with `prisma:generate`.

Because `src/**` imports that output, every task whose TypeScript program covers
`src/**` declares `prisma:generate` in `dependsOn` in the package's `turbo.json`:
`build`, `typecheck`, and the type-aware `lint`. Wiring it into `build` alone is
not enough — Turbo is then free to start `typecheck` before the generator has
run, and a clean checkout fails with
`TS2307: Cannot find module '../generated/prisma/client.js'`.

Write the dependency as `["$TURBO_EXTENDS$", "prisma:generate"]`. In a Package
Configuration an explicitly declared array **replaces** the inherited one, so a
bare `["prisma:generate"]` silently drops the root `^build` / `^typecheck`;
`$TURBO_EXTENDS$` appends instead. Fields the package does not declare at all are
still inherited, so `inputs` need no repetition here — unlike a root-level
`package#task` entry, which replaces the generic entry wholesale. See
[quality.md](quality.md#cache-invalidation).

`prisma generate` reads only `prisma/schema.prisma`; it needs no reachable
database and no `POSTGRES_URL`, which is what makes this safe to run in CI.

## Prisma Commands

```sh
pnpm --filter @packages/db-<name> prisma:format
pnpm --filter @packages/db-<name> prisma:generate
pnpm --filter @packages/db-<name> prisma:migrate -- --name <migration_name>
pnpm --filter @packages/db-<name> prisma:deploy
pnpm --filter @packages/db-<name> prisma:reset
```

Run `prisma:generate` after schema changes and after applying migrations when
generated types are needed.

## Schema Rules

- Use explicit table/column mapping when database names differ from TypeScript
  names.
- Keep enums and models grouped and commented when the schema grows.
- Commit migrations with the schema change.
- Do not edit generated Prisma client output.
- Do not use `db push` for durable schema evolution unless the user explicitly
  requests a throwaway prototype.

## Client Rules

- Export generated model, enum, and Prisma types from the DB package public
  entry point.
- Instantiate Prisma with a driver adapter:

```ts
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });
```

- Backend apps should receive or construct the client at their boundary and pass
  typed clients into services.
- Use `DbClient`/`DbTransactionClient` style aliases for functions that can run
  inside or outside a transaction.

## Raw SQL

- Keep reusable raw SQL helpers in `src/raw-sql.ts` or a nearby module in the DB
  package.
- Use Prisma tagged SQL APIs, not string concatenation.
- Type raw query inputs and outputs.
- Keep business meaning in service code; keep DB-specific query mechanics in the
  DB package.

## Transactions

- Use the shared transaction helper for simple interactive transactions.
- Keep transaction-scoped functions accepting `DbClient` when they can operate
  inside or outside a transaction.
- Do not hide multi-step business transactions in unrelated utility modules.

## Environment

Database packages currently expect `POSTGRES_URL` in the package-local `.env`.
The template `.env.example` documents this. See [env.md](env.md).

## Skills

Load these local skills when working on DB code:

- `prisma-cli` for Prisma commands.
- `prisma-client-api` for queries, filters, relations, transactions, and raw SQL.
- `prisma-database-setup` for provider setup and connection troubleshooting.
- `prisma-postgres` or `prisma-postgres-setup` for Prisma Postgres workflows.
- `prisma-upgrade-v7` for Prisma major-version migrations.
- `prisma-driver-adapter-implementation` only when implementing or changing a
  Prisma driver adapter contract.

See [skills.md](skills.md).
