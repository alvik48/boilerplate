---
id: repository-code-design
title: 'Code Design'
description: 'Code Design for contributors working in this monorepo.'
type: guide
audience: [developer, agent]
---

# Code Design

Cross-cutting design rules. These apply to backend and frontend alike; the
layer contracts that differ per stack live in [backend.md](backend.md) and
[frontend.md](frontend.md).

Load this document for **every** code change.

## Decomposition Criteria

Split a file when any of these holds:

- It has two or more independent reasons to change.
- Its imports form distinct clusters serving unrelated purposes.
- A chunk of it needs its own tests.
- A repeated block reaches its third occurrence.
- A client-only piece is forcing a whole module to be client code.

Line count is a **signal, not a standard**. The soft thresholds are 300 lines per
file and roughly 60 lines per function, and ESLint reports both as warnings
rather than errors precisely so they stay signals. A file over the threshold with
one reason to change is fine. A 90-line file doing three unrelated things is not.

Do not split a file to satisfy a counter. Splitting on line count alone produces
fragments that must be read together, which is worse than the long file.

Exempt from the thresholds: generated code, shadcn-vendored components under
`packages/ui/src/components/**`, config, and declarative files.

## Anti-Over-Engineering

Every new abstraction must point at a problem that exists **now**:

- real duplication, at its third occurrence;
- a crossed boundary that needs a seam (infrastructure versus domain);
- a testability need you can name;
- a performance need you have measured.

Do not pre-build:

- generic CRUD base classes;
- a global store for server data;
- an in-process event bus between features;
- wrapper chains with a single call site;
- "just in case" configuration flags;
- barrel files re-exporting everything — they create cycles, defeat
  tree-shaking, and on the frontend drag server-only code into the client graph
  (see [frontend.md](frontend.md#feature-public-entries)).

Small, obvious duplication is acceptable until the right abstraction is evident.
Two similar functions that drift apart later were never the same function.

The corollary for reuse: **code does not move to a shared package because it might
be reused.** It moves when a second consumer actually imports it.

## Performance

Work in this priority order, on problems you have actually observed:

1. Extra round trips and N+1 queries.
2. Payload size — over-fetching columns, rows, or fields.
3. Algorithmic complexity on hot paths.
4. Event-loop blocking: synchronous `fs`, `crypto`, large JSON parsing.
5. Independent awaits running sequentially — use `Promise.all`.
6. Client JavaScript weight.

For a change on a critical path, record before and after: latency, query count,
bundle delta. A performance change without a measurement is a guess, and it is
not reviewable.

Explicit non-rules:

- No blanket ban on `map` / `filter` / `reduce`.
- No blanket memoization — `useMemo`, `useCallback`, and `React.memo` all cost
  readability and have their own overhead.

Both trade certain readability for uncertain gain. Apply either only where a
measurement justifies it.

## Testing Proportionality

Match the test to the risk:

| Situation            | Test                                     |
| -------------------- | ---------------------------------------- |
| Reproducible bug     | Regression test **first**, then the fix  |
| Business rule        | Unit test on the domain function         |
| Query or transaction | Integration test against a real database |
| Critical user flow   | E2E test                                 |

Writing the regression test first is what proves the fix addresses the reported
behavior rather than something adjacent.

Do not add tests that only restate the implementation — a test asserting that a
mock was called with what you just passed it verifies nothing about behavior.

See [quality.md](quality.md#tests) for the commands and the tooling each stack
uses.
