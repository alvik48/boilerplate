import { DocsLayout } from 'fumadocs-ui/layouts/docs';

import { source } from '../../lib/source';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      nav={{ title: 'Project docs', url: '/docs' }}
      searchToggle={{ enabled: false }}
    >
      {children}
    </DocsLayout>
  );
}
