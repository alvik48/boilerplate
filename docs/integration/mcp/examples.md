---
id: 'mcp-examples'
title: 'MCP examples'
description: 'Discover a workflow and retrieve matching operation details.'
type: 'guide'
audience: ['integrator', 'agent']
status: 'active'
---

# MCP Examples

Use the connected client from the [quickstart](quickstart.md). These calls are
covered by the documentation integration tests.

## Search and Read a Workflow

```ts
await client.callTool({ name: 'search_docs', arguments: { query: 'health' } });
await client.callTool({ name: 'get_doc', arguments: { id: 'integration-health' } });
await client.callTool({ name: 'list_apis', arguments: {} });
await client.callTool({
  name: 'get_api_operation',
  arguments: {
    serviceId: 'backend-template',
    operationId: 'getHealth',
  },
});
```

The guide explains prerequisites and errors. The operation provides readable
request/response semantics, spec URL and `integration-health` guide links. All
results carry the same content revision. Calls read documentation and never send
`GET /health` themselves.

## Read More and Choose a Scope

Follow `nextCursor` with the same tool and original inputs until it is absent.
If the revision changes, restart discovery. `get_doc` can select a heading by its
anchor ID. Documents are returned in chunks of at most 12,000 characters.

```ts
await client.callTool({
  name: 'search_docs',
  arguments: {
    query: 'Turborepo',
    scope: 'repository',
  },
});
await client.readResource({ uri: 'openapi://project/backend-template' });
```

OpenAPI resources contain a JSON envelope with `json` (the artifact chunk),
`specUrl`, `revision`, and optional `nextCursor`. Concatenate chunks or download
`specUrl` for the complete JSON artifact. Resource discovery pages contain up to
20 entries. Unknown IDs and stale cursors return errors, never filesystem contents.
