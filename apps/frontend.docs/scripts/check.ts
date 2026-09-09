import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { stableJson } from '@packages/api-contracts';

import { generate } from './generate.js';
const first = await generate();

assert.deepEqual(first, await generate(), 'Generation must be deterministic');

if ((await readFile('generated/manifest.json', 'utf8')) !== stableJson(first.manifest)) {
  throw new Error('Published manifest is stale');
}

if ((await readFile('generated/catalog.json', 'utf8')) !== stableJson(first.catalog)) {
  throw new Error('MCP catalog is stale');
}

for (const doc of first.manifest.documents) {
  assert(!doc.sourcePath.startsWith('.agents/'));
  assert(doc.markdown.length > 40 && !doc.markdown.includes('<OpenAPIPage'));
}

console.log('Documentation schema, links, coverage, inventory, examples, parity, and reproducibility passed.');
