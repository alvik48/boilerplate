import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, rm, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildManifest } from '../dist/build.js';
import { createDocumentationProvider } from '../dist/index.js';

const md = (id, body, audience = '[integrator, agent]') =>
  `---\nid: ${id}\ntitle: ${id}\ndescription: Helpful ${id} guide\ntype: guide\naudience: ${audience}\n---\n\n${body}\n`;
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'docs-core-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'docs/integration'), { recursive: true });
  await mkdir(path.join(root, 'docs/repository'));
  await writeFile(path.join(root, 'README.md'), '# Repository\n');
  await writeFile(
    path.join(root, 'docs/README.md'),
    md('documentation-index', '# Docs\n\n[Integration](integration/README.md#start)'),
  );
  await writeFile(
    path.join(root, 'docs/integration/README.md'),
    md('integration-index', '# Integration\n\n## Start\n\nHealth HTTP guide.'),
  );
  await writeFile(
    path.join(root, 'docs/repository/README.md'),
    md('repository-guide', '# Contributor\n\nHealth implementation rules.', '[developer, agent]'),
  );
  return {
    root,
    origin: 'https://docs.example.com',
    sourceUrl: 'https://github.com/example/repo/blob/main',
    references: [],
    services: [],
  };
}
test('normalizes links, scopes search and keeps IDs across add/rename/delete', async (t) => {
  const options = await fixture(t);
  const first = await buildManifest(options);
  assert(
    first.documents
      .find((d) => d.id === 'documentation-index')
      .markdown.includes('https://docs.example.com/docs/integration#start'),
  );
  let provider = createDocumentationProvider(first);
  assert(provider.search({ query: 'health' }).items.every((d) => d.section !== 'repository'));
  assert(provider.search({ query: 'health', scope: 'repository' }).items.some((d) => d.id === 'repository-guide'));
  const file = path.join(options.root, 'docs/integration/new.md');
  await writeFile(file, md('stable-id', '# Added\n\nFresh guide.'));
  const added = await buildManifest(options);
  assert.notEqual(first.revision, added.revision);
  await rename(file, file.replace('new.md', 'moved.md'));
  const moved = await buildManifest(options);
  assert.equal(moved.documents.find((d) => d.id === 'stable-id').path, '/docs/integration/moved');
  await rm(file.replace('new.md', 'moved.md'));
  provider = createDocumentationProvider(await buildManifest(options));
  assert.throws(() => provider.getDoc('stable-id'), /Unknown/);
  assert.throws(() => provider.getDoc('../../README.md'), /Unknown/);
  assert.throws(() => provider.search({ query: 'health', cursor: 'wrong:20' }), /stale/);
});
test('fails broken anchors, duplicate IDs and missing integration contract coverage', async (t) => {
  const options = await fixture(t);
  const file = path.join(options.root, 'docs/integration/new.md');
  await writeFile(file, md('bad-link', '# Bad\n\n[Missing](README.md#absent)'));
  await assert.rejects(buildManifest(options), /Broken anchor/);
  await writeFile(file, md('integration-index', '# Duplicate'));
  await assert.rejects(buildManifest(options), /Duplicate/);
  await rm(file);
  options.contracts = [{ id: 'event:created', kind: 'event', owner: 'test', version: '1', guideIds: [] }];
  await assert.rejects(buildManifest(options), /coverage/);
  options.contracts[0].guideIds = ['repository-guide'];
  await assert.rejects(buildManifest(options), /integration guide/);
  options.contracts[0].guideIds = ['integration-index'];
  const good = await buildManifest(options);
  assert(good.documents.find((d) => d.id === 'integration-index').contractIds.includes('event:created'));
  options.contracts[0].schema = 'packages/events/schemas/event.json';
  const schema = path.join(options.root, options.contracts[0].schema);
  await mkdir(path.dirname(schema), { recursive: true });
  await writeFile(schema, '{"type":"string"}');
  const before = await buildManifest(options);
  await writeFile(schema, '{"type":"number"}');
  assert.notEqual(before.revision, (await buildManifest(options)).revision);
});

test('heading reads and search anchors ignore headings inside code fences', async (t) => {
  const options = await fixture(t);
  await writeFile(
    path.join(options.root, 'docs/integration/code.md'),
    md('code-guide', '# Code\n\n```sh\n# Shell comment\necho hi\n```\n\n## Real section\n\nDistinctive phrase.'),
  );
  const provider = createDocumentationProvider(await buildManifest(options));
  assert.equal(provider.getDoc('code-guide', 'real-section').markdown.trim(), '## Real section\n\nDistinctive phrase.');
  assert(provider.search({ query: 'distinctive' }).items[0].url.endsWith('#real-section'));
});
