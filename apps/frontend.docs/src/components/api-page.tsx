'use client';
import { createOpenAPIPage } from 'fumadocs-openapi/ui';

export const APIPage = createOpenAPIPage({
  playground: {
    enabled: true,
    persistAuthorization: false,
    fetchOptions: { onRequestInit: (init) => ({ ...init, credentials: 'omit' }) },
  },
});
