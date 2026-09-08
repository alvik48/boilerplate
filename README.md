# Monorepo boilerplate

AI agents must start here. This README is the repository entry point and the
navigation layer for task-specific instructions. Load only the documents needed
for the current task.

## Repository Documentation

- [docs/README.md](docs/README.md) - project documentation entry point.
- [docs/integration/README.md](docs/integration/README.md) - external integration
  guidance and current availability for client developers and their agents.
- [docs/repository/documentation.md](docs/repository/documentation.md) -
  documentation ownership and required updates for external contract changes.
- [docs/repository/README.md](docs/repository/README.md) - documentation index
  and context loading map.
- [docs/repository/structure.md](docs/repository/structure.md) - repository
  layout, ownership boundaries, package naming, import rules.
- [docs/repository/development-rules.md](docs/repository/development-rules.md) -
  shared development rules and constraints.
- [docs/repository/commands.md](docs/repository/commands.md) - root commands,
  filtered package commands, Turbo usage.
- [docs/repository/templates.md](docs/repository/templates.md) - how to create
  new apps and packages by copying templates.
- [docs/repository/backend.md](docs/repository/backend.md) - NestJS backend
  service rules.
- [docs/repository/frontend.md](docs/repository/frontend.md) - Next.js frontend
  and shared UI rules.
- [docs/repository/databases.md](docs/repository/databases.md) - Prisma database
  package workflow.
- [docs/repository/env.md](docs/repository/env.md) - `.env` placement,
  examples, and secrets policy.
- [docs/repository/quality.md](docs/repository/quality.md) - ESLint, Prettier,
  typechecking, tests, and Definition of Done.
- [docs/repository/skills.md](docs/repository/skills.md) - available local
  AI-agent skills and when to load them.
- [docs/repository/mcp-servers.md](docs/repository/mcp-servers.md) -
  recommended MCP servers and when to use them.
- [docs/repository/change-workflow.md](docs/repository/change-workflow.md) - safe
  workflow for updating and extending code.

## Quick Context Map

- Any task: read this README, then
  [docs/repository/README.md](docs/repository/README.md).
- Planning work: add
  [docs/repository/change-workflow.md](docs/repository/change-workflow.md#temporary-implementation-plans)
  for temporary implementation plan rules.
- External API, event, webhook, MCP, SDK, or other consumer contract changes: add
  [documentation rules](docs/repository/documentation.md) and the affected guides
  under [docs/integration](docs/integration/README.md).
- New app or package: add
  [docs/repository/templates.md](docs/repository/templates.md),
  [docs/repository/structure.md](docs/repository/structure.md), and
  [docs/repository/commands.md](docs/repository/commands.md).
- Backend task: add [docs/repository/backend.md](docs/repository/backend.md). If
  it touches persistence, also add
  [docs/repository/databases.md](docs/repository/databases.md) and
  [docs/repository/env.md](docs/repository/env.md).
- Frontend task: add [docs/repository/frontend.md](docs/repository/frontend.md).
  If it touches shared UI, also inspect `packages/ui`.
- Database task: add [docs/repository/databases.md](docs/repository/databases.md)
  and [docs/repository/env.md](docs/repository/env.md).
- Build, lint, type, or test task: add
  [docs/repository/quality.md](docs/repository/quality.md) and
  [docs/repository/commands.md](docs/repository/commands.md).
- Skill selection: add [docs/repository/skills.md](docs/repository/skills.md).
- MCP/tool selection: add
  [docs/repository/mcp-servers.md](docs/repository/mcp-servers.md).

## Current Architecture

This is a pnpm and Turborepo TypeScript monorepo.

- `apps/*` contains deployable applications, including `apps/frontend.docs` (Fumadocs on port 3002).
- `packages/*` contains shared libraries and database packages.
- `templates/*` contains canonical templates. New apps and DB packages must be
  created by copying and adapting these templates, not by starting from scratch.
- `packages/eslint-config` and `packages/typescript-config` are shared tooling
  contracts.
- `packages/ui` is the shared React UI package configured with shadcn and
  Tailwind CSS.
- `.agents/skills` contains project AI-agent skills committed with their supporting
  files. They are available immediately after cloning; no skill installation is
  required. `skills-lock.json` records upstream sources and hashes for explicit
  updates. See [skills.md](docs/repository/skills.md).
- `.agents/plans/` contains temporary, Git-ignored implementation plans. Create
  the directory when needed and delete completed plans after updating permanent
  documentation. See [change workflow](docs/repository/change-workflow.md#temporary-implementation-plans).

## Essential Commands

Run commands from the repository root unless a document says otherwise.

```sh
pnpm install
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm format
pnpm docs:dev
pnpm docs:check
pnpm docs:build
```

Use filtered commands for focused work:

```sh
pnpm --filter @apps/frontend.example dev
pnpm --filter @apps/backend.example dev
pnpm --filter @packages/db-example prisma:generate
pnpm --filter @packages/db-example prisma:migrate -- --name add_table
```

See [docs/repository/commands.md](docs/repository/commands.md) for the full
command reference and Turbo rules.

## Definition of Done

A change is done only when:

- The relevant task-specific docs above have been followed.
- Affected documentation has been checked against the current code and config,
  and any drift has been fixed in the same change.
- External contract and behavior changes include updated integration guidance,
  applicable schemas/examples, and compatibility or migration notes in the same
  change; see [documentation rules](docs/repository/documentation.md).
- New apps or DB packages come from `templates/*` and placeholders are replaced.
- Shared code is placed in `packages/*` and exported through package exports.
- `.env` files are not committed, and required variables are documented in a
  local `.env.example`.
- Lint, typecheck, build, and relevant tests have been run or the reason they
  could not run is documented.
- Generated files are not edited by hand.
- Cross-package dependencies are declared with `workspace:*`.

See [docs/repository/quality.md](docs/repository/quality.md) for the detailed
checklist.
