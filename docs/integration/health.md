---
id: 'integration-health'
title: 'Local health example'
description: 'Run and verify the backend template health endpoint without infrastructure.'
type: 'guide'
audience: ['integrator', 'agent']
status: 'active'
---

# Local Health Example

The owning service is `@apps/backend-template`, service ID `backend-template`, API
version `0.0.1`. It is an example, not a deployed product API. No credentials,
database, Redis, or external API are required.

## Run and Call

From the repository root:

```sh
pnpm install
pnpm openapi:generate
pnpm --filter @apps/backend-template start:prod
```

In another terminal:

```sh
curl -i http://localhost:3000/health
```

Expected response: HTTP 200 and the following JSON body:

```json
{ "status": "ok" }
```

The response confirms that this process is responding. It does not report database
or downstream health. GET has no side effects and is safe to repeat. The example
has no rate limit, timeout guarantee, pagination, authentication, or retry policy.

## Reference and Playground

The operation ID is `getHealth`. Open the
[generated operation](/docs/api/backend-template/getHealth) for schemas, code samples
and the request playground. The environment selector defaults to the absolute local
backend URL. Press Send to execute the request. Documentation works while the
backend is stopped; a playground network error usually means it is not running.

The backend allows requests from `http://localhost:3002` by default. Set its
`DOCS_ORIGINS` for another documentation origin. Credentials are not required or
sent for the health request. [Download the contract](/openapi/backend-template.json).

## Failures and Compatibility

An unknown route returns Nest's HTTP 404 response. A stopped backend produces a
connection error, not a JSON health response. There is no released product API
compatibility baseline yet. Product forks must establish their version policy and
migration guidance before their first supported API release.
