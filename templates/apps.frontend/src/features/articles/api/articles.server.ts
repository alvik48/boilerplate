import 'server-only';

import { type Article, type ArticleTag, filterByTag } from '../model/article';

// `import 'server-only'` turns a boundary violation into a BUILD ERROR rather
// than a silent leak: if a Client Component ever imports this module, the build
// fails instead of shipping the fetcher (and whatever credentials it would carry
// in a real app) to the browser.
//
// This is why the feature has two public entries. A single index.ts re-exporting
// both this module and the UI would pull server-only code into the client graph
// the moment anything imported it.

const ARTICLES: readonly Article[] = [
  { id: 'a_1', title: 'Layering a NestJS feature', tag: 'architecture', readingMinutes: 7 },
  { id: 'a_2', title: 'Where filter state belongs', tag: 'architecture', readingMinutes: 4 },
  { id: 'a_3', title: 'Writing the regression test first', tag: 'testing', readingMinutes: 5 },
  { id: 'a_4', title: 'Measuring before optimizing', tag: 'performance', readingMinutes: 6 },
  { id: 'a_5', title: 'Finding the N+1', tag: 'performance', readingMinutes: 8 },
];

/**
 * Loads articles, optionally narrowed to one tag.
 *
 * Replace the constant with a real fetch or database call. Keep the signature:
 * the page passes the tag it read from the URL, so filtering happens where the
 * data is, not after everything has been shipped to the browser.
 */
export const fetchArticles = (tag: ArticleTag | undefined): Promise<Article[]> =>
  Promise.resolve(filterByTag(ARTICLES, tag));
