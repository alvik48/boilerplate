import { createApiDocument, publishApiDocument } from '@packages/api-contracts/nest';

import { apiConfiguration } from './api.config';
import { createApp } from './create-app';

const bootstrap = async () => {
  const app = await createApp();

  publishApiDocument(app, createApiDocument(app, apiConfiguration));
  app.enableShutdownHooks();
  const port = Number(process.env['API_PORT'] ?? 3000);

  await app.listen(port, process.env['API_HOST'] ?? '0.0.0.0');
};

void bootstrap();
