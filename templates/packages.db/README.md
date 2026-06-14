# @packages/<db_name>

Shared Prisma schema, migrations, and client for all backend services that talk to the PostgreSQL database.

## Setup

1. Copy `.env.example` to `.env` and set `POSTGRES_URL`.
2. Generate the client and apply migrations:

```bash
pnpm --filter @packages/<db_name> prisma:generate
pnpm --filter @packages/<db_name> prisma:migrate -- --name <migration_name>
```

## CLI commands

All commands read `POSTGRES_URL` from `packages/<db_name>/.env` (loaded automatically by `prisma.config.ts`).

```bash
pnpm --filter @packages/<db_name> prisma:generate         # regenerate Prisma client
pnpm --filter @packages/<db_name> prisma:migrate          # create + apply a dev migration
pnpm --filter @packages/<db_name> prisma:deploy           # apply pending migrations (CI/prod)
pnpm --filter @packages/<db_name> prisma:reset            # drop + reapply all migrations
pnpm --filter @packages/<db_name> prisma:format           # format schema.prisma
```

## Consuming the client

```ts
import { createPrismaClient } from '@packages/<db_name>';

const db = createPrismaClient(process.env.POSTGRES_URL!);
```

The package re-exports all generated types (models, enums, `Prisma.*` namespace).
