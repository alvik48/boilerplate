import { z } from 'zod';

import type { ExternalContract, OpenAPIV3, ServiceRegistration } from '@packages/api-contracts';

export const metadataSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['overview', 'guide', 'reference', 'workflow']),
  audience: z.array(z.enum(['developer', 'integrator', 'agent'])).min(1),
  status: z.string().optional(),
  service: z.string().optional(),
  tags: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
  examples: z
    .array(
      z.object({
        contractId: z.string(),
        responseStatus: z.string(),
        mediaType: z.string(),
        jsonBlock: z.number().int().nonnegative(),
      }),
    )
    .default([]),
});
export type Metadata = z.infer<typeof metadataSchema>;
export type Section = 'overview' | 'integration' | 'api' | 'repository';
export type SearchScope = 'integration' | 'repository' | 'all';
export interface Document extends Metadata {
  path: string;
  url: string;
  sourcePath: string;
  section: Section;
  markdown: string;
  headings: { id: string; title: string; depth: number }[];
  hash: string;
  revision: string;
  contractIds: string[];
  operationId?: string;
  generated?: boolean;
}
export interface PublishedApi extends ServiceRegistration {
  spec: OpenAPIV3.Document;
  specUrl: string;
  referenceUrl: string;
  guideIds: string[];
}
export interface Manifest {
  revision: string;
  origin: string;
  documents: Document[];
  apis: PublishedApi[];
  contracts: ExternalContract[];
}
export interface SearchInput {
  query: string;
  scope?: SearchScope;
  service?: string;
  type?: string;
  limit?: number;
  cursor?: string;
}
