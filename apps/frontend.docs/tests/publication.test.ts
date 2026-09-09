import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { createDocumentationProvider } from '@packages/docs-core';

import { generate } from '../scripts/generate.js';
import { validateInventory } from '../scripts/inventory.js';
import { services } from '../services.js';

void test('external discovery leads from authored health guide to the matching operation in one revision', async () => {
  const { manifest } = await generate();
  const provider = createDocumentationProvider(manifest);
  const result = provider.search({ query: 'health' });

  assert.equal(result.scope, 'integration');
  assert(result.items.some((item) => item.id === 'integration-health'));
  assert(result.items.every((item) => item.section !== 'repository'));
  const guide = provider.getDoc('integration-health');
  const operation = provider.getApiOperation('backend-template', 'getHealth');

  assert.equal(operation.revision, guide.revision);
  assert(operation.guideIds.includes(guide.id));
  assert.equal(operation.contract.path, '/health');
  assert(operation.markdown.includes('HealthResponseDto'));
  assert(provider.listApis().items[0].guideIds.includes(guide.id));
  const directory = provider.getDoc('api-index');

  for (const api of provider.listApis().items) {
    assert(directory.markdown.includes(api.specUrl));
    assert(directory.markdown.includes(`## ${api.id}`));
    assert(api.referenceUrl.endsWith(`#${api.id}`));
  }

  assert(provider.search({ query: 'Turborepo', scope: 'repository' }).items.length > 0);
});

void test('new HTTP backends cannot disappear from registry or task graph', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'docs-inventory-'));

  t.after(() => rm(root, { recursive: true, force: true }));

  for (const dir of ['apps/backend.example', 'packages', 'templates']) {
    await mkdir(path.join(root, dir), { recursive: true });
  }

  const registry = [
    {
      ...services[0],
      id: 'example',
      package: '@apps/backend.example',
      artifact: 'apps/backend.example/generated/openapi.json',
    },
  ];
  const pkg = {
    name: registry[0].package,
    scripts: { 'openapi:generate': 'node generate.js', 'openapi:check': 'node check.js' },
    apiContract: { kind: 'http', serviceId: 'example', artifact: 'generated/openapi.json' },
  };
  const save = (file: string, value: unknown) => writeFile(path.join(root, file), JSON.stringify(value));

  await save('apps/backend.example/package.json', pkg);
  await save('turbo.json', { tasks: { '@apps/frontend.docs#docs:generate': { dependsOn: [] } } });
  await assert.rejects(validateInventory(root, registry), /task edge/);
  await save('turbo.json', {
    tasks: { '@apps/frontend.docs#docs:generate': { dependsOn: ['@apps/backend.example#openapi:check'] } },
  });
  await validateInventory(root, registry);
  await assert.rejects(validateInventory(root, []), /Unregistered/);
  await save('apps/backend.example/package.json', { name: pkg.name });
  await assert.rejects(validateInventory(root, registry), /declare apiContract/);
  await save('apps/backend.example/package.json', {
    name: pkg.name,
    apiContract: { kind: 'worker', reason: 'Queue processor with no HTTP listener' },
  });
  await save('turbo.json', { tasks: { '@apps/frontend.docs#docs:generate': { dependsOn: [] } } });
  await validateInventory(root, []);
});
