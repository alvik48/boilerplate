---
id: repository-guide
title: 'Repository Guide'
description: 'Repository Guide for contributors working in this monorepo.'
type: guide
audience: [developer, agent]
---

# Repository Guide

This directory contains AI-ready development instructions for this monorepo.
Each file is intentionally focused so an agent can load only the context needed
for the current task.

## Load Order

1. Start with the root [README.md](../../README.md).
2. Load this file.
3. Load only the task-specific files from the matrix below.
4. Inspect the relevant source files and package configs before changing code.

## Task Matrix

> **Every code change loads:** [development-rules.md](development-rules.md),
> [code-design.md](code-design.md), [quality.md](quality.md). The rows below are
> additive to that baseline.

| Task                        | Load these files                                                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Understand repository shape | [structure.md](structure.md), [development-rules.md](development-rules.md)                                                   |
| Run commands or debug Turbo | [commands.md](commands.md), [quality.md](quality.md)                                                                         |
| Create an app/package       | [templates.md](templates.md), [structure.md](structure.md), [env.md](env.md)                                                 |
| Migrate an external project | [templates.md](templates.md), [structure.md](structure.md), [change-workflow.md](change-workflow.md), [skills.md](skills.md) |
| Backend/NestJS work         | [backend.md](backend.md), [env.md](env.md), [quality.md](quality.md)                                                         |
| Frontend/Next.js work       | [frontend.md](frontend.md), [quality.md](quality.md), [mcp-servers.md](mcp-servers.md)                                       |
| Shared UI work              | [frontend.md](frontend.md), [skills.md](skills.md), [mcp-servers.md](mcp-servers.md), inspect `packages/ui`                  |
| Database/Prisma work        | [databases.md](databases.md), [env.md](env.md), [quality.md](quality.md)                                                     |
| Refactor or extend code     | [change-workflow.md](change-workflow.md), [code-design.md](code-design.md), [mcp-servers.md](mcp-servers.md)                 |
| Plan implementation         | [change-workflow.md](change-workflow.md#temporary-implementation-plans)                                                      |
| Change an external contract | [documentation.md](documentation.md), [integration index](../integration/README.md), affected integration guides             |
| Choose AI skills or MCP     | [skills.md](skills.md), [mcp-servers.md](mcp-servers.md)                                                                     |

## Path-Based Routing

The matrix above keys off how a task is described, which fails when the request
names no architecture at all — "добавь фильтр пользователей" matches no row.
Route by the paths the change actually touches:

| Touched path                                                                            | Also load                                            | Skills                                                                                           |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `apps/backend.*/**`, `templates/apps.backend/**`                                        | [backend.md](backend.md)                             | `nestjs-best-practices`, `node` (as edited — see [skills.md](skills.md#origins-and-local-edits)) |
| `apps/frontend.*/**`, `templates/apps.frontend/**`                                      | [frontend.md](frontend.md)                           | `next-cache-components-*`, `next-devtools` MCP                                                   |
| `packages/ui/**`                                                                        | [frontend.md](frontend.md)                           | `shadcn`, `frontend-design`                                                                      |
| `packages/db-*/**`, `**/*.prisma`                                                       | [databases.md](databases.md), [env.md](env.md)       | `prisma-client-api`, `prisma-cli`                                                                |
| `packages/eslint-config/**`, `packages/typescript-config/**`, `turbo.json`, `config/**` | [quality.md](quality.md), [commands.md](commands.md) | `turborepo`                                                                                      |
| `docs/integration/**`, any external contract                                            | [documentation.md](documentation.md)                 | —                                                                                                |

Rows are additive to the baseline above, and to each other: a change touching a
backend app and a DB package loads both.

## Documentation Rules

- Keep root README as the stable entry point.
- Keep domain rules in separate files instead of making one large handbook.
- Add cross-links when a rule depends on another document.
- After any repository change, check affected docs against the current code and
  config. Update docs in the same change when they are stale, incomplete, or
  contradictory.
- Update these docs when package scripts, templates, shared configs, or directory
  conventions change.
- Follow [documentation.md](documentation.md) for consumer-facing changes. Update
  `docs/integration/` with API, event, webhook, MCP, SDK, and other external
  contract or behavior changes in the same change.
- Prefer exact package paths and commands over generic advice.

## Current Repository Facts

- Package manager: `pnpm@10.20.0`.
- Build orchestration: Turborepo.
- Workspaces: `apps/*`, `packages/*`, `templates/*`.
- Templates: `templates/apps.backend`, `templates/apps.frontend`,
  `templates/packages.db`.
- Shared configs: `packages/eslint-config`, `packages/typescript-config`.
- Relocated tool configs: `config/dependency-cruiser.cjs`,
  `config/eslint.config.fast.mjs`, `config/commitlint.config.js`. Each is passed
  by explicit path from its caller.
- Shared UI: `packages/ui`.
- Project skills, frozen in Git and available after cloning: `.agents/skills/*`.
  Origins are recorded in [skills.md](skills.md#origins-and-local-edits).
- MCP server config: `.mcp.json`.

## Template Placeholders

- Frontend template placeholder UI uses `App name` text. Replace brand,
  metadata, copy, and routes when creating a real frontend app.

## Documentation Pipeline Context

- [Publication ownership and validation](documentation.md).
- [Node deployment and CI commands](docs-deployment.md).
- [Extending MCP tools and authorization](mcp-extending.md).
- [Consumer MCP onboarding](../integration/mcp/README.md).

The docs app is `@apps/frontend.docs`; shared packages are `@packages/docs-core`,
`@packages/api-contracts`, and `@packages/mcp`. The example contract is generated by
`@apps/backend-template`. Root Markdown is public and included in the task hashes.
