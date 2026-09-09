import { z } from 'zod';

const cursor = z.string().optional();
const revision = z.string();
const link = z.object({ id: z.string(), title: z.string(), url: z.string() });

export const documentOutput = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  sourcePath: z.string(),
  hash: z.string(),
  revision,
  related: z.array(link),
  contractIds: z.array(z.string()),
  markdown: z.string().max(12000),
  nextCursor: cursor,
});
export const searchOutput = z.object({
  scope: z.enum(['integration', 'repository', 'all']),
  revision,
  nextCursor: cursor,
  items: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        section: z.enum(['overview', 'integration', 'api', 'repository']),
        url: z.string(),
        excerpt: z.string().max(360),
        revision,
        score: z.number(),
        matched: z.number(),
      }),
    )
    .max(20),
});
export const apiListOutput = z.object({
  revision,
  nextCursor: cursor,
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        version: z.string(),
        description: z.string(),
        specUrl: z.string(),
        referenceUrl: z.string(),
        guideIds: z.array(z.string()),
        environments: z.array(z.object({ url: z.string(), description: z.string() })),
      }),
    )
    .max(20),
});
export const operationOutput = documentOutput.extend({
  serviceId: z.string(),
  operationId: z.string(),
  specUrl: z.string(),
  guideIds: z.array(z.string()),
  contract: z.object({
    path: z.string(),
    method: z.string(),
    operation: z.record(z.string(), z.unknown()),
    parameters: z.array(z.unknown()),
  }),
});
export const exampleDocument = {
  revision: 'example',
  id: 'integration-index',
  title: 'Integration guide',
  url: 'http://localhost:3002/docs/integration',
  sourcePath: 'docs/integration/README.md',
  hash: 'example-content-hash',
  related: [],
  contractIds: [],
  markdown: '# Integration Guide',
};
