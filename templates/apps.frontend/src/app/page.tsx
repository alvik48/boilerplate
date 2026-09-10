import { ArticleFilter, ArticleList, isArticleTag } from '../features/articles';
import { fetchArticles } from '../features/articles/server';
import { ThemeShowcase } from '../shared/theme-showcase';

// The page composes and lays out. It reads the filter from the URL, kicks off
// server data loading, and arranges the pieces -- no business branching, no
// transformation logic, no 'use client'.
//
// Note both feature entries in use: the client-safe one for UI and types, and
// ./server for the fetcher. See docs/repository/frontend.md.

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const raw = Array.isArray(params['tag']) ? params['tag'][0] : params['tag'];
  const tag = isArticleTag(raw) ? raw : undefined;

  const articles = await fetchArticles(tag);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <ArticleFilter selected={tag} />
        <ArticleList articles={articles} />
      </section>
      <ThemeShowcase />
    </main>
  );
}
