import { notFound } from 'next/navigation';

import { fixtureSpec } from '../../../../../tests/fixtures/openapi';
import { APIPage } from '../../../../components/api-page';
import { bundleForRenderer } from '../../../../lib/openapi';
export const dynamic = 'force-dynamic';

export default async function Fixture() {
  if (process.env.NODE_ENV !== 'development' || process.env.DOCS_TEST_FIXTURES !== '1') {
    notFound();
  }

  return (
    <main className="p-8">
      <h1>Test-only playground</h1>
      <APIPage payload={await bundleForRenderer(fixtureSpec)} operations={[{ path: '/echo', method: 'post' }]} />
    </main>
  );
}
