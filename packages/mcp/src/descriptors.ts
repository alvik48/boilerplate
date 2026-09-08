import { z } from 'zod';
import { documentOutput, searchOutput, apiListOutput, operationOutput, exampleDocument } from './schemas.js';

const cursor = z.string().max(120).optional();
const id = z.string().min(1).max(120);
export interface ToolDescriptor {
  name: string;
  description: string;
  input: z.ZodObject;
  output: z.ZodObject;
  implementation: string;
  guideIds: string[];
  requiredScopes: string[];
  examples: { input: Record<string, unknown>; output: Record<string, unknown> }[];
  annotations: { readOnlyHint: boolean; destructiveHint: boolean; idempotentHint: boolean; openWorldHint: boolean };
  serviceId?: string;
  operationId?: string;
}
const base = {
  requiredScopes: [],
  guideIds: ['mcp-quickstart', 'mcp-examples'],
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
};
export const documentationTools: ToolDescriptor[] = [
  {
    ...base,
    name: 'search_docs',
    description:
      'Search integration guides and API/MCP references by default. Use repository or all explicitly for contributor guidance.',
    implementation: 'documentation.search',
    output: searchOutput,
    input: z.object({
      query: z.string().trim().min(1).max(200),
      scope: z.enum(['integration', 'repository', 'all']).default('integration'),
      service: id.optional(),
      type: id.optional(),
      limit: z.number().int().min(1).max(20).default(10),
      cursor,
    }),
    examples: [{ input: { query: 'health' }, output: { revision: 'example', scope: 'integration', items: [] } }],
  },
  {
    ...base,
    name: 'get_doc',
    description:
      'Read a published document by stable ID, optionally a heading. Follow nextCursor for the remaining Markdown.',
    implementation: 'documentation.getDoc',
    output: documentOutput,
    input: z.object({ id, heading: id.optional(), cursor }),
    examples: [
      {
        input: { id: 'integration-index' },
        output: exampleDocument,
      },
    ],
  },
  {
    ...base,
    name: 'list_apis',
    description: 'Discover example and product service contracts, versions, spec URLs, and related integration guides.',
    implementation: 'documentation.listApis',
    output: apiListOutput,
    input: z.object({ cursor }),
    examples: [{ input: {}, output: { revision: 'example', items: [] } }],
  },
  {
    ...base,
    name: 'get_api_operation',
    description: 'Read an operation contract and its integration guide links; this never executes the operation.',
    implementation: 'documentation.getApiOperation',
    output: operationOutput,
    input: z.object({ serviceId: id, operationId: id }),
    examples: [
      {
        input: { serviceId: 'backend-template', operationId: 'getHealth' },
        output: {
          ...exampleDocument,
          id: 'api-backend-template-gethealth',
          serviceId: 'backend-template',
          operationId: 'getHealth',
          specUrl: 'http://localhost:3002/openapi/backend-template.json',
          guideIds: ['integration-health'],
          contract: { path: '/health', method: 'get', operation: { operationId: 'getHealth' }, parameters: [] },
        },
      },
    ],
  },
];

export function descriptorCatalog(descriptors = documentationTools) {
  const names = new Set<string>();
  return descriptors.map((descriptor) => {
    if (names.has(descriptor.name)) throw new Error(`Duplicate MCP tool: ${descriptor.name}`);
    names.add(descriptor.name);
    for (const example of descriptor.examples) {
      descriptor.input.parse(example.input);
      descriptor.output.parse(example.output);
    }
    return {
      name: descriptor.name,
      description: descriptor.description,
      inputSchema: z.toJSONSchema(descriptor.input),
      outputSchema: z.toJSONSchema(descriptor.output),
      annotations: descriptor.annotations,
    };
  });
}
