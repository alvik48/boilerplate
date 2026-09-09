import { manifest } from '../../../lib/content';

export const GET = async (_request: Request, context: { params: Promise<{ service: string }> }) => {
  const service = (await context.params).service;
  const api = manifest.apis.find((item) => `${item.id}.json` === service);

  return api
    ? Response.json(api.spec, { headers: { 'X-Docs-Revision': manifest.revision } })
    : new Response('Unknown service', { status: 404 });
};
