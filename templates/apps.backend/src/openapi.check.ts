import { readFile } from 'node:fs/promises';
import { createApiDocument } from '@packages/api-contracts/nest';
import { stableJson, validateOpenApi } from '@packages/api-contracts';
import { createApp } from './create-app';
import { apiConfiguration } from './api.config';

async function check() {
  const generated = await validateOpenApi(JSON.parse(await readFile('generated/openapi.json', 'utf8')));
  const app = await createApp('runtime');
  try {
    const runtime = await validateOpenApi(createApiDocument(app, apiConfiguration));
    if (stableJson(generated) !== stableJson(runtime)) throw new Error('Runtime/schema OpenAPI parity failed');
  } finally {
    await app.close();
  }
}

void check().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
