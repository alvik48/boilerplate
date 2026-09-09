// Client-safe public entry: components, hooks and types only.
//
// Named re-exports, never `export *`. A catch-all barrel creates cycles, defeats
// tree-shaking, and hides what is actually public.
//
// Server-only code is NOT re-exported here -- it has its own entry, ./server.
// See docs/repository/frontend.md, "Feature Public Entries".

export { type Article, ARTICLE_TAGS, type ArticleTag, filterByTag, isArticleTag } from './model/article';
export { ArticleFilter } from './ui/article-filter';
export { ArticleList } from './ui/article-list';
