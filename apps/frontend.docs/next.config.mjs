import { createMDX } from 'fumadocs-mdx/next';
import path from 'node:path';
const withMDX = createMDX();
export default withMDX({
  output: 'standalone',
  outputFileTracingRoot: path.resolve(import.meta.dirname, '../..'),
  transpilePackages: ['@packages/ui'],
  async rewrites() {
    return [
      { source: '/docs.md', destination: '/markdown' },
      { source: '/docs/:slug*.md', destination: '/markdown/:slug*' },
    ];
  },
});
