import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { operations, renderOperation, stableJson, validateOpenApi } from '@packages/api-contracts';
import { metadataSchema } from '@packages/docs-core';
import { buildManifest, discover, type ReferenceInput } from '@packages/docs-core/build';
import { descriptorCatalog, documentationTools } from '@packages/mcp';

import { externalContracts, services } from '../services.js';

import { validateInventory } from './inventory.js';

const navigationSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  root: z.boolean().optional(),
  pages: z.array(z.string()).optional(),
});

export const appRoot = fileURLToPath(new URL('../', import.meta.url));
export const root = path.resolve(appRoot, '../..');

export const generate = async () => {
  await validateInventory(root, services);
  const references: ReferenceInput[] = [];
  const published = [];

  for (const service of services) {
    const spec = await validateOpenApi(JSON.parse(await readFile(path.join(root, service.artifact), 'utf8')));

    if (spec.info.version !== service.version) {
      throw new Error(`Service version mismatch: ${service.id}`);
    }

    spec.servers = service.environments;
    const ids = new Set<string>();

    for (const { operation } of operations(spec)) {
      const id = operation.operationId!;

      ids.add(id);
      references.push({
        metadata: metadataSchema.parse({
          id: `api-${service.id}-${id.toLowerCase()}`,
          title: operation.summary,
          description: operation.description,
          type: 'reference',
          audience: ['integrator', 'agent'],
          service: service.id,
          tags: operation.tags,
        }),
        path: `/docs/api/${service.id}/${id}`,
        markdown: renderOperation(spec, id),
        contractId: `http:${service.id}:${id}`,
        guideIds: service.guides[id] ?? [],
        operationId: id,
      });
    }

    for (const id of Object.keys(service.guides)) {
      if (!ids.has(id)) {
        throw new Error(`Stale operation mapping: ${service.id}/${id}`);
      }
    }

    published.push({ ...service, spec });
  }

  const catalog = descriptorCatalog();

  for (const descriptor of documentationTools) {
    const contract = catalog.find((item) => item.name === descriptor.name)!;

    references.push({
      metadata: metadataSchema.parse({
        id: `mcp-${descriptor.name.replaceAll('_', '-')}`,
        title: descriptor.name,
        description: descriptor.description,
        type: 'reference',
        audience: ['integrator', 'agent'],
      }),
      path: `/docs/integration/mcp/tools/${descriptor.name}`,
      contractId: `mcp:${descriptor.name}`,
      guideIds: descriptor.guideIds,
      markdown: `# ${descriptor.name}\n\n${descriptor.description}\n\n## Contract\n\n\`\`\`json\n${stableJson(contract)}\`\`\`\n\n## Examples\n\n\`\`\`json\n${stableJson(descriptor.examples)}\`\`\`\n\n## Authorization\n\n${descriptor.requiredScopes.length ? descriptor.requiredScopes.join(', ') : 'Public documentation access. No credentials required.'}\n`,
    });
  }

  const manifest = await buildManifest({
    root,
    origin: process.env.DOCS_ORIGIN ?? 'http://localhost:3002',
    sourceUrl: process.env.DOCS_SOURCE_URL ?? 'https://github.com/alvik48/boilerplate/blob/main',
    revision: process.env.DOCS_REVISION,
    references,
    services: published,
    contracts: externalContracts,
  });

  return { manifest, catalog };
};

const writeChanged = async (file: string, content: string) => {
  if ((await readFile(file, 'utf8').catch(() => '')) === content) {
    return;
  }

  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file + '.tmp', content);
  await rename(file + '.tmp', file);
};

export const publish = async () => {
  const { manifest, catalog } = await generate();
  const output = path.join(appRoot, 'generated');
  const files = new Map<string, string>();

  for (const doc of manifest.documents) {
    const slug = doc.path.slice('/docs'.length);
    const file = slug ? slug.slice(1) + (doc.sourcePath.endsWith('/README.md') ? '/index.md' : '.md') : 'index.md';

    files.set(
      `content/${file}`,
      `---\n${Object.entries({ id: doc.id, title: doc.title, description: doc.description })
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n')}\n---\n\n${doc.markdown.replace(/^# .*\n+/, '')}`,
    );
  }

  files.set('catalog.json', stableJson(catalog));
  files.set('content/meta.json', stableJson({ pages: ['index', 'integration', 'api', 'repository', '...'] }));

  for (const section of ['integration', 'api', 'repository']) {
    files.set(
      `content/${section}/meta.json`,
      stableJson({
        title: section === 'api' ? 'API' : section[0].toUpperCase() + section.slice(1),
        root: true,
        pages: ['index', '...'],
      }),
    );
  }

  for (const api of manifest.apis) {
    const groups = new Map<string, string[]>();

    for (const { operation } of operations(api.spec)) {
      const tag = operation.tags?.[0] ?? 'Operations';

      groups.set(tag, [...(groups.get(tag) ?? []), operation.operationId!]);
    }

    files.set(
      `content/api/${api.id}/meta.json`,
      stableJson({ title: api.name, pages: [...groups].flatMap(([tag, ids]) => [`---${tag}---`, ...ids]) }),
    );
  }

  const assets = new Set<string>();

  for (const file of await discover(path.join(root, 'docs'))) {
    const relative = path.relative(path.join(root, 'docs'), file);

    if (file.endsWith('/meta.json')) {
      const metadata: unknown = JSON.parse(await readFile(file, 'utf8'));
      const parsed = navigationSchema.parse(metadata);

      files.set(
        `content/${relative}`,
        stableJson({ ...parsed, pages: [...(parsed.pages ?? []).filter((item) => item !== '...'), '...'] }),
      );
    } else if (!file.endsWith('.md')) {
      const destination = path.join(appRoot, 'public/assets', relative);

      await mkdir(path.dirname(destination), { recursive: true });
      await cp(file, destination);
      assets.add(destination);
    }
  }

  const assetRoot = path.join(appRoot, 'public/assets');

  await mkdir(assetRoot, { recursive: true });

  for (const file of await discover(assetRoot)) {
    if (!assets.has(file)) {
      await rm(file);
    }
  }

  for (const api of manifest.apis) {
    files.set(`openapi/${api.id}.json`, stableJson(api.spec));
  }

  files.set('manifest.json', stableJson(manifest));
  await mkdir(output, { recursive: true });

  for (const [file, content] of files) {
    await writeChanged(path.join(output, file), content);
  }

  for (const file of await discover(output)) {
    if (!files.has(path.relative(output, file))) {
      await rm(file);
    }
  }

  console.log(`Published ${manifest.documents.length} documents; revision ${manifest.revision}`);
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await publish();
}
