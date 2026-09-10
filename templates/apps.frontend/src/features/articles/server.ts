// Server-only public entry: fetchers, data access, anything importing
// `server-only`. Importing this from a Client Component is a build error.
//
// See docs/repository/frontend.md, "Feature Public Entries".

export { fetchArticles } from './api/articles.server';
