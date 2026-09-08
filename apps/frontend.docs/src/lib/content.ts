import 'server-only';
import data from '../../generated/manifest.json';
import { createDocumentationProvider, type Manifest } from '@packages/docs-core';
export const manifest = data as Manifest;
export const provider = createDocumentationProvider(manifest);
export function findDocument(slug: string[] = []) {
  const route = '/docs' + (slug.length ? '/' + slug.join('/') : '');
  return manifest.documents.find((doc) => doc.path === route);
}
