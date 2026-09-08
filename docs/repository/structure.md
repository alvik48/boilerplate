# Repository Structure

## Top-Level Layout

```text
.agents/skills/            vendored project AI-agent skills and supporting files
.agents/plans/             temporary local implementation plans, ignored by Git
apps/                     deployable applications
packages/                 shared libraries, tooling configs, database packages
templates/                canonical source templates for new apps/packages
docs/repository/          AI-ready development documentation
docs/                     permanent project documentation and guides
scripts/                  repository automation, currently empty
```

`.agents/skills` is versioned, not generated output. `skills-lock.json` records
upstream source metadata for explicit updates; a clone already includes the skill
files. See [skills.md](skills.md) for maintenance and license attribution.

`.agents/plans/` is created on demand and holds one Markdown plan per task. Plans
are local to the checkout and are not transferred by Git to other clones or
worktrees. See [change workflow](change-workflow.md#temporary-implementation-plans)
for naming, progress updates, and cleanup rules.

`pnpm-workspace.yaml` includes:

```yaml
packages:
  - apps/*
  - packages/*
  - templates/*
```

Templates are workspace packages so they must stay buildable, lintable, and
typecheckable.

## Current Packages

- `packages/eslint-config` exports shared ESLint configs:
  `./base`, `./backend`, `./next`, `./react-library`.
- `packages/typescript-config` exports shared TypeScript configs:
  `./base.json`, `./nest.json`, `./node.json`, `./nextjs.json`,
  `./react-library.json`.
- `packages/ui` exports shared React UI components, hooks, lib utilities,
  styles, and themes.

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
