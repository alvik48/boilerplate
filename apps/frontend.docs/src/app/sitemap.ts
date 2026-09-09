import type { MetadataRoute } from 'next';

import { manifest } from '../lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  return manifest.documents.map((doc) => ({ url: doc.url }));
}
