import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateOpenApi, renderOperation, stableJson, validateExample } from '../dist/index.js';

const spec = () => ({
  openapi: '3.0.0',
  info: { title: 'Fixture', version: '1' },
  paths: {
    '/items': {
      post: {
        operationId: 'createItem',
        summary: 'Create item',
        description: 'Creates an item with a supplied name.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Item' }, example: { name: 'example' } },
            },
          },
          401: { description: 'Missing token' },
        },
        security: [{ bearer: [] }],
      },
    },
  },
  components: {
    securitySchemes: { bearer: { type: 'http', scheme: 'bearer' } },
    schemas: {
      Item: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string' }, next: { $ref: '#/components/schemas/Item' } },
      },
    },
  },
  servers: [{ url: 'http://localhost:3999' }],
});

test('validates contracts and renders bodies, errors, auth and recursive schema identity', async () => {
  const result = await validateOpenApi(spec());
  const markdown = renderOperation(result, 'createItem');
  for (const text of ['POST', '/items', 'Authentication', 'bearer', 'Request body', '401', '#/components/schemas/Item'])
    assert(markdown.includes(text));
  assert(markdown.length < 15000);
  assert.equal(stableJson(result), stableJson(spec()));
});
test('rejects incomplete operations, invalid examples and unbundled references', async () => {
  const broken = spec();
  delete broken.paths['/items'].post.description;
  await assert.rejects(validateOpenApi(broken), /Incomplete/);
  const remote = spec();
  remote.components.schemas.Item.properties.next.$ref = 'https://example.com/schema.json';
  await assert.rejects(validateOpenApi(remote), /bundled/);
  const unresolved = spec();
  unresolved.components.schemas.Item.properties.next.$ref = '#/components/schemas/Missing';
  await assert.rejects(validateOpenApi(unresolved));
  assert.throws(() => validateExample(spec(), { type: 'string' }, 1), /Invalid contract example/);
});
