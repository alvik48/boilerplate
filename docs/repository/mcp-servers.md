---
id: repository-mcp-servers
title: 'MCP Servers'
description: 'MCP Servers for contributors working in this monorepo.'
type: guide
audience: [developer, agent]
---

# MCP Servers

This page covers repository development tools. The public project MCP serves external
integrators at `/mcp`; see [consumer guides](../integration/mcp/README.md) and
[implementation extensions](mcp-extending.md). The optional local consumer endpoint
is `http://localhost:3002/mcp` after `pnpm docs:dev`; it is not automatically added
to development tool configuration.

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
| `codegraph`     | `pnpm exec codegraph serve --mcp` | Structural questions across packages: call sites, dependents, dependency paths, blast radius of a change.                  |

## Selection Rules

- Use `codegraph` first for structural questions that cross a file or package
  boundary — who calls this, what depends on it, what breaks if it changes. It
  answers from a pre-built index in one call, where grep-and-read takes many.
- Use `webstorm` for IDE-backed work: inspections, refactoring safety, build
  diagnostics, and database connections. It reads live analysis, where
  `codegraph` reads its last indexed state.
- Use `next-devtools` for Next.js-specific work before relying on generic
  browser console output. Initialize it at the start of a Next.js development
  session when the tool is available.
- Use `playwright` for real browser verification after visible frontend changes
  or when debugging client-side behavior.
- Use `shadcn` for `packages/ui` and any task involving `components.json`,
  shadcn registries, component examples, or generated component code.
- Use package scripts as the final source of quality verification.

## CodeGraph Index

`codegraph` is the one configured server that keeps state on disk. It ships as a
pinned root devDependency rather than the `npx ...@latest` the other three use:
the extraction format is versioned, so an unattended minor upgrade can invalidate
an existing index. Bump it deliberately, and expect the next query to rebuild.

Build the index once per clone:

```sh
pnpm codegraph:init
```

This is not part of `prepare`, so `pnpm install` does not pay for it — see the
header of [`bin/codegraph.init.sh`](../../bin/codegraph.init.sh). The index lives
in `.codegraph/` and is gitignored; `pnpm exec codegraph index --force` rebuilds
it from scratch.

The file watcher is not a standalone service. It belongs to a daemon that
`codegraph serve --mcp` spawns, so it runs while an agent session holds the
server and writes `daemon.pid`, `daemon.sock` and the SQLite WAL next to the
database, all of which it removes on a clean exit. Between `init` and the first
agent session nothing is watching, so an index built on a checkout that then sat
idle is exactly as old as that checkout.

Root `codegraph.json` is committed and configures indexing for this repository.
It must be **strict JSON** — CodeGraph refuses a config carrying comments and
falls back to its defaults with a warning, which looks like the config silently
not applying. The same constraint as
[the root `turbo.json`](quality.md#comments-in-turbojson), so the rationale lives
here rather than in the file:

- `templates/**` is deprioritized. Templates are deliberate near-copies of real
  app structure, and they are **49 of the 168 indexed files** — roughly a third
  of the graph. Without this, every symbol search returns the template twin
  ranked alongside the real definition. Nothing competes with them yet, because
  the repository currently has no app the templates were copied into; the entry
  is in place for when it does.
- `.agents/skills/**` is deprioritized for the two vendored TypeScript sample
  assets under `node/rules/assets/`. The 276 Markdown files there are **not**
  indexed at all — CodeGraph extracts code, and Markdown is not one of its
  languages, so only 3 files from that tree ever reach the graph.

Deprioritizing keeps both trees findable and stops them outranking real code;
`exclude` would drop them from the index entirely, which is not wanted. Nothing
needs `exclude` here because CodeGraph already respects `.gitignore`, which
covers `dist/`, `.next/`, `generated/`, and `.source/`.

One cosmetic artifact to expect in `codegraph status`: the nine `.json` files
under `templates/` are the only JSON in the graph, and each is reported under
the `liquid` language. The repository has no Liquid files and those manifests
hold no template placeholders — a path named `templates/` is enough to trigger
it. Each contributes one file node and no symbols, so it costs nothing; it is
documented only so the entry in the language table does not read as a bug.

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
- Confirm a `codegraph` answer against the file before editing on it. The index
  is as fresh as the last watcher run, and a stale or absent index reports a
  missing symbol the same way a genuinely deleted one.
- Do not use browser-only verification for server-side correctness.
- If an MCP server is unavailable, continue with repository tools and document
  which MCP check was skipped.
- Do not expose secrets through MCP screenshots, console logs, network captures,
  or final responses.
