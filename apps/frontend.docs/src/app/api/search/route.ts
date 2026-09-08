import { provider } from '../../../lib/content';
import { documentationTools } from '@packages/mcp';
import type { SearchInput } from '@packages/docs-core';
export function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const input = documentationTools
    .find((item) => item.name === 'search_docs')!
    .input.safeParse({ ...params, limit: params.limit ? Number(params.limit) : undefined });
  if (!input.success) return Response.json({ error: 'Invalid search parameters' }, { status: 400 });
  try {
    return Response.json(provider.search(input.data as unknown as SearchInput));
  } catch {
    return Response.json({ error: 'Invalid or stale cursor' }, { status: 400 });
  }
}
