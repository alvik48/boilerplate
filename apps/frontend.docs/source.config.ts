import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
// Derived from root docs/ and contracts, with the same links as agent exports.
export const docs = defineDocs({ dir: 'generated/content', docs: { postprocess: { includeProcessedMarkdown: true } } });
export default defineConfig();
