---
id: 'integration-conventions'
title: 'Integration conventions'
description: 'Implemented public access, environments, revisions and error boundaries.'
type: 'guide'
audience: ['integrator', 'agent']
status: 'active'
---

# Integration Conventions

Public documentation and its MCP endpoint require no product credential. The only
HTTP example is the [health workflow](health.md). No business authentication,
tenancy, event delivery or pagination contract is implied.

## Versions and Environments

Use canonical URLs returned by discovery. An API version belongs to its service;
the documentation revision identifies the complete site, references and exports.
A playground request goes directly to the selected absolute backend URL. A service
outage does not prevent reading the contract.

## Errors and Limits

HTTP health failures are documented in its guide. Documentation MCP has bounded
inputs, pagination and request limits described in [troubleshooting](mcp/troubleshooting.md).
Do not apply MCP limits to a future product API without an explicit service contract.

## Compatibility Review

This template has no production baseline. Before releasing an API, save the
previous release's OpenAPI artifact and compare changes during review. Breaking
request, response, permission or workflow changes need a version decision and an
integration migration guide. Schema checks cannot determine behavioral compatibility.
