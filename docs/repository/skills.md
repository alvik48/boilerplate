---
id: repository-skills
title: 'AI-Agent Skills'
description: 'AI-Agent Skills for contributors working in this monorepo.'
type: guide
audience: [developer, agent]
---

# AI-Agent Skills

Project-local skills live under `.agents/skills` and are committed with all their
supporting files. Load the smallest set that matches the task. Do not load all
skills by default.

Skills are **frozen repository content**. Nothing downloads, refreshes, or
regenerates them: no lockfile, no updater, no patch step. A clone contains the
reviewed text, and the text an agent reads is exactly what is in Git. Most of it
originated upstream, but this repository now owns it and edits it in place.

## Discoverability

Agents that auto-discover skills read their own directory — Claude Code uses
`.claude/skills`, Codex `.codex/skills` — not `.agents/skills`. Without a link,
the skills are present but never offered.

`bin/link-agent-skills.sh` symlinks both to `../.agents/skills`. It runs from the
root `prepare` script, so `pnpm install` is enough, and can be re-run directly:

```sh
pnpm skills:link
```

It is idempotent, leaves a real (non-symlink) directory alone, and does not fail
the install when symlink creation is unavailable — on Windows that needs
Developer Mode or elevation, in which case copy `.agents/skills` across instead.

`.claude/` and `.codex/` are gitignored, so the link is rebuilt per clone rather
than committed.

Linking the whole directory exposes every skill to auto-discovery, so all their
descriptions load. That is the intended trade; if it proves noisy, switch to
per-skill symlinks.

## Editing A Skill

Upstream skills sometimes teach something this repository forbids. Fix the skill
text directly, in the file, and mark the edit:

```html
<!-- LOCAL EDIT — what upstream said, what it says now, and why. See
     docs/repository/skills.md#editing-a-skill. -->
```

The marker is the whole record. Nothing else tracks divergence from upstream, so
an unmarked local edit is indistinguishable from upstream text and the next
person to compare against the source will quietly revert it. Put the marker
immediately above the edited region, outside any code fence, so it survives as a
comment rather than rendering as content.

Audit every divergence at once:

```sh
grep -rn "LOCAL EDIT" .agents/skills
```

Editing the file directly is what lets a correction reach the `description`
frontmatter, which decides _when a skill loads at all_ — a repository document
cannot change that, no matter how clearly it states the rule.

Prefer deleting or replacing a wrong example over rewriting a section. If a skill
needs edits scattered through it, stop treating it as third-party text: rewrite it
as a project-owned skill and say so in the table below. Extensive local edits mean
the upstream skill no longer matches this repository.

A skill edit is only the third layer of a correction. The positive rule in the
repository document and the ESLint rule that blocks the violation both stay — a
skill can be corrected and still never load, and only lint blocks.

## Origins And Local Edits

Provenance is recorded here, in Git, and nowhere else. Keep this table current
when adding, removing, or editing a skill.

| Skill                                                                                                                                                               | Origin                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `prisma-cli`, `prisma-client-api`, `prisma-database-setup`, `prisma-driver-adapter-implementation`, `prisma-postgres`, `prisma-postgres-setup`, `prisma-upgrade-v7` | `prisma/skills`                |
| `node`, `skill-optimizer`, `typescript-magician`                                                                                                                    | `mcollina/skills`              |
| `vercel-composition-patterns`, `vercel-react-best-practices`                                                                                                        | `vercel-labs/agent-skills`     |
| `next-cache-components-adoption`, `next-cache-components-optimizer`                                                                                                 | `vercel/next.js`               |
| `turborepo`                                                                                                                                                         | `vercel/turborepo`             |
| `shadcn`                                                                                                                                                            | `shadcn/ui`                    |
| `frontend-design`                                                                                                                                                   | `anthropics/skills`            |
| `nestjs-best-practices`                                                                                                                                             | `kadajett/agent-nestjs-skills` |
| `project-feature-workflow`, `project-migration-workflow`                                                                                                            | Project-owned, written here    |

Skills carrying their upstream license keep it: `frontend-design/LICENSE.txt` and
the `license` field in several `SKILL.md` files must not be stripped.

**Current local edits.**

| Skill                         | Edited file                           | Correction                                                                                                                                                                                                                                                                                                                              |
| ----------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nestjs-best-practices`       | `rules/arch-single-responsibility.md` | Taught orchestration in the controller ("Orchestration in controller or dedicated orchestrator", a handler calling create-order → charge → notify). Now a `CreateOrderUseCase` holds the sequence and the controller makes one call, per [backend.md](backend.md#the-orchestration-rule).                                               |
| `node`                        | `SKILL.md`                            | Prescribed type stripping for Node TypeScript generally, in both the body and the activation `description`. Scoped to standalone scripts and tooling: NestJS compiles with `nest build` because `emitDecoratorMetadata` needs a transform that type stripping does not perform.                                                         |
| `vercel-react-best-practices` | `SKILL.md`                            | Presented all eight rule categories as unconditional. Categories 5-8 are gated on a measurement and point at [code-design.md](code-design.md#performance), whose explicit non-rules — no blanket ban on `map`/`filter`/`reduce`, no blanket memoization — contradict `js-combine-iterations`, `js-flatmap-filter`, and `rerender-memo`. |

## Adding Or Replacing A Skill

Adding a skill is a manual copy, reviewed like any other contribution:

1. Copy the complete skill directory into `.agents/skills/<name>` — `SKILL.md`
   plus every reference, script, asset, and license file it ships. Keep actual
   files in the repository, never links to user-specific directories.
2. Read all of it. An unread skill is instructions you have not approved,
   delivered to every agent that touches the repository.
3. Correct anything that contradicts a repository rule, marking each edit as
   above.
4. Add it to the origins table and the [Core Skill Map](#core-skill-map), and
   record the source so the origin is not lost.

Refreshing a skill from a newer upstream is the same procedure, plus re-applying
the local edits: read the `LOCAL EDIT` markers in the current copy before
overwriting it, then reinstate each one in the new text. Treat it as a dedicated,
reviewable change — never fold a skill refresh into a product change.

Removing a skill upstream is not a reason to remove it here; the committed copy
keeps working. Recover accidentally deleted files from Git:

```sh
git restore --source=HEAD -- .agents/skills/shadcn
```

Root `.prettierignore` excludes `.agents/skills`, so repository-wide `pnpm format`
does not reformat these files. Review them as prose.

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

| Skill                                  | Use when                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `turborepo`                            | Monorepo structure, `turbo.json`, task pipelines, filters, affected builds, package boundaries.  |
| `typescript-magician`                  | TypeScript compiler errors, strict typing, generics, type guards, replacing `any`.               |
| `node`                                 | Node.js runtime behavior, graceful shutdown, streams, stuck tests, profiling, env handling.      |
| `nestjs-best-practices`                | NestJS modules, DI, controllers, services, security, API design, backend testing.                |
| `next-cache-components-adoption`       | Enabling Cache Components and migrating an existing Next.js app to use them.                     |
| `next-cache-components-optimizer`      | Cache boundaries, `use cache`, `cacheLife`, `cacheTag`, and prerendering optimization.           |
| `frontend-design`                      | New UI, redesigns, visual direction, typography, layout quality.                                 |
| `shadcn`                               | shadcn components, registries, forms, icons, composition, shared UI work.                        |
| `vercel-react-best-practices`          | React/Next.js performance: request waterfalls, bundle size, server and client fetching.          |
| `vercel-composition-patterns`          | Component API shape: boolean-prop sprawl, compound components, React 19 `use()`.                 |
| `prisma-cli`                           | Prisma generate, migrate, deploy, reset, format, validate, studio, debug.                        |
| `prisma-client-api`                    | Prisma queries, filters, relations, transactions, raw SQL, client methods.                       |
| `prisma-database-setup`                | Provider setup, connection strings, driver adapters, database troubleshooting.                   |
| `prisma-postgres`                      | Prisma Postgres console, create-db, Management API, connection workflows.                        |
| `prisma-postgres-setup`                | Provisioning and connecting a new Prisma Postgres database.                                      |
| `prisma-upgrade-v7`                    | Prisma 6 to 7 migrations, `prisma-client` generator, adapters, config changes.                   |
| `prisma-driver-adapter-implementation` | Implementing or modifying Prisma driver adapter interfaces.                                      |
| `skill-optimizer`                      | Improving skills themselves, activation rules, benchmark loops, regression triage.               |
| `project-feature-workflow`             | Project-owned. Adding or changing a feature: owner, layer, implementation, verification, review. |
| `project-migration-workflow`           | Project-owned. Moving a project from outside this workspace into it: inventory, owners, slices.  |

`project-feature-workflow` and `project-migration-workflow` are written and owned
here rather than copied from upstream. Both are procedural and link to the
repository documents instead of restating them, so they cannot drift from them.

The two are sequenced, not alternatives: `project-migration-workflow` decides
where code arriving from outside the workspace belongs and in what order it
lands, then hands off to `project-feature-workflow` for the shape of each ported
slice.

Both Vercel skills are scoped narrower here than they are upstream.

`vercel-react-best-practices` splits in two. Its structural categories (`async-`,
`bundle-`, `server-`, `client-`) remove round trips and shipped bytes, and apply
by default. Its micro-optimization categories (`rerender-`, `rendering-`, `js-`,
`advanced-`) are gated on a measurement by the local edit recorded above, because
[code-design.md](code-design.md#performance) rules out blanket memoization and
blanket rewriting of `map`/`filter`/`reduce`. Its `bundle-barrel-imports` rule is
about third-party packages with thousands of re-exports — it is **not** a reason
to bypass a feature's `index.ts`, which
[structure.md](structure.md) requires and `deps:check` enforces.

`vercel-composition-patterns` applies at real complexity. A component with two
props does not need a provider or a compound API; reach for them when boolean
props are already multiplying. Where it lifts state into a provider, the
[state ownership table](frontend.md#state-ownership) still decides the owner —
filters and pagination belong in the URL, not in a context.

## Task-Based Selection

- Any feature work, backend or frontend: `project-feature-workflow` first, then
  the stack-specific skills below.
- Moving an existing external project, service, or app into this workspace:
  `project-migration-workflow` first. It routes to the template, stack, and DB
  skills per phase.
- Monorepo/package task: `turborepo`.
- New backend service: `turborepo`, `nestjs-best-practices`, `node`.
- Backend with DB: add `prisma-client-api` and `prisma-cli`.
- New frontend app: `turborepo`, `frontend-design`, and version-matched Next.js docs.
- Shared UI component: `shadcn`, `frontend-design`, `typescript-magician`, and
  `vercel-composition-patterns` when the component's prop surface is growing.
- Frontend performance task: `vercel-react-best-practices`. Take the measurement
  first; its low-priority categories are gated on one.
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
- Precedence is **repository docs > package config > skill examples**.
  See [development-rules.md](development-rules.md#precedence).
- If a skill conflicts with a concrete repository convention, follow the
  repository convention, then fix the skill text so the next agent does not hit
  the same conflict.
- Do not edit `.agents/skills` as part of normal product development. A skill
  correction is its own change, with its own review.
- Never edit a skill without leaving a `LOCAL EDIT` marker.

## External Or Runtime Skills

Some agents may expose extra runtime skills or plugins, such as browser
automation, OpenAI docs, spreadsheets, documents, presentations, or image
generation. Those are environment capabilities, not repository contracts. Use
them only when the task requires them and keep repository code consistent with
the local rules above.

For repository-configured MCP servers, see [mcp-servers.md](mcp-servers.md).
