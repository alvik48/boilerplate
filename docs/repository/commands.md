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
pnpm lint:fix
pnpm test
pnpm typecheck
pnpm deps:check
```

Root scripts delegate to Turbo:

- `build`: `turbo run build`
- `dev`: `turbo run dev --parallel`
- `format`: `turbo run format`
- `lint`: `turbo run lint`
- `lint:fix`: `turbo run lint:fix`
- `test`: `turbo run test`
- `typecheck`: `turbo run typecheck`

`deps:check` runs dependency-cruiser directly rather than through Turbo: it
cruises the whole graph from the root in one pass, so a per-package task would
have nothing to run. See
[quality.md](quality.md#dependency-graph-checks).

### `lint` Versus `lint:fix`

`lint` is check-only in every package. `lint:fix` is the writing form. Keep them
separate: a `lint` script that carries `--fix` repairs an auto-fixable violation
in the runner's working copy and then exits 0, which turns a CI failure into a
green build over unfixed source.

Use `lint:fix` while developing and `lint` anywhere the exit code is the answer.

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
Cloning the repository provides the reviewed versions, and Git is the only source
of their contents.

Root `package.json` exposes one command for them:

```sh
pnpm agents:link-skills
```

`agents:link-skills` symlinks `.claude/skills` and `.codex/skills` to
`.agents/skills`. Claude Code needs the link to discover them; Codex reads
`.agents/skills` natively and keeps its link only for compatibility. It runs from
`prepare`, so `pnpm install` already does it. See
[skills.md](skills.md#discoverability).

There is no install, update, or patch command. Skills are frozen repository
content: adding, refreshing, or correcting one is a manual, reviewed edit, not a
command. Recover accidentally deleted skill files from Git rather than from
upstream. See [skills.md](skills.md#adding-or-replacing-a-skill) for the
procedure and [skills.md](skills.md#editing-a-skill) for the rules on editing a
skill's text.

## Subagent Commands

Subagent definitions are committed under `.agents/agents` in one neutral format.

```sh
pnpm agents:generate-subagents
```

`agents:generate-subagents` renders each definition into `.claude/agents/<name>.md`
and `.codex/agents/<name>.toml`. Unlike `agents:link-skills` this is generation
rather than a symlink, because the two formats are incompatible. It runs from
`prepare`, so `pnpm install` already does it — but generated output goes stale, so
re-run it after editing a definition. See
[subagents.md](subagents.md#source-of-truth).

Both `agents:*` commands mirror their script name in `bin/`, with `:` in place of
the dot. See [structure.md](structure.md#top-level-layout).

## Commit Hooks

Husky pre-commit runs `lint-staged`: Prettier plus a syntax-only ESLint pass over
staged files, using `config/eslint.config.fast.mjs`. Type-aware lint,
typecheck, build and tests run in CI. See
[quality.md](quality.md#pre-commit-and-commit-messages).

```sh
pnpm exec lint-staged
```

Commit messages are checked by commitlint against `config/commitlint.config.js`
and must use a non-empty conventional commit scope, for example:

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
