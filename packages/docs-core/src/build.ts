import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import {
  stableJson,
  operations,
  validateExample,
  type ExternalContract,
  type OpenAPIV3,
  type ServiceRegistration,
} from '@packages/api-contracts';
import { metadataSchema, type Document, type Manifest, type Metadata, type Section } from './model.js';
import { inspectMarkdown, normalizeMarkdown } from './markdown.js';

export { inspectMarkdown } from './markdown.js';
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export interface ReferenceInput {
  metadata: Metadata;
  path: string;
  markdown: string;
  contractId: string;
  guideIds: string[];
  operationId?: string;
}
export interface BuildOptions {
  root: string;
  origin: string;
  sourceUrl: string;
  revision?: string;
  references: ReferenceInput[];
  services: (ServiceRegistration & { spec: OpenAPIV3.Document })[];
  contracts?: ExternalContract[];
}

export async function discover(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      if (entry.isSymbolicLink()) throw new Error(`Symlink in public documentation: ${entry.name}`);
      const full = path.join(directory, entry.name);
      return entry.isDirectory() ? discover(full) : [full];
    }),
  );
  return files.flat().sort();
}

export function documentPath(source: string) {
  return (
    '/docs' +
    source
      .replace(/^docs/, '')
      .replace(/\/README\.md$/, '')
      .replace(/\.md$/, '')
  );
}

export async function buildManifest(options: BuildOptions): Promise<Manifest> {
  const { root } = options;
  const origin = new URL(options.origin).origin;
  const sourceUrl = new URL(options.sourceUrl);
  if (sourceUrl.protocol !== 'https:') throw new Error('Repository source URL must use HTTPS');
  const docs: Document[] = [];
  const sourceHashes: Record<string, string> = {};
  const create = (
    metadata: Metadata,
    route: string,
    sourcePath: string,
    markdown: string,
    generated = false,
  ): Document => ({
    ...metadata,
    path: route,
    url: origin + route,
    sourcePath,
    section: (route.split('/')[2] ?? 'overview') as Section,
    markdown,
    headings: inspectMarkdown(markdown).headings,
    hash: '',
    revision: '',
    contractIds: [],
    generated,
  });
  for (const file of await discover(path.join(root, 'docs'))) {
    sourceHashes[path.relative(root, file)] = hash((await readFile(file)).toString('base64'));
    if (!file.endsWith('.md')) continue;
    const source = path.relative(root, file).split(path.sep).join('/');
    const parsed = matter(await readFile(file, 'utf8'));
    const metadata = metadataSchema.parse(parsed.data);
    const route = documentPath(source);
    if (/^\/docs\/api\/[^/]+\/|^\/docs\/integration\/mcp\/tools(?:\/|$)/.test(route))
      throw new Error(`Reserved reference namespace: ${source}`);
    let markdown = parsed.content.trim() + '\n';
    if (route === '/docs/api') {
      for (const service of options.services) {
        const entries = options.references.filter((ref) => ref.metadata.service === service.id && ref.operationId);
        markdown += `\n## ${service.id}\n\n${service.name} — version ${service.version}. ${service.description}\n\n[Download OpenAPI JSON](/openapi/${service.id}.json)\n\n`;
        markdown += entries.map((ref) => `- [${ref.metadata.title}](${ref.path})`).join('\n') + '\n';
      }
    }
    const doc = create(metadata, route, source, markdown);
    if (!['integration', 'api', 'repository'].includes(doc.section)) doc.section = 'overview';
    docs.push(doc);
  }
  for (const ref of options.references) {
    const doc = create(ref.metadata, ref.path, 'generated/' + ref.metadata.id + '.md', ref.markdown, true);
    doc.contractIds = [ref.contractId];
    doc.related = [...new Set([...doc.related, ...ref.guideIds])];
    doc.operationId = ref.operationId;
    docs.push(doc);
  }
  docs.sort((a, b) => a.path.localeCompare(b.path, 'en'));
  for (const field of ['id', 'path', 'sourcePath'] as const) {
    const seen = new Set<string>();
    for (const doc of docs) {
      const key = doc[field].toLowerCase();
      if (seen.has(key)) throw new Error(`Duplicate document ${field}: ${doc[field]}`);
      seen.add(key);
    }
  }
  const byId = new Map(docs.map((doc) => [doc.id, doc]));
  const associations = [
    ...options.references.map((ref) => ({ id: ref.contractId, guideIds: ref.guideIds, referenceId: ref.metadata.id })),
    ...(options.contracts ?? []).map((contract) => ({ ...contract, referenceId: undefined })),
  ];
  const contractIds = new Set<string>();
  for (const association of associations) {
    if (contractIds.has(association.id)) throw new Error(`Duplicate contract ID: ${association.id}`);
    contractIds.add(association.id);
    if (!association.guideIds.length) throw new Error(`No integration coverage: ${association.id}`);
    for (const id of association.guideIds) {
      const guide = byId.get(id);
      if (!guide || guide.section !== 'integration' || guide.generated)
        throw new Error(`Missing authored integration guide: ${id}`);
      guide.contractIds.push(association.id);
      if (association.referenceId) guide.related.push(association.referenceId);
    }
  }
  for (const contract of options.contracts ?? []) {
    if (!contract.owner || !contract.version || !contract.id) throw new Error('Incomplete external contract');
    if (contract.schema) {
      if (
        !/^(?:docs\/|(?:apps|packages|templates)\/[^/]+\/schemas\/)/.test(contract.schema) ||
        contract.schema.split('/').includes('..')
      )
        throw new Error('External schemas must be under docs/ or a workspace schemas/ directory');
      sourceHashes[contract.schema] = hash((await readFile(path.join(root, contract.schema))).toString('base64'));
    }
  }
  const bySource = new Map(docs.map((doc) => [doc.sourcePath, doc]));
  const byRoute = new Map(docs.map((doc) => [doc.path, doc]));
  for (const doc of docs) {
    for (const example of doc.examples) {
      if (!doc.contractIds.includes(example.contractId))
        throw new Error(`Example has no contract association: ${doc.id}`);
      const [, serviceId, operationId] = example.contractId.split(':');
      const service = options.services.find((item) => item.id === serviceId);
      const operation = service && operations(service.spec).find((item) => item.operation.operationId === operationId);
      const response = operation?.operation.responses[example.responseStatus];
      const schema = response && !('$ref' in response) && response.content?.[example.mediaType]?.schema;
      const block = [...doc.markdown.matchAll(/```json\s*\n([\s\S]*?)```/g)][example.jsonBlock]?.[1];
      if (!service || !schema || !block) throw new Error(`Invalid example mapping in ${doc.id}`);
      validateExample(service.spec, schema, JSON.parse(block));
    }
    doc.related = [...new Set(doc.related)].sort();
    for (const id of doc.related) if (!byId.has(id)) throw new Error(`Unknown related document ${id} in ${doc.id}`);
    const links = new Map<string, string>();
    const urls: string[] = [];
    normalizeMarkdown(doc.markdown, (url) => {
      urls.push(url);
      return url;
    });
    for (const url of urls) {
      if (/^(https?:|mailto:)/.test(url)) continue;
      if (/^[a-z]+:/i.test(url) || url.startsWith('//')) throw new Error(`Unsupported link: ${url}`);
      const [rawPath, anchor] = url.split('#');
      const targetPath = decodeURIComponent(rawPath);
      const source = targetPath
        ? path.posix.normalize(path.posix.join(path.posix.dirname(doc.sourcePath), targetPath))
        : doc.sourcePath;
      const target = rawPath.startsWith('/docs') ? byRoute.get(rawPath) : bySource.get(source);
      if (target) {
        if (anchor && !target.headings.some((h) => h.id === decodeURIComponent(anchor)))
          throw new Error(`Broken anchor ${url} in ${doc.sourcePath}`);
        links.set(url, target.url + (anchor ? '#' + anchor : ''));
      } else {
        if (rawPath.startsWith('/')) {
          if (
            /^\/openapi\/[^/]+\.json$/.test(rawPath) &&
            options.services.some((s) => rawPath === `/openapi/${s.id}.json`)
          )
            links.set(url, origin + url);
          else throw new Error(`Unknown public route: ${url} in ${doc.id}`);
          continue;
        }
        if (source.startsWith('../') || source.startsWith('.agents/') || source.startsWith('.git/'))
          throw new Error(`Excluded source link: ${url}`);
        const targetFile = path.join(root, source);
        const info = await stat(targetFile).catch(() => {
          throw new Error(`Missing link ${url} in ${doc.sourcePath}`);
        });
        if (anchor && source.endsWith('.md') && info.isFile()) {
          const contents = matter(await readFile(targetFile, 'utf8')).content;
          if (!inspectMarkdown(contents).headings.some((h) => h.id === decodeURIComponent(anchor)))
            throw new Error(`Broken source anchor: ${url}`);
        }
        if (source.startsWith('docs/') && !source.endsWith('.md'))
          links.set(url, origin + '/assets/' + source.slice(5));
        else
          links.set(
            url,
            options.sourceUrl.replace(/\/$/, '') +
              '/' +
              source.split('/').map(encodeURIComponent).join('/') +
              (anchor ? '#' + anchor : ''),
          );
      }
    }
    doc.markdown = normalizeMarkdown(doc.markdown, (url) => links.get(url) ?? url);
    doc.hash = hash(doc.markdown);
  }
  const apis = options.services.map((service) => ({
    ...service,
    specUrl: `${origin}/openapi/${service.id}.json`,
    referenceUrl: `${origin}/docs/api#${service.id}`,
    guideIds: [...new Set(Object.values(service.guides).flat())],
  }));
  const revision =
    (options.revision ? options.revision + '-' : '') +
    hash(
      stableJson({ docs, apis, contracts: options.contracts ?? [], sourceHashes, sourceUrl: options.sourceUrl }),
    ).slice(0, 16);
  for (const doc of docs) doc.revision = revision;
  return { revision, origin, documents: docs, apis, contracts: options.contracts ?? [] };
}
