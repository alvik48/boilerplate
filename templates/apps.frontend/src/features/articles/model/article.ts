// Feature model: types and pure logic. Safe on the client and on the server,
// so it can be re-exported from index.ts.

export type Article = {
  id: string;
  title: string;
  tag: ArticleTag;
  readingMinutes: number;
};

export const ARTICLE_TAGS = ['architecture', 'testing', 'performance'] as const;

export type ArticleTag = (typeof ARTICLE_TAGS)[number];

export const isArticleTag = (value: string | undefined): value is ArticleTag =>
  value !== undefined && ARTICLE_TAGS.includes(value as ArticleTag);

/**
 * Narrows a list to one tag.
 *
 * A plain function, not a hook: it holds no state and needs no React. Keeping
 * the rule separate from the component is what makes it testable on its own.
 */
export const filterByTag = (articles: readonly Article[], tag: ArticleTag | undefined): Article[] =>
  tag === undefined ? [...articles] : articles.filter((article) => article.tag === tag);
