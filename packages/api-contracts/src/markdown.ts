import type { OpenAPIV3 } from 'openapi-types';

import { operations, stableJson } from './validation.js';

/** Keep $ref identity and include each reachable schema once, including recursive types. */
export const renderOperation = (spec: OpenAPIV3.Document, operationId: string) => {
  const entry = operations(spec).find((item) => item.operation.operationId === operationId);

  if (!entry) {
    throw new Error(`Unknown operation: ${operationId}`);
  }

  const { method, path, operation, parameters } = entry;
  const contract = {
    ...operation,
    parameters: [...parameters, ...(operation.parameters ?? [])],
    security: operation.security ?? spec.security ?? [],
    servers: operation.servers ?? spec.paths[path]?.servers ?? spec.servers ?? [],
  };
  const schemas: Record<string, unknown> = {};

  const visit = (value: unknown): void => {
    if (!value || typeof value !== 'object') {
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      if (key === '$ref' && typeof child === 'string' && !(child in schemas)) {
        const target = child
          .slice(2)
          .split('/')
          .reduce<unknown>((current, part) => {
            if (!current || typeof current !== 'object') {
              return undefined;
            }

            return (current as Record<string, unknown>)[part.replace(/~1/g, '/').replace(/~0/g, '~')];
          }, spec);

        schemas[child] = target;
        visit(target);
      } else if (key !== '$ref') {
        visit(child);
      }
    }
  };

  visit(contract);
  const json = (value: unknown) => `\n\n\`\`\`json\n${stableJson(value)}\`\`\`\n`;

  return `# ${operation.summary}\n\n${method.toUpperCase()} \`${path}\`\n\n${operation.description}\n\nOperation ID: \`${operationId}\`. API version: \`${spec.info.version}\`.\n\n## Environments${json(contract.servers)}\n## Authentication\n\n${contract.security.length ? 'Use your own credentials. Required alternatives:' + json({ security: contract.security, schemes: spec.components?.securitySchemes }) : 'Public endpoint; no credentials required.'}\n\n## Parameters${json(contract.parameters)}\n## Request body${operation.requestBody ? json(operation.requestBody) : '\n\nNo request body.\n'}\n## Responses${json(operation.responses)}\n## Schemas${json(schemas)}`;
};
