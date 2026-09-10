import { Badge } from '@packages/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@packages/ui/components/card';

import type { Article } from '../model/article';

// No 'use client': this renders on the server. It takes data as props and makes
// no decisions of its own.

type ArticleListProps = {
  articles: readonly Article[];
};

export const ArticleList = ({ articles }: ArticleListProps) => {
  if (articles.length === 0) {
    return <p className="text-muted-foreground text-sm">No articles match this filter.</p>;
  }

  return (
    <ul className="grid gap-3">
      {articles.map((article) => (
        <li key={article.id}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{article.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Badge variant="secondary">{article.tag}</Badge>
              <span className="text-muted-foreground text-sm">{article.readingMinutes} min read</span>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
};
