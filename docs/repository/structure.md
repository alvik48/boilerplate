---
id: repository-structure
title: 'Repository Structure'
description: 'Repository Structure for contributors working in this monorepo.'
type: guide
audience: [developer, agent]
---

# Repository Structure

## Top-Level Layout

```text
.agents/skills/     project AI-agent skills and supporting files
.agents/plans/      temporary local implementation plans, ignored by Git
apps/               deployable applications
packages/           shared libraries, tooling configs, database packages
templates/          canonical source templates for new apps/packages
config/             tool configs that can be relocated out of the root
bin/                repository automation scripts, named `<namespace>.<action>`
infra/              local infrastructure compose files
docs/repository/    AI-ready development documentation
docs/integration/   external client and agent integration guidance
docs/               permanent project documentation and guides
```

`.agents/skills` is versioned, hand-maintained content, not generated output and
not fetched by any command. Origins are recorded in
[skills.md](skills.md#origins-and-local-edits), which also holds the rules for
editing a skill.

`docs/integration/` owns consumer-facing guides; `docs/repository/` owns development
rules. The Fumadocs app `apps/frontend.docs` publishes API references and the public
project MCP endpoint from one manifest. See [documentation.md](documentation.md) for content ownership
and required updates when external contracts change.

`.agents/plans/` is created on demand and holds one Markdown plan per task. Plans
are local to the checkout and are not transferred by Git to other clones or
worktrees. See [change workflow](change-workflow.md#temporary-implementation-plans)
for naming, progress updates, and cleanup rules.

`bin/` groups scripts by the subject they act on rather than by language:
`pm2.restart.sh`, `agents.link-skills.sh`, `agents.generate-subagents.mjs`. The
npm script that wraps one carries the same name with `:` in place of the dot, so
`pnpm agents:link-skills` and `bin/agents.link-skills.sh` are greppable from
either end. That is why the script names keep their object — `agents:generate`
would collide the moment a second thing under `.agents/` needs generating.

`config/` holds the tool configs whose consumer passes an explicit path, so the
location is free: `dependency-cruiser.cjs` (`pnpm deps:check`),
`eslint.config.fast.mjs` (lint-staged, with `--no-config-lookup`), and
`commitlint.config.js` (the `commit-msg` hook). Moving one of these means
updating its caller in the same change — nothing discovers them by convention.

The rest stay in the root because their tools resolve them by position, not by
flag, and relocating them would break resolution rather than tidy it:

| File                   | Why it cannot move                                                      |
| ---------------------- | ----------------------------------------------------------------------- |
| `.prettierrc`          | Prettier searches ancestors of each formatted file                      |
| `ecosystem.config.cjs` | PM2 resolves each app's relative `cwd` against the config file's folder |
| `turbo.json`           | Fixed name at the workspace root                                        |
| `pnpm-workspace.yaml`  | Fixed name at the workspace root                                        |

The root `turbo.json` also has to stay strict JSON, unlike
`templates/packages.db/turbo.json`, because the docs inventory check parses it
with `JSON.parse`. See
[comments in `turbo.json`](quality.md#comments-in-turbojson).

`pnpm-workspace.yaml` includes:

```yaml
packages:
  - apps/*
  - packages/*
  - templates/*

catalog:
  typescript: 6.0.3
  eslint: ^10.10.0
  # ... other versions shared by more than one package
```

Templates are workspace packages so they must stay buildable, lintable, and
typecheckable.

The `catalog:` block is the single source of truth for every version used by
more than one workspace package. Manifests reference those versions with the
`"catalog:"` specifier rather than repeating a range, so a shared version is
bumped in one place. See
[dependency rules](development-rules.md#dependency-rules).

## Current Packages

- `packages/eslint-config` exports shared ESLint configs:
  `./base`, `./backend`, `./next`, `./react-library`.
- `packages/typescript-config` exports shared TypeScript configs:
  `./base.json`, `./nest.json`, `./node.json`, `./nextjs.json`,
  `./react-library.json`.
- `packages/ui` exports shared React UI components, hooks, lib utilities,
  styles, and themes.

- `apps/frontend.docs` owns the documentation Node deployment and HTTP routes.
- `packages/docs-core` owns content and search without Next.js dependencies.
- `packages/api-contracts` owns generic OpenAPI helpers and a separate `./nest` export.
- `packages/mcp` owns SDK server construction and descriptors; it imports no app.
- `docs/api/` owns the authored API directory; generated references stay in the docs app.

## Naming Conventions

- Backend app folder: `apps/backend.<name>`.
- Backend package name: `@apps/backend.<name>`.
- Frontend app folder: `apps/frontend.<name>`.
- Frontend package name: `@apps/frontend.<name>`.
- Database/shared package folder: `packages/<name>`, usually
  `packages/db-<domain>` for Prisma DB packages.
- Database/shared package name: `@packages/<name>`.

Use the same semantic name in folder, `package.json`, README, ports, metadata,
and env examples.

## Package Boundaries

- Deployable runtime code lives in `apps/*`.
- Reusable code lives in `packages/*`.
- Database schemas, migrations, generated clients, raw SQL helpers, and
  transaction helpers live in `packages/*`, not inside `apps/*`.
- Apps consume shared code through package exports, not by importing
  `../../packages/.../src/...`.
- If a package imports another workspace package, declare it in `package.json`
  with `workspace:*`.
- Do not edit files under `generated/`, `dist/`, `.next/`, or `.turbo` by hand.

## Import Rules

- Prefer exported package subpaths such as `@packages/ui/components/button`.
- Do not deep-import another package's private source files.
- Keep package `exports` accurate when adding public APIs.
- Keep generated Prisma imports inside the owning database package and re-export
  what consumers need from that package's public entry point.

## Templates Are Canonical

New apps and DB packages must start from `templates/*`. If a repeated pattern is
missing from a template, update the template or document the exception in the new
package README. See [templates.md](templates.md).
