# Commands

Run from the repository root unless noted.

## Install

```sh
pnpm install
```

The repository declares `packageManager: pnpm@10.20.0`.

## Root Commands

```sh
pnpm build
pnpm dev
pnpm format
pnpm lint
pnpm test
pnpm typecheck
```

Root scripts delegate to Turbo:

- `build`: `turbo run build`
- `dev`: `turbo run dev --parallel`
- `format`: `turbo run format`
- `lint`: `turbo run lint`
- `test`: `turbo run test`
- `typecheck`: `turbo run typecheck`

## Filtered Commands

Prefer filters while developing a specific package.

```sh
pnpm --filter @apps/backend.example dev
pnpm --filter @apps/backend.example build
pnpm --filter @apps/backend.example lint
pnpm --filter @apps/backend.example typecheck

pnpm --filter @apps/frontend.example dev
pnpm --filter @apps/frontend.example build
pnpm --filter @apps/frontend.example lint
pnpm --filter @apps/frontend.example typecheck

pnpm --filter @packages/ui lint
pnpm --filter @packages/ui typecheck
```

For packages changed in a branch, use Turbo affected mode when appropriate:

```sh
pnpm exec turbo run build --affected
pnpm exec turbo run lint --affected
pnpm exec turbo run typecheck --affected
```

## Database Commands

Database packages use Prisma scripts from the copied template.

```sh
pnpm --filter @packages/db-example prisma:format
pnpm --filter @packages/db-example prisma:generate
pnpm --filter @packages/db-example prisma:migrate -- --name add_table
pnpm --filter @packages/db-example prisma:deploy
pnpm --filter @packages/db-example prisma:reset
```

Use `prisma:migrate` for local development migrations and `prisma:deploy` for
applying committed migrations in CI or production-like environments.

## Skill Commands

Skill identities and source hashes are tracked in `skills-lock.json`. Installed
skill files live under `.agents/skills`, which is ignored by git and should be
treated as generated output.

Current root `package.json` exposes:

```sh
pnpm skills:list
pnpm skills:install
pnpm skills:update
```

After installing or updating skills, review and commit changes to
`skills-lock.json`. Do not hand-edit `.agents/skills`.

## Commit Hooks

Husky pre-commit runs:

```sh
pnpm build
pnpm lint
```

Commit messages are checked by commitlint and must use a non-empty conventional
commit scope, for example:

```text
feat(frontend.admin): add dashboard shell
fix(db-core): correct migration index
```
