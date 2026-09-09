import { manifest } from '../../lib/content';

export const GET = () => {
  const order = { integration: 0, api: 1, overview: 2, repository: 3 };
  const docs = [...manifest.documents].sort(
    (a, b) => order[a.section] - order[b.section] || a.path.localeCompare(b.path),
  );

  return new Response(
    `# Project documentation\n\nRevision: ${manifest.revision}\n\nStart with [Integration](${manifest.origin}/docs/integration.md). Public MCP: ${manifest.origin}/mcp\n\n${docs.map((doc) => `- [${doc.title}](${doc.url}.md): ${doc.description}`).join('\n')}\n\n## OpenAPI specs\n\n${manifest.apis.map((api) => `- [${api.name}](${api.specUrl})`).join('\n')}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Docs-Revision': manifest.revision } },
  );
};
