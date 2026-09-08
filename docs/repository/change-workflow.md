---
id: repository-change-workflow
title: 'Change Workflow'
description: 'Change Workflow for contributors working in this monorepo.'
type: guide
audience: [developer, agent]
---

# Change Workflow

Use this workflow when updating or extending existing code.

## Temporary Implementation Plans

- When a task needs a file-based plan, use `.agents/plans/<task-slug>.md` from the
  repository root. Create the directory on demand; simple tasks do not require a
  plan file.
- Use a descriptive, unique kebab-case task slug. Keep one plan per task and load
  only the relevant plan when continuing work.
- Record the scope, implementation steps, validation criteria, and current
  progress. Update completed steps, outstanding work, and relevant decisions as
  implementation proceeds so another session can resume the task.
- Treat plans as temporary working material. `.agents/plans/` is ignored by Git;
  do not commit plans or store them in `docs/`. Git does not transfer these local
  files to other clones or worktrees.
- Permanent documentation must remain useful without plan files. Link to these
  lifecycle rules when needed, never to individual temporary plans. Exclude plans
  from published documentation, search indexes, AI exports, and project MCP
  documentation resources.
- After implementation and validation, document the resulting architecture,
  contracts, and relevant decision rationale in the appropriate permanent docs.
  Then delete that task's plan. Keep unfinished plans available for resumption;
  do not archive completed plans in the repository or delete unrelated plans.

## 1. Understand The Current State

- Read the root [README.md](../../README.md) and the relevant
  `docs/repository/*.md`
  files.
- Inspect the package's `package.json`, tsconfig, ESLint config, README, and
  nearby source files.
- Check whether the same pattern already exists in another app or package.
- Check the worktree before editing so unrelated user changes are not reverted.

## 2. Choose The Right Boundary

- App-only behavior stays in `apps/*`.
- Reusable behavior moves to `packages/*`.
- Prisma schema, migrations, and DB client helpers stay in DB packages.
- Shared UI moves to `packages/ui`.
- Tooling defaults move to `packages/eslint-config`,
  `packages/typescript-config`, or templates.

## 3. Update Code Conservatively

- Match local style before introducing a new abstraction.
- Keep public exports explicit.
- Declare new workspace dependencies with `workspace:*`.
- Update templates when changing a pattern that new packages should inherit.
- Update env examples when adding required configuration.
- Do not hand-edit generated files; run the generator.

## 4. Validate Locally

Use focused checks first:

```sh
pnpm --filter <package> lint
pnpm --filter <package> typecheck
pnpm --filter <package> test
pnpm --filter <package> build
```

Then run broader checks when the change touches shared packages or multiple
apps:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

For frontend UI changes, run the app and verify in a browser. For database
changes, run Prisma format/generate and the relevant migration command.

## 5. Update Documentation

After any repository change, compare affected docs against the current code,
config, templates, and package metadata. Update docs in the same change whenever
they are stale, incomplete, or contradictory.

Pay special attention when you alter:

- Directory or package naming conventions.
- Root or package scripts.
- Template behavior.
- Env variables.
- Database workflow.
- Shared config packages.
- Public package exports.
- External APIs, events, webhooks, MCP capabilities, SDKs, file formats, and
  consumer-visible workflow or compatibility behavior.

For external impact, follow [documentation.md](documentation.md): update affected
`docs/integration/` guides together with schemas, examples, and migration notes.
Regenerate and verify the references,
search, Markdown exports, and project MCP content from the same revision. Record
the reason when a code change has no external documentation impact.

## 6. Report Results

When finishing, report:

- Files or packages changed.
- Commands run and whether they passed.
- Any skipped verification and why.
- Any follow-up risk, especially migrations, env variables, or generated output.

## Documentation Release Validation

Run `pnpm docs:check` for every docs or external contract change, then relevant
browser/MCP tests. Root `docs/` changes must schedule this graph even when CI uses
package-based affected selection. Guides, references, search and MCP are generated
from the same revision; deploy and roll back their complete artifact together.
