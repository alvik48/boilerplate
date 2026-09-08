# AI-Agent Skills

Project-local skills are vendored under `.agents/skills` and committed with all
their supporting files. A clone contains the reviewed versions even if an
upstream skill or repository disappears. Load the smallest set that matches the
task. Do not load all skills by default.

Git is the source of truth for skill contents. `skills-lock.json` records upstream
sources and hashes for maintenance; it is not a backup of the files or an immutable
upstream revision pin. No skill installation is needed after cloning.

The CLI can record a hash supplied by its source snapshot service instead of
calculating one from the installed directory. Do not treat `computedHash` as a
universal checksum of the vendored files; review their actual Git diff.

## Maintaining Vendored Skills

Inspect local skills or explicitly refresh them from upstream:

```sh
pnpm skills:list
pnpm skills:update
```

`skills:update` is scoped to project skills. For a focused update, pass a skill
name, for example `pnpm skills:update shadcn`. Updates require access to upstream
sources and can change the instructions agents follow, so keep them in dedicated,
reviewable changes rather than running them during setup or normal development.

To add a selected upstream skill to the shared project directory:

```sh
pnpm exec skills add <owner/repo> --skill <skill-name> --agent codex -y
```

For additions and updates:

1. Review the complete skill directory, including references, scripts, assets,
   and any agent metadata. Keep actual files in the repository, not links to
   user-specific directories.
2. Preserve upstream license and attribution files. Some installers omit licenses
   from the source repository root; retain those in
   [skill-licenses](skill-licenses/README.md), outside the hashed skill directories.
   Check those copies when updating a source.
3. Commit `.agents/skills` and `skills-lock.json` together, along with any affected
   license copies and repository documentation. Do not hand-edit the lockfile or
   reformat the vendored files; root `.prettierignore` excludes them.

If a source disappears, keep using the committed copy. Upstream removal is not
itself a reason to delete a project skill; removal or replacement is a separate
maintenance decision. Recover accidentally deleted local files from Git. For
example, when there are no local edits to preserve in that skill:

```sh
git restore --source=HEAD -- .agents/skills/shadcn
```

There is no `skills:install` bootstrap command. The CLI's `experimental_install`
fetches skill names from their recorded sources and refreshes hashes; it cannot
recover the committed contents by `computedHash` after an upstream deletion.

## Next.js Skill Sources

The former `vercel/nextjs-skills` repository redirects to
[`vercel-labs/next-skills`](https://github.com/vercel-labs/next-skills), which no
longer contains installable skills. Its supported Cache Components workflows
now live in [`vercel/next.js`](https://github.com/vercel/next.js/tree/canary/skills):

- `next-cache-components-adoption` replaces the setup/adoption workflow.
- `next-cache-components-optimizer` covers cache boundaries and optimization.

The old `next-best-practices`, `next-cache-components`, and `next-upgrade` entries
must not be re-added from the retired repository. For general Next.js guidance
and upgrades, use documentation matching the app's installed Next.js version
and the configured `next-devtools` MCP. See [frontend.md](frontend.md) and
[mcp-servers.md](mcp-servers.md).

## Core Skill Map

| Skill                                  | Use when                                                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `turborepo`                            | Monorepo structure, `turbo.json`, task pipelines, filters, affected builds, package boundaries. |
| `typescript-magician`                  | TypeScript compiler errors, strict typing, generics, type guards, replacing `any`.              |
| `node`                                 | Node.js runtime behavior, graceful shutdown, streams, stuck tests, profiling, env handling.     |
| `nestjs-best-practices`                | NestJS modules, DI, controllers, services, security, API design, backend testing.               |
| `next-cache-components-adoption`       | Enabling Cache Components and migrating an existing Next.js app to use them.                    |
| `next-cache-components-optimizer`      | Cache boundaries, `use cache`, `cacheLife`, `cacheTag`, and prerendering optimization.          |
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
- New frontend app: `turborepo`, `frontend-design`, and version-matched Next.js docs.
- Shared UI component: `shadcn`, `frontend-design`, `typescript-magician`.
- Next.js cache adoption: `next-cache-components-adoption`.
- Next.js cache/performance task: `next-cache-components-optimizer`.
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
- Treat changes to vendored skills as explicit maintenance and review their full
  diff, including supporting files.
- Do not hand-edit `skills-lock.json`; let the skills tooling update it and then
  review and commit it with the skill files.

## External Or Runtime Skills

Some agents may expose extra runtime skills or plugins, such as browser
automation, OpenAI docs, spreadsheets, documents, presentations, or image
generation. Those are environment capabilities, not repository contracts. Use
them only when the task requires them and keep repository code consistent with
the local rules above.

For repository-configured MCP servers, see [mcp-servers.md](mcp-servers.md).
