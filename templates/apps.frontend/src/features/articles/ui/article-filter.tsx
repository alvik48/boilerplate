'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@packages/ui/components/button';

import { ARTICLE_TAGS, type ArticleTag } from '../model/article';

// 'use client' lives HERE, on the smallest interactive piece, rather than on the
// page. Pushing it up a file to satisfy one interactive child is a decomposition
// signal: extract the interactive part instead.
// See docs/repository/frontend.md, "Application Structure".

type ArticleFilterProps = {
  selected: ArticleTag | undefined;
};

export const ArticleFilter = ({ selected }: ArticleFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The URL owns the filter. There is no useState mirroring `selected`, and no
  // useEffect syncing the two -- `selected` is read from searchParams by the
  // server component and passed down. Reloading, sharing or bookmarking the page
  // reproduces the same view.
  // See docs/repository/frontend.md, "State Ownership".
  const select = (tag: ArticleTag | undefined) => {
    const next = new URLSearchParams(searchParams);

    if (tag === undefined) {
      next.delete('tag');
    } else {
      next.set('tag', tag);
    }

    const query = next.toString();

    router.push(query === '' ? pathname : `${pathname}?${query}`);
  };

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter articles by tag">
      <Button variant={selected === undefined ? 'default' : 'outline'} onClick={() => select(undefined)}>
        All
      </Button>
      {ARTICLE_TAGS.map((tag) => (
        <Button key={tag} variant={selected === tag ? 'default' : 'outline'} onClick={() => select(tag)}>
          {tag}
        </Button>
      ))}
    </div>
  );
};
