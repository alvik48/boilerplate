import { mkdir, writeFile } from 'node:fs/promises';

import { stableJson, validateOpenApi } from '@packages/api-contracts';
import { createApiDocument } from '@packages/api-contracts/nest';

import { apiConfiguration } from './api.config';
import { createApp } from './create-app';

const generate = async () => {
  const app = await createApp('schema');

  try {
    const document = await validateOpenApi(createApiDocument(app, apiConfiguration));

    await mkdir('generated', { recursive: true });
    await writeFile('generated/openapi.json', stableJson(document));
  } finally {
    await app.close();
  }
};

void generate().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
