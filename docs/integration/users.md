---
id: 'integration-users'
title: 'Local users example'
description: 'List the backend template example users and filter them by derived account status.'
type: 'guide'
audience: ['integrator', 'agent']
status: 'active'
---

# Local Users Example

The owning service is `@apps/backend-template`, service ID `backend-template`, API
version `0.0.1`. It is an example, not a deployed product API. No credentials,
database, Redis, or external API are required — the data is a fixed in-process
set.

This example exists to show a complete request path through every layer:
a controller that only routes, a use-case service that sequences the work, a
domain rule that decides status, and a data module that supplies records. See
[backend layer responsibilities](../repository/backend.md#layer-responsibilities).

## Run and Call

From the repository root:

```sh
pnpm install
pnpm openapi:generate
pnpm --filter @apps/backend-template start:prod
```

In another terminal:

```sh
curl -i http://localhost:3000/users
```

Expected response: HTTP 200 and the following JSON body:

```json
[
  { "id": "u_1", "name": "Ada Lovelace", "status": "active" },
  { "id": "u_2", "name": "Grace Hopper", "status": "idle" },
  { "id": "u_3", "name": "Alan Turing", "status": "dormant" },
  { "id": "u_4", "name": "Katherine Johnson", "status": "suspended" }
]
```

## Account Status

`status` is derived per request from the user's last activity, not stored:

| Status      | Meaning                                           |
| ----------- | ------------------------------------------------- |
| `suspended` | The account is suspended. This wins over recency. |
| `active`    | Seen within the last 7 days, inclusive.           |
| `idle`      | Seen between 8 and 30 days ago, inclusive.        |
| `dormant`   | Not seen for more than 30 days.                   |

The example data is seeded as offsets from the current time rather than as fixed
dates, so exactly one user resolves to each status whenever you run it.

## Filtering

Pass `status` to return only users resolving to that value:

```sh
curl -i "http://localhost:3000/users?status=active"
```

Expected response: HTTP 200 and the following JSON body:

```json
[{ "id": "u_1", "name": "Ada Lovelace", "status": "active" }]
```

A value outside the four documented statuses is rejected with HTTP 400. Omitting
the parameter returns every user.

GET has no side effects and is safe to repeat. The example has no rate limit,
timeout guarantee, pagination, authentication, or retry policy. Results are not
ordered by any documented key beyond the seeded order.

## Reference and Playground

The operation ID is `listUsers`. Open the
[generated operation](/docs/api/backend-template/listUsers) for schemas, code
samples and the request playground. The environment selector defaults to the
absolute local backend URL. Press Send to execute the request. Documentation
works while the backend is stopped; a playground network error usually means it
is not running.

The backend allows requests from `http://localhost:3002` by default. Set
`DOCS_ORIGINS` on the backend to allow another documentation origin.

## Compatibility

This is a template example and carries no compatibility promise. Replace it when
building a real service: keep the layer boundaries, replace the data module with
a `packages/db-*` client, and rewrite this guide for the real operation.
