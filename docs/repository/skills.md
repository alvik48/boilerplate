# AI-Agent Skills

Project-local skills are locked in `skills-lock.json` and installed under
`.agents/skills`. Load the smallest set that matches the task. Do not load all
skills by default.

`.agents/skills` is generated and ignored by git. If it is missing or stale, use
the root skill commands:

```sh
pnpm skills:list
pnpm skills:install
pnpm skills:update
```

## Core Skill Map

| Skill                                  | Use when                                                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `turborepo`                            | Monorepo structure, `turbo.json`, task pipelines, filters, affected builds, package boundaries. |
| `typescript-magician`                  | TypeScript compiler errors, strict typing, generics, type guards, replacing `any`.              |
| `node`                                 | Node.js runtime behavior, graceful shutdown, streams, stuck tests, profiling, env handling.     |
| `nestjs-best-practices`                | NestJS modules, DI, controllers, services, security, API design, backend testing.               |
| `next-best-practices`                  | Next.js App Router, RSC boundaries, route handlers, metadata, images, fonts, hydration.         |
| `next-cache-components`                | Next.js 16 Cache Components, `use cache`, `cacheLife`, `cacheTag`, PPR.                         |
| `next-upgrade`                         | Next.js version upgrades and codemods.                                                          |
| `frontend-design`                      | New UI, redesigns, visual direction, typography, layout quality.                                |
| `shadcn`                               | shadcn components, registries, forms, icons, composition, shared UI work.                       |
| `prisma-cli`                           | Prisma generate, migrate, deploy, reset, format, validate, studio, debug.                       |
| `prisma-client-api`                    | Prisma queries, filters, relations, transactions, raw SQL, client methods.                      |
| `prisma-database-setup`                | Provider setup, connection strings, driver adapters, database troubleshooting.                  |
| `prisma-postgres`                      | Prisma Postgres console, create-db, Management API, connection workflows.                       |
| `prisma-postgres-setup`                | Provisioning and connecting a new Prisma Postgres database.                                     |
| `prisma-upgrade-v7`                    | Prisma 6 to 7 migrations, `prisma-client` generator, adapters, config changes.                  |
| `prisma-driver-adapter-implementation` | Implementing or modifying Prisma driver adapter interfaces.                                     |
| `skill-optimizer`                      | Improving skills themselves, activation rules, benchmark loops, regression triage.              |

## Task-Based Selection

- Monorepo/package task: `turborepo`.
- New backend service: `turborepo`, `nestjs-best-practices`, `node`.
- Backend with DB: add `prisma-client-api` and `prisma-cli`.
- New frontend app: `turborepo`, `next-best-practices`, `frontend-design`.
- Shared UI component: `shadcn`, `frontend-design`, `typescript-magician`.
- Next.js cache/performance task: `next-best-practices`, `next-cache-components`.
- DB package or migration: `prisma-cli`, `prisma-client-api`,
  `prisma-database-setup`.
- Prisma upgrade: `prisma-upgrade-v7`.
- Type-only refactor: `typescript-magician`.

## Skill Use Rules

- Read the selected skill's `SKILL.md` before acting.
- If a skill points to a specific reference file for the task, read that
  reference file too.
- Prefer repository docs and package configs for local conventions; use skills
  for domain-specific best practices.
- If a local skill conflicts with a concrete repository convention, follow the
  repository convention and document the mismatch when it matters.
- Do not edit `.agents/skills` as part of normal product development.
- Do not hand-edit `skills-lock.json`; let the skills tooling update it and then
  review the diff.

## External Or Runtime Skills

Some agents may expose extra runtime skills or plugins, such as browser
automation, OpenAI docs, spreadsheets, documents, presentations, or image
generation. Those are environment capabilities, not repository contracts. Use
them only when the task requires them and keep repository code consistent with
the local rules above.

For repository-configured MCP servers, see [mcp-servers.md](mcp-servers.md).
