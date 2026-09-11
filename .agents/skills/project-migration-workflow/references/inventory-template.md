# Migration plan: `<legacy project name>`

Copy this file to `.agents/plans/<slug>-migration.md` and fill it in. It is the
only state for the migration; keep it current as phases complete. Lifecycle rules:
[temporary implementation plans](../../../../docs/repository/change-workflow.md#temporary-implementation-plans).

- **Source:** `<path or repository URL>` at revision `<sha>`
- **Started:** `<YYYY-MM-DD>`
- **Target packages:** `<apps/backend.x, packages/db-y>`
- **Current phase:** `<1-7>`
- **Slice in flight:** `<name, or none>`

## 1. Inventory

Read-only. No edits until this section is complete.

### Processes and entry points

| Process | Legacy file | Type (http/worker/cron/cli) | Keep? |
| ------- | ----------- | --------------------------- | ----- |
|         |             |                             |       |

### HTTP operations

One row per operation. `Consumers` decides how much compatibility prose the guide
needs in phase 6.

| Method + path | Legacy handler | Auth | Request | Response | Consumers | Slice |
| ------------- | -------------- | ---- | ------- | -------- | --------- | ----- |
|               |                |      |         |          |           |       |

### Persistence

| Model / table | Legacy file | ORM | Migrations | Business logic on the model? |
| ------------- | ----------- | --- | ---------- | ---------------------------- |
|               |             |     |            |                              |

### Environment variables

| Variable | Read in | Required | Secret | Target package |
| -------- | ------- | -------- | ------ | -------------- |
|          |         |          |        |                |

Secrets are recorded by **name only**. Never paste a value into the plan.

### Outbound integrations

| Service | Legacy client | Credentials | Failure mode today |
| ------- | ------------- | ----------- | ------------------ |
|         |               |             |                    |

### Tooling

| Concern        | Legacy | Target |
| -------------- | ------ | ------ |
| Test runner    |        |        |
| Lint           |        |        |
| Build          |        |        |
| Node version   |        |        |
| TypeScript     |        |        |

### Dependencies

Only the ones actually imported. Unimported entries are dropped, not ported.

| Package | Legacy version | Target version | `catalog:` / literal / drop |
| ------- | -------------- | -------------- | --------------------------- |
|         |                |                |                             |

## 2. Owner map

| Inventory row | Target path | Why this boundary |
| ------------- | ----------- | ----------------- |
|               |             |                   |

## 3. Dropped

| What | Why it is not ported |
| ---- | -------------------- |
|      |                      |

## 4. Slice queue

One slice is one capability end to end. Statuses: `todo`, `in progress`,
`ported`, `cut over`.

| # | Slice | Operations covered | Characterization test | Status |
| - | ----- | ------------------ | --------------------- | ------ |
| 1 |       |                    |                       | todo   |

## 5. Decisions

Including the options rejected, so they are not re-litigated.

| Decision | Chosen | Rejected alternatives and why |
| -------- | ------ | ----------------------------- |
|          |        |                               |

## 6. Gate status

Updated after each slice. A failing gate is never recorded as passing with a
caveat — fix it or record the slice as blocked.

| Gate                   | Last run | Result |
| ---------------------- | -------- | ------ |
| `lint`                 |          |        |
| `typecheck`            |          |        |
| `test`                 |          |        |
| `build`                |          |        |
| `pnpm deps:check`      |          |        |
| `pnpm docs:check`      |          |        |

## 7. Open risks

| Risk | Affected slice | Mitigation |
| ---- | -------------- | ---------- |
|      |                |            |
