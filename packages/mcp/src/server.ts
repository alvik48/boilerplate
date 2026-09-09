import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { type DocumentationProvider, paginate, type SearchInput } from '@packages/docs-core';

import { descriptorCatalog, documentationTools, type ToolDescriptor } from './descriptors.js';

export interface AuthorizationContext {
  subject?: string;
  scopes: readonly string[];
  tenantId?: string;
}
export type ToolHandler = (
  input: Record<string, unknown>,
  context: AuthorizationContext,
  signal: AbortSignal,
) => Promise<Record<string, unknown>> | Record<string, unknown>;
export interface ServerOptions {
  provider: DocumentationProvider;
  descriptors?: ToolDescriptor[];
  handlers?: Record<string, ToolHandler>;
  authorization?: AuthorizationContext;
}

export const createProjectServer = (options: ServerOptions) => {
  const { provider } = options;
  const descriptors = options.descriptors ?? documentationTools;
  const catalog = descriptorCatalog(descriptors);
  const context = options.authorization ?? { scopes: [] };
  const handlers: Record<string, ToolHandler> = {
    'documentation.search': (input) => provider.search(input as unknown as SearchInput),
    'documentation.getDoc': (input) =>
      provider.getDoc(input.id as string, input.heading as string | undefined, input.cursor as string | undefined),
    'documentation.listApis': (input) => provider.listApis(input.cursor as string | undefined),
    'documentation.getApiOperation': (input) =>
      provider.getApiOperation(input.serviceId as string, input.operationId as string),
    ...options.handlers,
  };

  for (const descriptor of descriptors) {
    if (!handlers[descriptor.implementation]) {
      throw new Error(`Missing MCP handler: ${descriptor.implementation}`);
    }
  }

  const server = new Server(
    { name: 'project-documentation', version: '1.0.0' },
    {
      capabilities: { tools: {}, resources: {} },
      instructions:
        'Start with docs://project/integration-index. Search defaults to integration guides and contract references. Repository guidance is public through explicit repository/all scopes. Tools read documentation; they do not execute API operations.',
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: catalog }));
  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const descriptor = descriptors.find((item) => item.name === request.params.name);

    if (!descriptor) {
      throw new McpError(ErrorCode.InvalidParams, 'Unknown tool');
    }

    try {
      if (descriptor.requiredScopes.some((scope) => !context.scopes.includes(scope))) {
        throw new Error('Forbidden: required scope missing');
      }

      const input = descriptor.input.parse(request.params.arguments ?? {});

      extra.signal.throwIfAborted();
      const result = await handlers[descriptor.implementation](input, context, extra.signal);

      extra.signal.throwIfAborted();
      const structuredContent = descriptor.output.parse(result);
      const text = JSON.stringify(structuredContent);

      if (Buffer.byteLength(text) > 60000) {
        throw new Error('Result exceeds 60 KB. Read a heading or paginated resource.');
      }

      return { content: [{ type: 'text', text }], structuredContent };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: error instanceof Error ? error.message.slice(0, 1000) : 'Tool failed' }],
      };
    }
  });
  const resources = [
    ...provider.manifest.documents.map((doc) => ({
      uri: `docs://project/${doc.id}`,
      name: doc.id,
      title: doc.title,
      description: doc.description,
      mimeType: 'text/markdown',
    })),
    ...provider.manifest.apis.map((api) => ({
      uri: `openapi://project/${api.id}`,
      name: api.id,
      title: api.name,
      description: api.description,
      mimeType: 'application/json',
    })),
  ].sort(
    (a, b) =>
      Number(b.name === 'integration-index') - Number(a.name === 'integration-index') ||
      a.name.localeCompare(b.name, 'en'),
  );

  server.setRequestHandler(ListResourcesRequestSchema, (request) => {
    const page = paginate(resources, provider.manifest.revision, request.params?.cursor);

    return { resources: page.items, nextCursor: page.nextCursor };
  });
  server.setRequestHandler(ListResourceTemplatesRequestSchema, () => ({
    resourceTemplates: [
      { uriTemplate: 'docs://project/{id}{?cursor}', name: 'Document page', mimeType: 'text/markdown' },
      { uriTemplate: 'openapi://project/{id}{?cursor}', name: 'OpenAPI artifact page', mimeType: 'application/json' },
    ],
  }));
  server.setRequestHandler(ReadResourceRequestSchema, (request) => {
    const uri = new URL(request.params.uri);

    if (uri.hostname !== 'project' || [...uri.searchParams.keys()].some((key) => key !== 'cursor')) {
      throw new McpError(ErrorCode.InvalidParams, 'Unknown resource');
    }

    const resource = resources.find((item) => item.uri === `${uri.protocol}//${uri.host}${uri.pathname}`);

    if (!resource) {
      throw new McpError(ErrorCode.InvalidParams, 'Unknown resource');
    }

    const id = uri.pathname.slice(1);
    const cursor = uri.searchParams.get('cursor') ?? undefined;

    if (uri.protocol === 'docs:') {
      const doc = provider.getDoc(id, undefined, cursor);

      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: 'text/markdown',
            text: `${doc.markdown}\n\nCanonical URL: ${doc.url}\nRevision: ${doc.revision}${doc.nextCursor ? `\nContinue: docs://project/${id}?cursor=${encodeURIComponent(doc.nextCursor)}` : ''}`,
          },
        ],
      };
    }

    const spec = provider.manifest.apis.find((item) => item.id === id)!;
    const chunks = JSON.stringify(spec.spec, null, 2).match(/[\s\S]{1,12000}/g) ?? [];
    const page = paginate(chunks, provider.manifest.revision, cursor, 1);

    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            revision: provider.manifest.revision,
            specUrl: spec.specUrl,
            json: page.items[0],
            nextCursor: page.nextCursor,
          }),
        },
      ],
    };
  });

  return server;
};
