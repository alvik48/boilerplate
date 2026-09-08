import type { OpenAPIV3 } from '@packages/api-contracts';

export const fixtureSpec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: { title: 'Test fixture', version: '1.0.0' },
  servers: [{ url: 'http://localhost:3999', description: 'Local browser test fixture' }],
  components: { securitySchemes: { token: { type: 'http', scheme: 'bearer' } } },
  paths: {
    '/echo': {
      post: {
        operationId: 'echo',
        summary: 'Echo test body',
        description: 'Test-only in-memory request fixture.',
        security: [{ token: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: { message: { type: 'string', default: 'hello' } },
              },
              example: { message: 'hello' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Echoed body',
            content: {
              'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } },
            },
          },
          '401': { description: 'Missing test token' },
        },
      },
    },
  },
};
