---
id: documentation-index
title: Project documentation
description: Entry point for current project documentation and repository guidance.
type: overview
audience:
  - developer
  - integrator
  - agent
status: active
---

# Project Documentation

This is the entry point for documentation stored in `docs/`. Start with the
repository root [README.md](../README.md) for development instructions and the
current architecture.

## Available Documentation

| Need                                  | Read                                               |
| ------------------------------------- | -------------------------------------------------- |
| Develop or extend this monorepo       | [Repository guide](repository/README.md)           |
| Integrate an external client or agent | [Integration guide](integration/README.md)         |
| Add or change an external contract    | [Documentation rules](repository/documentation.md) |

The repository ships a Fumadocs documentation application, generated API references,
Markdown exports and a public documentation MCP. Integration, API and Repository
are peer sections. The backend health API remains a local template example.

- [Choose an entry point](getting-started.md).
- [API directory](api/README.md).
- [Documentation architecture](architecture.md).
- [MCP quickstart](integration/mcp/quickstart.md).

## Documentation Scope

All project documentation, including `docs/repository`, is intended to be public.
Keep `docs/` focused on current architecture, contracts, and development guidance.
Temporary AI implementation plans belong in `.agents/plans/`; follow the
[plan lifecycle rules](repository/change-workflow.md#temporary-implementation-plans).
Do not link to individual temporary plans from permanent documentation.

## Reading Guidance

- Load the index first, then only the documents relevant to the task.
- Follow linked source files and commands when verifying current behavior.
- Update affected documentation together with implementation changes.
