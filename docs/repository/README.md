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

| Task                        | Load these files                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Understand repository shape | [structure.md](structure.md), [development-rules.md](development-rules.md)                                               |
| Run commands or debug Turbo | [commands.md](commands.md), [quality.md](quality.md)                                                                     |
| Create an app/package       | [templates.md](templates.md), [structure.md](structure.md), [env.md](env.md)                                             |
| Backend/NestJS work         | [backend.md](backend.md), [env.md](env.md), [quality.md](quality.md)                                                     |
| Frontend/Next.js work       | [frontend.md](frontend.md), [quality.md](quality.md), [mcp-servers.md](mcp-servers.md)                                   |
| Shared UI work              | [frontend.md](frontend.md), [skills.md](skills.md), [mcp-servers.md](mcp-servers.md), inspect `packages/ui`              |
| Database/Prisma work        | [databases.md](databases.md), [env.md](env.md), [quality.md](quality.md)                                                 |
| Refactor or extend code     | [change-workflow.md](change-workflow.md), [development-rules.md](development-rules.md), [mcp-servers.md](mcp-servers.md) |
| Plan implementation         | [change-workflow.md](change-workflow.md#temporary-implementation-plans)                                                  |
| Choose AI skills or MCP     | [skills.md](skills.md), [mcp-servers.md](mcp-servers.md)                                                                 |

## Documentation Rules

- Keep root README as the stable entry point.
- Keep domain rules in separate files instead of making one large handbook.
- Add cross-links when a rule depends on another document.
- After any repository change, check affected docs against the current code and
  config. Update docs in the same change when they are stale, incomplete, or
  contradictory.
- Update these docs when package scripts, templates, shared configs, or directory
  conventions change.
- Prefer exact package paths and commands over generic advice.

## Current Repository Facts

- Package manager: `pnpm@10.20.0`.
- Build orchestration: Turborepo.
- Workspaces: `apps/*`, `packages/*`, `templates/*`.
- Templates: `templates/apps.backend`, `templates/apps.frontend`,
  `templates/packages.db`.
- Shared configs: `packages/eslint-config`, `packages/typescript-config`.
- Shared UI: `packages/ui`.
- Local project skills lock: `skills-lock.json`.
- Installed local skills: `.agents/skills/*`.
- MCP server config: `.mcp.json`.

## Template Placeholders

- Frontend template placeholder UI uses `App name` text. Replace brand,
  metadata, copy, and routes when creating a real frontend app.
