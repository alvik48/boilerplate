import { findDocument } from '../../../lib/content';
export async function GET(_request: Request, context: { params: Promise<{ slug?: string[] }> }) {
  const doc = findDocument((await context.params).slug);
  if (!doc) return new Response('Document not found', { status: 404 });
  return new Response(doc.markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'X-Docs-Revision': doc.revision },
  });
}
