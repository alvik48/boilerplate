---
id: repository-development-rules
title: 'Development Rules'
description: 'Development Rules for contributors working in this monorepo.'
type: guide
audience: [developer, agent]
---

# Development Rules

## Core Rules

- Read the root [README.md](../../README.md) first.
- Inspect existing package patterns before adding abstractions.
- Keep changes scoped to the task and ownership boundary.
- Put reusable code in `packages/*`; keep `apps/*` focused on deployment and
  composition.
- Use templates for new apps and database packages. Do not scaffold from an
  external generator unless the user explicitly asks and the result is adapted
  back to repository conventions.
- Declare all cross-package dependencies with `workspace:*`.
- Do not hand-edit generated output.
- Do not commit secrets, local data, caches, build output, or `node_modules`.

## Turborepo Rules

- Package scripts own task logic.
- Root scripts delegate to `turbo run <task>`.
- In package.json, CI, and scripts, write `turbo run`, not `turbo` shorthand.
- Let Turbo order package tasks through dependency declarations and
  `dependsOn`. Do not add manual prebuild scripts to build dependencies.
- Use filtered commands for focused work:
  `pnpm --filter <package> <script>`.
- Use `--affected` for changed-package workflows when CI or a large workspace
  needs it.

The current root `dev` script is `turbo run dev --parallel`; use it only when
you intentionally want every independent dev task. For day-to-day work, prefer a
filtered `dev` command for the app you are touching.

## Shared Config Rules

- Prefer `@packages/eslint-config` over duplicating ESLint rules in apps.
- Prefer `@packages/typescript-config` over copying full tsconfig bodies.
- If a local package still carries copied config from a template, consider
  switching it to the shared config when doing related work.
- Keep Prettier behavior aligned with root `.prettierrc`.

## Dependency Rules

- Add dependencies to the package that uses them.
- Add shared tooling dependencies to the config package only when the config
  needs them.
- Do not rely on transitive dependencies from another workspace package.
- Keep runtime dependencies and devDependencies separated.

## Code Ownership Rules

- Backend feature logic stays in the owning backend app unless reused by more
  than one app.
- Shared domain types, clients, adapters, and utility packages belong in
  `packages/*`.
- Database access belongs in database packages plus backend services that consume
  those packages.
- UI primitives and shared styles belong in `packages/ui`; app-specific screens
  stay in the frontend app.

## Code Modularity Rules

- Keep code in small, focused files organized by feature, purpose, and ownership
  boundary.
- Avoid large mixed-responsibility files that force agents to load unrelated
  context. Extract cohesive helpers, types, components, services, and tests when
  a file starts carrying multiple concepts.
- Split code by stable domain boundaries instead of arbitrary tiny fragments, and
  keep public exports explicit.

## Documentation Rules

- Add package README notes when introducing a non-obvious convention.
- After any repository change, compare affected docs with the current code,
  package metadata, templates, and config. Update docs in the same change when
  they are stale, incomplete, or contradictory.
- Update `docs/repository/*` when changing architecture, commands, templates,
  env workflow, or quality gates.
- Keep instructions concrete: exact command, exact package, exact path.
- External contract or behavior changes must update the affected
  `docs/integration/` guides, applicable schemas/examples, and compatibility
  notes in the same change. Follow [documentation.md](documentation.md), including
  its rules for publishing integration content through the project MCP server.
