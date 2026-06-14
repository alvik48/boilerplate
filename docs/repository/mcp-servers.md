# MCP Servers

This repository declares recommended MCP servers in `.mcp.json`. MCP tools help
agents inspect the running app, query component registries, and use IDE-backed
code intelligence. They complement package commands; they do not replace
`pnpm lint`, `pnpm typecheck`, `pnpm test`, or `pnpm build`.

## Configured Servers

| Server          | Config                            | Use when                                                                                                                   |
| --------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `playwright`    | `npx @playwright/mcp@latest`      | Browser automation, screenshots, console/network inspection, user-flow checks, frontend regression verification.           |
| `shadcn`        | `npx shadcn@latest mcp`           | Searching registries, inspecting component examples, getting add commands, auditing shadcn UI changes.                     |
| `next-devtools` | `npx -y next-devtools-mcp@latest` | Next.js docs, runtime diagnostics, route/build errors, Cache Components migration, verifying running Next.js apps.         |
| `webstorm`      | `http://127.0.0.1:64342/sse`      | IDE-backed file search, symbol lookup, inspections, project build diagnostics, database connections, safe code navigation. |

## Selection Rules

- Use `webstorm` first for repository navigation, file search, symbol lookup,
  inspections, and quality checks available through the IDE.
- Use `next-devtools` for Next.js-specific work before relying on generic
  browser console output. Initialize it at the start of a Next.js development
  session when the tool is available.
- Use `playwright` for real browser verification after visible frontend changes
  or when debugging client-side behavior.
- Use `shadcn` for `packages/ui` and any task involving `components.json`,
  shadcn registries, component examples, or generated component code.
- Use package scripts as the final source of quality verification.

## Frontend Workflow

For Next.js app changes:

1. Read [frontend.md](frontend.md) and [quality.md](quality.md).
2. Use `next-devtools` to inspect the running Next.js app, routes, and runtime
   errors when a dev server is available.
3. Use `playwright` to load the page in a real browser, check console errors,
   capture screenshots, and verify interaction.
4. Run focused package commands:

```sh
pnpm --filter @apps/frontend.<name> lint
pnpm --filter @apps/frontend.<name> typecheck
pnpm --filter @apps/frontend.<name> build
```

For shared UI changes:

1. Use `shadcn` to inspect installed components and registry examples.
2. Read generated or modified component files after any registry operation.
3. Use `playwright` against a consuming app or local preview when the change is
   visual.
4. Run `pnpm --filter @packages/ui lint` and
   `pnpm --filter @packages/ui typecheck`.

## Backend And Shared Code Workflow

For backend or shared TypeScript work:

- Use `webstorm` for semantic search, symbol information, open-file context,
  inspections, and build diagnostics.
- Use terminal package scripts for authoritative validation.
- Use `playwright` only when backend changes need end-to-end HTTP verification
  through a frontend or browser flow.

## Quality Workflow

Recommended order for larger changes:

1. `webstorm`: inspect files, symbols, and IDE problems for targeted feedback.
2. Package scripts: run focused lint/typecheck/test/build.
3. Domain MCP:
   - `next-devtools` for Next.js runtime issues.
   - `shadcn` for UI registry/component correctness.
   - `playwright` for browser-rendered behavior.
4. Root commands when shared packages or multiple apps are affected.

## Guardrails

- Do not install or add new MCP servers unless the task requires it or the user
  asks.
- Do not treat MCP output as a substitute for committed tests or package
  quality commands.
- Do not use browser-only verification for server-side correctness.
- If an MCP server is unavailable, continue with repository tools and document
  which MCP check was skipped.
- Do not expose secrets through MCP screenshots, console logs, network captures,
  or final responses.
