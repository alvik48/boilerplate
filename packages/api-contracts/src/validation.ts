import SwaggerParser from '@apidevtools/swagger-parser';
import { Ajv } from 'ajv';
import type { OpenAPIV3 } from 'openapi-types';

const methods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;

export function stableJson(value: unknown): string {
  return (
    JSON.stringify(
      value,
      (_key, item: unknown) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          return Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b, 'en')));
        }
        return item;
      },
      2,
    ) + '\n'
  );
}

export function operations(spec: OpenAPIV3.Document) {
  return Object.entries(spec.paths).flatMap(([path, item]) =>
    methods.flatMap((method) => {
      const operation = item?.[method];
      return operation ? [{ path, method, operation, parameters: item?.parameters ?? [] }] : [];
    }),
  );
}

export async function validateOpenApi(input: unknown): Promise<OpenAPIV3.Document> {
  // Published artifacts must be bundled. Never resolve network or arbitrary file references here.
  const inspect = (value: unknown): void => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (key === '$ref' && (typeof child !== 'string' || !child.startsWith('#/'))) {
        throw new Error('OpenAPI artifacts must contain only bundled local #/ references');
      }
      inspect(child);
    }
  };
  inspect(input);
  const spec = await SwaggerParser.validate(structuredClone(input) as OpenAPIV3.Document, {
    resolve: { external: false },
    dereference: { circular: 'ignore' },
  });
  if (!('openapi' in spec) || !spec.openapi.startsWith('3.0.')) throw new Error('Expected OpenAPI 3.0.x');
  const document = input as OpenAPIV3.Document;
  const validateMedia = (content: Record<string, OpenAPIV3.MediaTypeObject>) => {
    for (const media of Object.values(content)) {
      if (!media.schema) throw new Error('Missing media schema');
      if (media.example !== undefined) validateExample(document, media.schema, media.example);
      for (const example of Object.values(media.examples ?? {})) {
        if (!('$ref' in example) && example.value !== undefined) validateExample(document, media.schema, example.value);
      }
    }
  };
  const ids = new Set<string>();
  for (const { path, method, operation } of operations(document)) {
    if (!operation.operationId || !/^[a-zA-Z][\w-]*$/.test(operation.operationId) || ids.has(operation.operationId)) {
      throw new Error(`Missing, duplicate, or unsafe operationId: ${method} ${path}`);
    }
    ids.add(operation.operationId);
    if (!operation.summary || !operation.description || !Object.keys(operation.responses).length) {
      throw new Error(`Incomplete operation metadata: ${operation.operationId}`);
    }
    if (operation.requestBody && !('$ref' in operation.requestBody)) validateMedia(operation.requestBody.content);
    for (const parameter of [...(document.paths[path]?.parameters ?? []), ...(operation.parameters ?? [])]) {
      if ('$ref' in parameter) continue;
      if (!parameter.schema && !parameter.content)
        throw new Error(`Missing parameter schema: ${operation.operationId}`);
      if (parameter.schema && parameter.example !== undefined)
        validateExample(document, parameter.schema, parameter.example);
      if (parameter.content) validateMedia(parameter.content);
    }
    for (const response of Object.values(operation.responses)) {
      if ('$ref' in response) continue;
      if (!response.description) throw new Error(`Missing response description: ${operation.operationId}`);
      validateMedia(response.content ?? {});
    }
  }
  if (!ids.size) throw new Error('HTTP service has no documented operations');
  return document;
}

export function validateExample(
  spec: OpenAPIV3.Document,
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  example: unknown,
) {
  const ajv = new Ajv({ strict: false, validateFormats: false });
  const validate = ajv.compile({ ...schema, components: spec.components });
  if (!validate(example)) throw new Error(`Invalid contract example: ${ajv.errorsText(validate.errors)}`);
}
