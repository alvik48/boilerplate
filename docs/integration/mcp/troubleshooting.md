---
id: 'mcp-troubleshooting'
title: 'MCP troubleshooting'
description: 'Transport behavior, input limits and error recovery.'
type: 'guide'
audience: ['integrator', 'agent']
status: 'active'
---

# MCP Troubleshooting

The implementation pins official SDK `1.30.0`, whose latest negotiated protocol is
`2025-11-25`. It also supports `2025-06-18`, `2025-03-26`, `2024-11-05` and
`2024-10-07` through the SDK compatibility list. Automated tests exercise current
SDK clients and `2025-03-26`. It does not advertise the later `2026-07-28` revision.

## HTTP Behavior

Use POST with `Content-Type: application/json` and
`Accept: application/json, text/event-stream`. Responses use the SDK's JSON mode
of Streamable HTTP. There is no persistent session or standalone SSE stream;
GET and DELETE return 405. Legacy HTTP+SSE endpoints are not provided.

| Result       | Meaning and recovery                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| 400          | Malformed request or unsupported protocol header; use a supported SDK client.                                           |
| 403          | Host or browser Origin differs from the canonical docs origin. Correct the URL or deployment configuration.             |
| 406 / 415    | Check Accept and Content-Type headers.                                                                                  |
| 408          | Request exceeded 10 seconds or was cancelled. Retry a smaller read if appropriate.                                      |
| 413          | Request body exceeded 64 KiB.                                                                                           |
| 429          | Process budget of 120 requests per minute exhausted; follow Retry-After. Deployments also need proxy limits per client. |
| Tool isError | Unknown document/operation, stale cursor, invalid arguments or response budget exceeded.                                |

## Read Limits

Queries have 1–200 characters; IDs and headings have 1–120. Search returns at most
20 results per page, resource lists at most 20 entries, and document chunks at most
12,000 characters. Tool responses are capped at 60 KB. Prefer search and individual
guides; `llms-full.txt` is an explicit complete export for offline processing.

Cancellation is passed to tool handlers. This public server has only bounded
in-memory documentation reads. Future network handlers must honor AbortSignal.
An API playground connection error is separate from MCP availability: start the
selected backend as described in the [health guide](../health.md).
