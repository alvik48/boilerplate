import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/layouts/docs/page';
import defaultComponents from 'fumadocs-ui/mdx';
import { findDocument, manifest } from '../../../lib/content';
import { source } from '../../../lib/source';
import { APIPage } from '../../../components/api-page';
import { DocumentationSearch } from '../../../components/search';
import { bundleForRenderer } from '../../../lib/openapi';
import { operations } from '@packages/api-contracts';
export function generateStaticParams() {
  return manifest.documents.map((doc) => ({ slug: doc.path.slice('/docs'.length).split('/').filter(Boolean) }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const doc = findDocument((await params).slug);
  return { title: doc?.title, description: doc?.description, alternates: { canonical: doc?.url } };
}
export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const doc = findDocument(slug);
  const page = source.getPage(slug);
  if (!doc || !page) notFound();
  const Body = page.data.body;
  const api = doc.operationId ? manifest.apis.find((api) => api.id === doc.service) : undefined;
  const operation = api && operations(api.spec).find((item) => item.operation.operationId === doc.operationId);
  const payload = api ? await bundleForRenderer(api.spec) : undefined;
  return (
    <DocsPage toc={page.data.toc} full={!!api}>
      <DocumentationSearch />
      <DocsTitle id={doc.headings[0]?.id}>{doc.title}</DocsTitle>
      <DocsDescription>{doc.description}</DocsDescription>
      <p className="text-sm text-fd-muted-foreground">
        <a href={`${doc.path}.md`}>Read Markdown</a>
        {api && (
          <>
            {' '}
            · <a href={new URL(api.specUrl).pathname}>Download OpenAPI</a>
          </>
        )}
      </p>
      <DocsBody>
        {api && operation && payload ? (
          <APIPage payload={payload} operations={[{ path: operation.path, method: operation.method }]} />
        ) : (
          <Body
            components={{
              ...defaultComponents,
              a: ({ href = '', ...props }) => (
                <defaultComponents.a
                  {...props}
                  href={href.startsWith(manifest.origin + '/') ? href.slice(manifest.origin.length) : href}
                />
              ),
            }}
          />
        )}
      </DocsBody>
      {doc.related.length > 0 && (
        <aside>
          <h2 className="font-semibold">Related guides and contracts</h2>
          <ul>
            {doc.related.map((id) => {
              const target = manifest.documents.find((item) => item.id === id)!;
              return (
                <li key={id}>
                  <Link className="text-fd-primary underline" href={target.path}>
                    {target.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>
      )}
      <p className="text-xs text-fd-muted-foreground">Content revision: {doc.revision}</p>
    </DocsPage>
  );
}
