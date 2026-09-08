---
id: integration-index
title: Integration guide
description: External integration scope, current availability, and entry point for client developers and their agents.
type: overview
audience:
  - integrator
  - agent
status: active
---

# Integration Guide

This section is for developers and agents integrating external systems with a
product built from this repository. It is the canonical source for integration
workflows, consumer-visible behavior, and compatibility guidance. Repository
development instructions live in the [repository guide](../repository/README.md).

## Current Availability

The boilerplate publishes a documentation website and public documentation MCP.
It has no business API or product credentials. Start with the
[local health example](health.md), [integration quickstart](getting-started.md),
[conventions](conventions.md), or [API directory](../api/README.md).

## Content Added With Product Features

As actual external capabilities are implemented, add focused guides here for:

- Getting access, choosing an environment, and completing the first interaction.
- Authentication and permissions, including tenant boundaries where applicable.
- Feature workflows: prerequisites, call or message order, examples, expected
  results, errors, and recovery.
- Applicable delivery, retry, idempotency, pagination, and rate-limit behavior.
- Webhooks, events, file formats, SDK contracts, or other supported interfaces.
- Versioning, deprecations, breaking changes, and consumer migration steps.

Document only implemented behavior. Do not invent authentication, delivery
guarantees, or domain workflows to fill an outline. Mark template examples and
unsupported capabilities explicitly. Link to generated API/schema references
instead of maintaining a second copy of their field definitions.

## MCP Consumers

The [project MCP](mcp/README.md) publishes these integration guides and generated
contracts from the same revision as the website. Default search covers integration
and references; explicit repository/all scopes include contributor rules.
The [quickstart](mcp/quickstart.md) covers setup and discovery.

The servers in [repository MCP tooling](../repository/mcp-servers.md) assist
repository development and are separate from this public consumer endpoint.

## Keeping This Section Current

An externally visible contract change must update its integration guide in the
same change, together with applicable schemas and examples. Feature owners and
reviewers follow the [documentation rules](../repository/documentation.md).
Run `pnpm docs:check` to validate published coverage and content.
