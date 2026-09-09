import 'server-only';

import { createOpenAPI } from 'fumadocs-openapi/server';
import type { OpenAPIPageProps_Spec } from 'fumadocs-openapi/ui';

import type { OpenAPIV3 } from '@packages/api-contracts';

export const bundleForRenderer = async (spec: OpenAPIV3.Document) => {
  // The pinned input type is narrower than its documented loader. It accepts 3.0
  // and upgrades only the presentation copy to 3.2; the published spec stays 3.0.
  const openapi = createOpenAPI({ input: { spec: spec as unknown as OpenAPIPageProps_Spec['payload']['bundled'] } });

  return await openapi.getSchema('spec');
};
