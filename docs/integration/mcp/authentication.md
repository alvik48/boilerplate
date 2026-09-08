---
id: 'mcp-authentication'
title: 'MCP authentication'
description: 'Public documentation access and product-tool authorization boundaries.'
type: 'guide'
audience: ['integrator', 'agent']
status: 'active'
---

# MCP Authentication

The documentation endpoint is public. It needs no API key, OAuth token or product
account. Public access includes Repository resources. Host and browser Origin must
match the configured canonical documentation origin.

## Future Product Tools

No executable business tools ship with this template. A product tool must supply
an authenticated context, required scopes, tenant boundaries and an injected
handler. The shared server enforces declared scopes before calling that handler.
Tool annotations describe behavior and do not grant authorization.

Integration teams should follow the product's authentication guide when those
capabilities are introduced. Contributor setup is documented in
[extending MCP](../../repository/mcp-extending.md).
