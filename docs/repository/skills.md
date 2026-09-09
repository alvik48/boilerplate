---
id: repository-skills
title: 'AI-Agent Skills'
description: 'AI-Agent Skills for contributors working in this monorepo.'
type: guide
audience: [developer, agent]
---

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

## Discoverability

Agents that auto-discover skills read their own directory — Claude Code uses
`.claude/skills`, Codex `.codex/skills` — not `.agents/skills`. Without a link,
the vendored skills are present but never offered.

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

Linking the whole directory exposes every vendored skill to auto-discovery, so
all their descriptions load. That is the intended trade; if it proves noisy,
switch to per-skill symlinks.

## Project-Owned Skills

`project-feature-workflow` is written and owned here rather than vendored, so it
has no entry in `skills-lock.json` and is never touched by `pnpm skills:update`.
It is procedural and links to the repository documents instead of restating them,
so it cannot drift from them.

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
2. Commit `.agents/skills` and `skills-lock.json` together, along with any affected
   repository documentation. Do not hand-edit the lockfile or
   reformat the vendored files; root `.prettierignore` excludes them.

## Correcting A Vendored Skill

Upstream skills sometimes teach something this repository forbids. Do not
hand-edit the vendored file: `pnpm skills:update` overwrites it, and the only
thing standing between you and a silently reverted correction is a human noticing
a missing edit inside a large upstream diff. That will not happen.

Correct it through `patches/skills/<skill>.patch` instead. A patch that stops
applying is a loud failure that forces someone to look, and — unlike a repository
document — a patch can also fix the `description` frontmatter, which is what
decides _when a skill loads at all_.

**Mechanism.** Skills are committed to Git, so their checked-in state is already
_upstream + patch_ and a fresh clone needs no bootstrap. Patches are re-applied
on **update**, the one operation that overwrites them:

```sh
pnpm skills:update            # update all, then re-apply every patch
pnpm skills:update shadcn     # update one, then re-apply every patch
```

`skills:update` runs `bin/update-skills.sh`, which forwards its arguments to the
CLI and then runs `bin/apply-skill-patches.sh`. Per patch, that script reverses
cleanly (already applied, skip), applies cleanly (apply), or **fails the whole
command** naming the skill. Do not chain these with `&&` in the `package.json`
script field: pnpm appends user arguments to the end of the whole command string,
so `pnpm skills:update shadcn` would update every skill and pass `shadcn` to the
patch script.

**Authoring or re-deriving a correction.** The baseline must be a pristine
upstream copy, never the index — after the first patch lands, the index already
holds the corrected skill, so diffing against it produces corrected-vs-corrected
and degrades a little more on every update. `bin/edit-skill.sh` handles this:

```sh
bin/edit-skill.sh begin <skill>             # baseline from the current vendored copy
bin/edit-skill.sh begin <skill> --refresh   # pull new upstream first, patching disabled
# ... make the correction in the printed 'b' directory only ...
bin/edit-skill.sh finish <skill> <workdir>
```

`--refresh` calls the updater with patching disabled on purpose. Using the normal
wrapper would re-apply the old patch whenever upstream did not touch the patched
region, making the snapshot _upstream + old patch_ — the exact contamination this
workflow exists to prevent.

Then commit the patched skill files, the patch, and `skills-lock.json` together.
Patching does not invalidate `skills-lock.json`: `computedHash` comes from the
source snapshot service rather than the installed directory.

**Limits.** Keep hunks minimal and tightly anchored; Markdown prose patches break
on any nearby rewording, so prefer deleting or replacing a wrong example over
rewriting a section. If a patch grows past ~2 hunks, stop patching and fork the
skill: drop it from `skills-lock.json` and own it as a project skill. An
ever-growing patch means the upstream skill no longer matches this repository.
If a new upstream renames or deletes a file a patch touches, stop and re-derive
the correction; do not resurrect the old file.

**Current patches.**

| Patch                                              | Corrects                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `patches/skills/nestjs-best-practices.patch`       | `rules/arch-single-responsibility.md` taught orchestration in the controller ("Orchestration in controller or dedicated orchestrator", with a handler calling create-order → charge → notify). Replaced with a `CreateOrderUseCase` holding the sequence and a controller making one call, per [backend.md](backend.md#the-orchestration-rule).  |
| `patches/skills/node.patch`                        | `SKILL.md` prescribed type stripping for Node TypeScript generally, in both the body and the activation `description`. Scoped to standalone scripts and tooling: NestJS compiles with `nest build` because `emitDecoratorMetadata` needs a transform that type stripping does not perform.                                                       |
| `patches/skills/vercel-react-best-practices.patch` | `SKILL.md` presented all eight rule categories as unconditional. Gated categories 5-8 on a measurement and pointed at [code-design.md](code-design.md#performance), whose explicit non-rules — no blanket ban on `map`/`filter`/`reduce`, no blanket memoization — contradict `js-combine-iterations`, `js-flatmap-filter`, and `rerender-memo`. |

A patch is only the third layer of a correction. The positive rule in the
repository document and the ESLint rule that blocks the violation both stay — a
skill can be corrected and still never load, and only lint blocks.

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

Both Vercel skills are scoped narrower here than they are upstream.

`vercel-react-best-practices` splits in two. Its structural categories (`async-`,
`bundle-`, `server-`, `client-`) remove round trips and shipped bytes, and apply
by default. Its micro-optimization categories (`rerender-`, `rendering-`, `js-`,
`advanced-`) are gated on a measurement by the patch below, because
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
- Precedence is **repository docs > package config > vendored skill examples**.
  See [development-rules.md](development-rules.md#precedence).
- If a local skill conflicts with a concrete repository convention, follow the
  repository convention, then fix the skill through `patches/skills/` so the next
  agent does not hit the same conflict.
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
