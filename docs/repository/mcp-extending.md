---
id: repository-mcp-extending
title: 'Extending project MCP'
description: 'Extending project MCP and verification instructions.'
type: guide
audience: [developer, agent]
---

# Extending Project MCP

The public endpoint exposes only documentation tools. `packages/mcp` contains
`ToolDescriptor`, `createProjectServer`, and `createMcpHandler`. Business logic stays
in an owning backend or shared domain package, injected through `handlers`.

## Register a Product Tool

1. Define a stable name, description, Zod input/output objects, implementation key,
   realistic examples and readOnly/destructive/idempotent/openWorld annotations.
2. Set `guideIds` and `requiredScopes`. Optionally associate a service/operation.
3. Implement the handler and inject it with an authenticated `AuthorizationContext`.
   The factory checks required scopes before execution. The handler enforces tenant
   ownership and accepts AbortSignal for cancellation.
4. Add actual integration guidance and include the descriptor in both generation
   and server construction. Project metadata never becomes invented protocol fields.
5. Run `pnpm docs:check` and MCP tests. The test-only echo descriptor demonstrates
   successful authorization and denied execution; it is absent from production.

Do not automatically turn OpenAPI operations into executable tools. A future auth
adapter must validate credentials, populate scopes/tenant context and protect backend
credentials. The documentation app must not gain a database connection to publish docs.

## Public Transport

The Next Node route delegates framing and protocol validation to the official SDK.
Host and Origin validation uses middleware because SDK 1.30 deprecates its transport
options for those checks. The handler caps input bytes, response size and execution
time. A per-process budget is a backstop; enforce per-client limits at the proxy.

See [consumer MCP](../integration/mcp/README.md) for the public contract.
