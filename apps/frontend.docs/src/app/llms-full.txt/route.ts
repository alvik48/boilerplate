import { manifest } from '../../lib/content';

export const GET = () => {
  return new Response(
    `# Project documentation\n\nRevision: ${manifest.revision}\n\n${manifest.documents.map((doc) => `${doc.markdown}\nSource: ${doc.url}\n`).join('\n---\n\n')}`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Docs-Revision': manifest.revision } },
  );
};
