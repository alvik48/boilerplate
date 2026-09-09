import { operations } from '@packages/api-contracts';

import { markdownSections } from './markdown.js';
import type { Document, Manifest, SearchInput } from './model.js';

export const pageOffset = (cursor: string | undefined, revision: string) => {
  if (!cursor) {
    return 0;
  }

  const [rev, offset] = cursor.split(':');

  if (rev !== revision || !/^\d{1,8}$/.test(offset ?? '')) {
    throw new Error('Invalid or stale cursor; restart discovery');
  }

  return Number(offset);
};

export const paginate = <T>(items: T[], revision: string, cursor?: string, limit = 20) => {
  const offset = pageOffset(cursor, revision);

  return {
    items: items.slice(offset, offset + limit),
    nextCursor: offset + limit < items.length ? `${revision}:${offset + limit}` : undefined,
  };
};

export const createDocumentationProvider = (manifest: Manifest) => {
  const byId = new Map(manifest.documents.map((doc) => [doc.id, doc]));
  const sections = new Map(manifest.documents.map((doc) => [doc.id, markdownSections(doc.markdown)]));
  const related = (doc: Document) =>
    doc.related.map((id) => {
      const target = byId.get(id)!;

      return { id, title: target.title, url: target.url };
    });

  return {
    manifest,
    search(input: SearchInput) {
      const scope = input.scope ?? 'integration';
      const words = input.query.toLocaleLowerCase().match(/[\p{L}\p{N}_-]+/gu) ?? [];
      const seen = new Set<string>();
      const results = manifest.documents
        .filter(
          (doc) =>
            (scope === 'all' ||
              (scope === 'repository'
                ? doc.section === 'repository'
                : doc.section === 'integration' || doc.section === 'api')) &&
            (!input.service || doc.service === input.service) &&
            (!input.type || doc.type === input.type),
        )
        .flatMap((doc) =>
          (doc.operationId ? [doc.markdown] : sections.get(doc.id)!).map((chunk, index) => {
            const lower = `${doc.title} ${doc.description} ${chunk}`.toLocaleLowerCase();
            const matched = words.reduce((sum, word) => sum + (lower.includes(word) ? 1 : 0), 0);
            const score =
              matched +
              words.reduce(
                (sum, word) =>
                  sum +
                  (doc.title.toLocaleLowerCase().includes(word) ? 4 : 0) +
                  (chunk.toLocaleLowerCase().includes(word) ? 2 : 0),
                0,
              ) +
              (doc.generated ? 0 : 1);
            const heading = doc.headings[index];

            return {
              id: doc.id,
              title: doc.title,
              section: doc.section,
              url: `${doc.url}${heading ? '#' + heading.id : ''}`,
              excerpt: chunk
                .replace(/^#+ .*\n/, '')
                .trim()
                .slice(0, 360),
              score,
              matched,
              revision: manifest.revision,
            };
          }),
        )
        .filter((result) => words.length > 0 && result.matched === words.length)
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id, 'en'))
        .filter((result) => {
          if (seen.has(result.id)) {
            return false;
          }

          seen.add(result.id);

          return true;
        });

      return {
        scope,
        revision: manifest.revision,
        ...paginate(results, manifest.revision, input.cursor, Math.max(1, Math.min(input.limit ?? 10, 20))),
      };
    },
    getDoc(id: string, heading?: string, cursor?: string) {
      const doc = byId.get(id);

      if (!doc) {
        throw new Error(`Unknown document: ${id}`);
      }

      let markdown = doc.markdown;

      if (heading) {
        const index = doc.headings.findIndex((item) => item.id === heading);

        if (index < 0) {
          throw new Error(`Unknown heading: ${heading}`);
        }

        const chunks = sections.get(doc.id)!;
        let end = index + 1;

        while (end < doc.headings.length && doc.headings[end].depth > doc.headings[index].depth) {
          end++;
        }

        markdown = chunks.slice(index, end).join('\n');
      }

      const offset = pageOffset(cursor, manifest.revision);
      const max = 12000;

      return {
        id: doc.id,
        title: doc.title,
        url: doc.url,
        sourcePath: doc.sourcePath,
        hash: doc.hash,
        revision: manifest.revision,
        related: related(doc),
        contractIds: doc.contractIds,
        markdown: markdown.slice(offset, offset + max),
        nextCursor: offset + max < markdown.length ? `${manifest.revision}:${offset + max}` : undefined,
      };
    },
    listApis(cursor?: string) {
      const apis = manifest.apis.map(
        ({ id, name, version, description, specUrl, referenceUrl, guideIds, environments }) => ({
          id,
          name,
          version,
          description,
          specUrl,
          referenceUrl,
          guideIds,
          environments,
        }),
      );

      return { revision: manifest.revision, ...paginate(apis, manifest.revision, cursor) };
    },
    getApiOperation(service: string, operationId: string) {
      const api = manifest.apis.find((item) => item.id === service);
      const doc = manifest.documents.find((item) => item.service === service && item.operationId === operationId);

      if (!api || !doc) {
        throw new Error('Unknown API operation');
      }

      const entry = operations(api.spec).find((item) => item.operation.operationId === operationId)!;

      return {
        ...this.getDoc(doc.id),
        serviceId: service,
        operationId,
        contract: entry,
        specUrl: api.specUrl,
        guideIds: api.guides[operationId],
      };
    },
  };
};

export type DocumentationProvider = ReturnType<typeof createDocumentationProvider>;
