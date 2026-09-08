---
id: 'getting-started'
title: 'Choose your entry point'
description: 'Start with the HTTP example, public MCP, or repository development.'
type: 'guide'
audience: ['developer', 'integrator', 'agent']
status: 'active'
---

# Choose Your Entry Point

The boilerplate publishes a documentation website and a public documentation MCP.
The only HTTP example is the backend template health endpoint; no business API is deployed.

- External clients: follow the [integration guide](integration/README.md).
- HTTP: run the [local health example](integration/health.md), then inspect the [API directory](api/README.md).
- Agents: follow the [MCP quickstart](integration/mcp/quickstart.md).
- Contributors: start with the root [README](../README.md) and [repository guide](repository/README.md).

## Local Documentation

Use Node.js 24.11 or newer and pnpm 10.20.0. From the repository root:

```sh
pnpm install
pnpm docs:dev
```

Open http://localhost:3002/docs. The initial Turbo graph builds shared packages,
compiles the backend, generates and validates OpenAPI, and prepares documentation.
The backend need not be listening for the site or MCP to work.
