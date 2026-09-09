import 'server-only';

import { createDocumentationProvider, type Manifest } from '@packages/docs-core';

import data from '../../generated/manifest.json';
export const manifest = data as Manifest;
export const provider = createDocumentationProvider(manifest);

export const findDocument = (slug: string[] = []) => {
  const route = '/docs' + (slug.length ? '/' + slug.join('/') : '');

  return manifest.documents.find((doc) => doc.path === route);
};
