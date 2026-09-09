export { renderOperation } from './markdown.js';
export { operations, stableJson, validateExample, validateOpenApi } from './validation.js';
export type { OpenAPIV3 } from 'openapi-types';

export interface ServiceRegistration {
  id: string;
  package: string;
  artifact: string;
  name: string;
  version: string;
  description: string;
  environments: { url: string; description: string }[];
  /** The only authored operation-to-guide association. */
  guides: Record<string, string[]>;
}

export interface ExternalContract {
  id: string;
  kind: 'event' | 'webhook' | 'sdk' | 'file';
  owner: string;
  version: string;
  guideIds: string[];
  schema?: string;
}
