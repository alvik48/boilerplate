---
id: repository-commands
title: 'Commands'
description: 'Commands for contributors working in this monorepo.'
type: guide
audience: [developer, agent]
---

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

Project skills and all their supporting files are committed under `.agents/skills`.
Cloning the repository provides the reviewed versions without an upstream download.
`skills-lock.json` records skill identities, sources, and hashes for maintenance;
Git preserves the actual contents.

Current root `package.json` exposes:

```sh
pnpm skills:list
pnpm skills:update
```

`skills:list` lists local skills. `skills:update` runs `skills update --project`
and downloads upstream versions only for this project's skills. Run it explicitly
as a dedicated maintenance change, then review and commit `.agents/skills` and
`skills-lock.json` together. To update one skill:

```sh
pnpm skills:update shadcn
```

There is no `skills:install` bootstrap step. Recover accidentally deleted skill
files from Git, not by reinstalling from upstream. The CLI's
`experimental_install` refreshes contents and hashes from recorded sources; it
does not restore an immutable snapshot by `computedHash`.

See [skills.md](skills.md#maintaining-vendored-skills) for adding skills and
handling removed upstream sources.

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

## Documentation Commands

```sh
pnpm openapi:generate
pnpm openapi:check
pnpm docs:generate
pnpm docs:check
pnpm docs:dev
pnpm docs:build
pnpm docs:package
```

Root commands delegate to Turbo. Backend build precedes OpenAPI generation/check;
docs generation explicitly depends on each registered backend check. Fumadocs
preparation precedes docs build/typecheck/tests. See [deployment](docs-deployment.md).
`docs:dev` starts single-writer companion watchers for root prose and compiled
backend contracts. The backend API listener is started separately for the playground.

For root Markdown formatting, run `pnpm exec prettier --check README.md 'docs/**/*.md'`;
package formatting scripts do not cover these root sources.
