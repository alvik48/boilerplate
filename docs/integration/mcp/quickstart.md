---
id: 'mcp-quickstart'
title: 'MCP quickstart'
description: 'Connect an official SDK client and read the integration index.'
type: 'guide'
audience: ['integrator', 'agent']
status: 'active'
---

# MCP Quickstart

Run `pnpm docs:dev` from the repository root. The endpoint is
`http://localhost:3002/mcp`; no backend listener or credential is required.
Use the official `@modelcontextprotocol/sdk@1.30.0` client:

```ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const client = new Client({ name: 'integration-client', version: '1.0.0' });
await client.connect(new StreamableHTTPClientTransport(new URL('http://localhost:3002/mcp')));
try {
  const tools = await client.listTools();
  const index = await client.readResource({ uri: 'docs://project/integration-index' });
  const result = await client.callTool({ name: 'search_docs', arguments: { query: 'health' } });
  console.log(tools, index, result);
} finally {
  await client.close();
}
```

Expected tools: `search_docs`, `get_doc`, `list_apis`, `get_api_operation`.
Search returns `scope: integration`, a revision, canonical URLs and excerpts.
Use `get_doc` with the returned ID, then [retrieve the contract](examples.md).

## Client Configuration

For clients supporting a Streamable HTTP URL, set the server URL to `/mcp` on the
canonical documentation origin. No authorization header is needed. Configuration
file formats differ by client; use that client's HTTP-server setting.

The pinned server negotiates protocol `2025-11-25` and tests legacy `2025-03-26`
requests. SDK clients initialize automatically. The stateless endpoint also accepts
individual requests with a supported `MCP-Protocol-Version` header; it issues no
session ID. See [transport details](troubleshooting.md).
