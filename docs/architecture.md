---
id: 'architecture'
title: 'Documentation architecture'
description: 'Content ownership and the shared publication boundary.'
type: 'guide'
audience: ['developer', 'integrator', 'agent']
status: 'active'
---

# Documentation Architecture

Authored Markdown lives in `docs/`. Nest controllers and DTOs own HTTP schemas;
MCP tool descriptors own tool schemas. Their contracts link to authored integration
guides once, and the generator derives reverse links.

## Publication Flow

1. The backend compiles with the Nest Swagger plugin and generates a bundled OpenAPI artifact offline.
2. `packages/docs-core` validates metadata, links and guide coverage and creates a manifest.
3. `apps/frontend.docs` derives a Fumadocs collection and publishes the website, search, Markdown, specs and MCP from that manifest.

`packages/api-contracts` separates Nest helpers from generic validators and Markdown
rendering. `packages/mcp` accepts a documentation provider and injected tool handlers;
it does not import application code or access a database.

## Release Boundary

The revision contains a deterministic content hash, optionally prefixed by
`DOCS_REVISION`. API versions describe service contracts independently of documentation
revisions. The standalone Node deployment contains all necessary content; production
does not read Markdown from the checkout. See [deployment](repository/docs-deployment.md).
