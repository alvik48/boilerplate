# Environment Files

## Policy

- Never commit real `.env` files.
- Commit `.env.example` files for every package that needs environment
  variables.
- Keep env files closest to the package that owns the variables.
- Root `.env` is allowed only for values that are truly repository-wide.
- Do not put browser secrets in frontend env files.

The repository `.gitignore` ignores common dotenv files:

```text
.env
.env.development.local
.env.test.local
.env.production.local
.env.local
```

## Placement

Use this placement by default:

```text
apps/backend.<name>/.env
apps/backend.<name>/.env.example
apps/frontend.<name>/.env.local
apps/frontend.<name>/.env.example
packages/db-<name>/.env
packages/db-<name>/.env.example
```

## Backend Variables

Common backend variables:

```text
API_HOST=0.0.0.0
API_PORT=3000
POSTGRES_URL=postgresql://user:password@127.0.0.1:5432/db?schema=public
```

Backend apps may read secrets server-side. Document every required variable in
the app README and `.env.example`.

## Frontend Variables

- Use `NEXT_PUBLIC_` only for values safe to expose to the browser.
- Server-only values must be read only in Server Components, route handlers, or
  server actions.
- Do not pass secrets through Client Component props.

Example:

```text
NEXT_PUBLIC_APP_ENV=local
BACKEND_INTERNAL_URL=http://127.0.0.1:3000
```

`BACKEND_INTERNAL_URL` is server-only. Do not reference it in Client Components.

## Database Variables

Database packages use package-local `.env` files for Prisma CLI commands.
`templates/packages.db/prisma.config.ts` loads env with:

```ts
import 'dotenv/config';
```

Current template variable:

```text
POSTGRES_URL=postgresql://user:password@127.0.0.1:5432/db?schema=public
```

If a DB package uses a different provider or multiple URLs, document each one in
that package's `.env.example`.

## Agent Rules

- Before running migrations, confirm which package owns the target `.env`.
- Do not print real secrets in logs or final answers.
- If a command fails because env is missing, report the missing variable name and
  package path, not the expected secret value.
- When adding a new required env variable, update `.env.example`, package README,
  and any deployment docs in the same change.
