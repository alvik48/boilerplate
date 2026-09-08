import type { ExternalContract, ServiceRegistration } from '@packages/api-contracts';

export const services: ServiceRegistration[] = [
  {
    id: 'backend-template',
    package: '@apps/backend-template',
    artifact: 'templates/apps.backend/generated/openapi.json',
    name: 'Backend template (example)',
    description: 'Local health example; no deployed product or business API.',
    version: '0.0.1',
    environments: [
      { url: process.env.DOCS_API_BACKEND_TEMPLATE_URL ?? 'http://localhost:3000', description: 'Local example' },
    ],
    guides: { getHealth: ['integration-health'] },
  },
];
export const externalContracts: ExternalContract[] = [];
