import type { ApiConfiguration } from '@packages/api-contracts/nest';

export const apiConfiguration: ApiConfiguration = {
  serviceId: 'backend-template',
  title: 'Backend template (example)',
  description: 'Local template health example. This is not a deployed product API.',
  version: '0.0.1',
  servers: [{ url: 'http://localhost:3000', description: 'Local example' }],
};
