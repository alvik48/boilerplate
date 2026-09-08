---
id: repository-documentation
title: 'Documentation Development Rules'
description: 'Documentation Development Rules for contributors working in this monorepo.'
type: guide
audience: [developer, agent]
---

# Documentation Development Rules

## Audiences And Sources

- `docs/integration/` is the canonical authored documentation for external client
  developers and their agents. Describe how to integrate with the product and
  what consumers can rely on.
- `docs/repository/` contains instructions for developing and operating this
  monorepo. Keep implementation and tool-registration instructions here.
- `docs/api/` is reserved for the authored API directory and reference entry
  points. Generate operation/schema
  references from owning contracts; keep workflow explanations in integration
  guides and cross-link them.
- Consumer MCP setup and usage belong in `docs/integration/mcp/`. `docs/repository/mcp-servers.md` describes development tooling.
- Root `README.md` remains the development entry point; `docs/README.md` is the
  public documentation index. All `docs/` content is intended to be public.
- Temporary plans belong in `.agents/plans/` and must never become published
  documentation or MCP resources. Follow the [plan lifecycle](change-workflow.md#temporary-implementation-plans).

The publication pipeline is implemented by `apps/frontend.docs`, `packages/docs-core`,
`packages/api-contracts` and `packages/mcp`. Run `pnpm docs:check` for structural
validation and consult [deployment](docs-deployment.md) for release configuration.

## When Integration Documentation Must Change

The feature owner must assess external impact for every feature and behavior
change. Update relevant integration guides in the same change when adding,
changing, deprecating, or removing any consumer-visible capability, including:

- HTTP endpoints, request/response schemas, status codes, or error semantics.
- Authentication, permissions, tenant boundaries, or credential requirements.
- Webhooks and events: payloads, subscriptions, signatures, ordering, delivery,
  acknowledgment, and retry behavior.
- MCP tools/resources, SDK exports, file formats, or other external contracts.
- Behavior consumers depend on: workflow order, state transitions, side effects,
  validation constraints, idempotency, limits, or compatibility guarantees.
- Integration configuration, environment URLs, versions, or support/deprecation
  policies.

A behavior change can need documentation even if its schema is unchanged.
Updating OpenAPI alone does not document a workflow, operational constraints, or
migration steps. Internal refactors with no consumer-visible effect do not need
artificial integration prose changes; record that conclusion and its reason in
the change description or review.

## What A Guide Must Explain

For each supported integration feature, provide the applicable information:

1. Purpose, availability, owning service or package, and supported version.
2. Prerequisites, environment selection, access, and required permissions.
3. Interaction sequence and links to canonical operation or contract identifiers.
4. Sanitized, reproducible examples with expected results and relevant failures.
5. Side effects, limits, timeouts, retries, idempotency, or delivery semantics
   that the consumer needs to handle.
6. Compatibility impact and migration steps for changed or removed behavior.

Only describe behavior verified against implementation and configuration. Omit
irrelevant sections or explain a meaningful unsupported capability; do not
manufacture business logic for the template. Label example services clearly.

Use ordinary Markdown with one H1, descriptive headings, and relative source
links that work from the checkout. New integration documents must include stable
`id`, `title`, `description`, `type`, and `audience` frontmatter, following
[the integration index](../integration/README.md). Preserve IDs when moving files.
Use `audience: [integrator, agent]` for client guidance. Add `status` when needed
to explain availability and `related` document IDs when connecting guides.

Keep one canonical guide per concern. Do not copy prose into a separate MCP
directory or hand-edit generated references. Contract schemas stay with their
owning code; prose explains how to use them and links to their references.

## Publication And MCP Contract

The implemented publication contract:

- Present Integration, API, and Repository as peer top-level Fumadocs sections.
  MCP consumer guidance belongs within Integration.
- Publish `docs/integration/**` and generated API/MCP references through the same
  content manifest, search corpus, Markdown exports, and project MCP resources.
- Use the integration index for external MCP onboarding and default search to
  integration guides and contract references. Keep the full public corpus
  discoverable as resources and offer explicit repository/all search scopes.
  Use section metadata to distinguish these audiences.
- Return stable document IDs, canonical URLs, content revision, and related guide
  links with contract results. Preserve readable prose in machine output.
- Validate guide-to-contract links, examples, and contract coverage. A published
  external capability must have relevant integration guidance; one guide may
  cover several related operations.
- Regenerate all affected outputs and release guides, references, search, and MCP
  content together. Remove stale generated entries when a contract disappears;
  retain the consumer-facing deprecation or migration explanation as appropriate.

The project MCP server consumes integration documentation as part of its product
contract. Publishing only repository instructions or only generated schemas does
not meet this requirement. Public documentation access and authorization to
execute future product tools are separate contracts.

## Review And Definition Of Done

For every externally visible change, reviewers must confirm:

- The implementation, owning contract/schema, and integration guide agree.
- Examples and applicable error/recovery behavior were verified.
- Breaking changes or removals have a compatibility decision and migration
  guidance; no version policy is implied before one is explicitly established.
- Documentation links and discovery entries are current.
- Documentation generation, contract validation, and relevant
  website/MCP checks pass for the same revision.

Automated checks can validate structure, links, schema examples, and declared
coverage. Reviewers must still verify the completeness and accuracy of prose.
Run `pnpm docs:check`, relevant tests and browser checks. Review semantic prose and
compatibility decisions separately; a guide association cannot prove prose accuracy.

## Generation and Authoring Commands

Run `pnpm docs:dev` for root Markdown hot reload, including add/rename/delete.
The generator validates root docs and emits a normalized Fumadocs Markdown collection
under `apps/frontend.docs/generated/content/`; it never writes to authored docs.
Fumadocs compiles that derived collection, while exports/search/MCP use its manifest.
This normalization makes Git-relative links usable on the site without a second
hand-maintained corpus. Do not edit generated files or `.source/` imports.

Every document has one H1. Generated browser content omits that H1 because DocsTitle
renders it; exported Markdown retains it. IDs are unique and stable. README files
map to section indexes. Namespace `/docs/api/<service>/<operation>` and
`/docs/integration/mcp/tools/<tool>` is reserved for generation.

Use relative source links in authored prose. Generated operation/spec links can use
their absolute site paths. Source links outside docs resolve through `DOCS_SOURCE_URL`.
Plans, skills, symlinks and raw HTML are excluded. `meta.json` ordering is optional;
all manifest documents remain discoverable even if absent from an ordering list.

Operation-to-guide associations live in `services.ts`; MCP guide associations live
in tool descriptors. The API directory's service entries and operation links are
derived from the same registry, including in Markdown and MCP exports.
Other implemented contract kinds use `externalContracts` with
stable ID, owner, version, guide IDs and an optional schema path under `docs/` or
a workspace `schemas/` directory. These schema files participate in task hashes
and the publication revision. Reverse links are
derived. Update these associations and actual guides with every external change.

Run `pnpm docs:generate`, `pnpm docs:check`, and `pnpm docs:build` from the root.
Task hashes include root docs, workspace metadata, registry, task graph, public URL
configuration and revision. Generated references, Fumadocs preparation and Next output
have separate output directories. Consumer tests verify public examples and transport.
