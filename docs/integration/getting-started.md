---
id: 'integration-getting-started'
title: 'Start an integration'
description: 'Discover supported contracts and choose HTTP or MCP.'
type: 'guide'
audience: ['integrator', 'agent']
status: 'active'
---

# Start an Integration

This boilerplate has no product credentials or business workflows. Start with the
[health example](health.md) for HTTP or the [MCP quickstart](mcp/quickstart.md) to
retrieve integration knowledge with an agent.

## Discover Before Calling

Use the [API directory](../api/README.md) to identify a service and environment.
The example server is `http://localhost:3000`; start it yourself. The documentation
server is `http://localhost:3002` and never proxies API requests.

MCP tools return document IDs, canonical URLs, related guides and a content revision.
Read the guide and matching operation before writing an integration. Search defaults
to Integration and contract references; use `scope: repository` for contributor rules.
