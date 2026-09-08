'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SearchScope } from '@packages/docs-core';
interface Result {
  id: string;
  title: string;
  url: string;
  excerpt: string;
}
export function DocumentationSearch() {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');
  const [results, setResults] = useState<Result[]>([]);
  const [status, setStatus] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    if (!query.trim()) return;
    const timer = setTimeout(() => {
      setStatus('Searching…');
      void fetch(`/api/search?${new URLSearchParams({ query, scope })}`, { signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error('Search failed');
          return (await response.json()) as { items: Result[] };
        })
        .then((body) => {
          setResults(body.items);
          setStatus(body.items.length ? '' : 'No matching documents. Try another phrase or scope.');
        })
        .catch(() => {
          if (!controller.signal.aborted) setStatus('Search is unavailable. Try again.');
        });
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, scope]);
  return (
    <section className="docs-search" aria-label="Documentation search">
      <div className="docs-search-controls">
        <label htmlFor="docs-query">Search documentation</label>
        <input
          id="docs-query"
          type="search"
          value={query}
          maxLength={200}
          placeholder="Find a guide, operation, or command"
          onChange={(event) => {
            setQuery(event.target.value);
            setResults([]);
            setStatus('');
          }}
        />
        <label htmlFor="docs-scope">Search scope</label>
        <select id="docs-scope" value={scope} onChange={(event) => setScope(event.target.value as SearchScope)}>
          <option value="all">All documentation</option>
          <option value="integration">Integration &amp; API</option>
          <option value="repository">Repository</option>
        </select>
      </div>
      {query.trim() && (
        <div className="docs-search-results" aria-live="polite">
          {status}
          <ul>
            {results.map((result, index) => (
              <li key={`${result.id}-${index}`}>
                <Link href={new URL(result.url).pathname + new URL(result.url).hash}>{result.title}</Link>
                <p>{result.excerpt}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
