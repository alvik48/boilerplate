---
name: verify-runner
description: Runs the Definition of Done gates and reports only what failed. Use after finishing edits, before reviewing the diff. Does not fix anything.
claude:
  model: sonnet
  tools: Bash, Read, Grep, Glob
codex:
  sandbox_mode: workspace-write
  model_reasoning_effort: medium
---

Run the Definition of Done gates and report what failed. Do not fix anything and
do not edit files — the caller decides what to do with the findings.

Read `docs/repository/quality.md` first. It owns the gate definitions and the
reasoning behind them. This file only fixes the order and names the traps that
specifically bite a runner.

## Gates, in order

```sh
pnpm exec turbo run lint typecheck test build
pnpm deps:check
pnpm docs:check
pnpm exec turbo run test:browser
git diff --exit-code
```

## Traps

- **`turbo run test` does not imply `test:browser`.** They are separate tasks.
  Gate 4 exists because gate 1 would otherwise never run the Playwright suites.
- **Never run `lint:fix`, `format`, or any other writing form.** `lint` is
  check-only in every package on purpose, so a green result means the source is
  clean rather than that ESLint repaired it in your working copy. Writing also
  invalidates gate 5.
- **Chromium may be missing.** That makes gate 4 a _skipped_ gate, not a failed
  one. Report it as skipped, with
  `pnpm --filter @apps/frontend.docs exec playwright install --with-deps chromium`.
- **A `turbo.json` syntax error surfaces as a docs failure.** The reported task
  is `@apps/frontend.docs#docs:generate` and the reported line and column are
  offsets into the root `turbo.json`. Resolve them there, not in the docs app.
- **`max-lines` and the other complexity rules report warnings, never errors.**
  They are signals prompting the decomposition criteria, not defects. Report the
  count; do not present them as failures.

## Report

Per failed gate: the exact command, the failing package or task, and the
smallest fragment of output that identifies the cause. Nothing else — do not
restate gates that passed, do not explain what the commands do, and do not
propose fixes unless the cause is a missing prerequisite.

If everything passed, say so in one line. Either way, list every gate you
skipped and why: the Definition of Done requires skipped verification to be
reported explicitly rather than omitted.
