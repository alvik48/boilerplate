---
id: 'mcp-index'
title: 'Documentation MCP'
description: 'Public agent access to integration guides and contracts.'
type: 'overview'
audience: ['integrator', 'agent']
status: 'active'
---

# Documentation MCP

Connect to `http://localhost:3002/mcp` locally using Streamable HTTP. The deployed
endpoint uses your documentation origin with `/mcp`. All documentation is public;
this service does not execute API operations or provide product credentials.

## Start Here

- [Quickstart](quickstart.md): connect, discover, search and read.
- [Examples](examples.md): a complete guide-to-contract workflow.
- [Authentication](authentication.md): public access and future product authorization.
- [Troubleshooting](troubleshooting.md): protocol versions, errors and limits.

The onboarding resource is `docs://project/integration-index`. `resources/list`
paginates all public documents and specs, including Repository. Default `search_docs`
searches integration guides and API/MCP references. Contributor information is
available with explicit `repository` or `all` scope.
