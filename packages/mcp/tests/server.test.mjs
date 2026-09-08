import assert from 'node:assert/strict';
import { test } from 'node:test';
import { z } from 'zod';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createDocumentationProvider } from '@packages/docs-core';
import { createMcpHandler, descriptorCatalog } from '../dist/index.js';

function provider() {
  const documents = Array.from({ length: 25 }, (_, i) => ({
    id: i === 0 ? 'integration-index' : `doc-${i}`,
    title: `Guide ${i}`,
    description: 'A public guide',
    sourcePath: `docs/${i}.md`,
    section: i === 24 ? 'repository' : 'integration',
    type: 'guide',
    audience: ['agent'],
    markdown: '# Guide\n\nHealth information.\n' + (i === 1 ? 'x'.repeat(25000) : ''),
    headings: [{ id: 'guide', title: 'Guide', depth: 1 }],
    related: [],
    contractIds: [],
    url: `http://localhost:3002/docs/${i}`,
    revision: 'test',
    hash: 'hash',
  }));
  return createDocumentationProvider({
    revision: 'test',
    origin: 'http://localhost:3002',
    documents,
    apis: [],
    contracts: [],
  });
}
const request = (method, params = {}, version = '2025-11-25') =>
  new Request('http://localhost:3002/mcp', {
    method: 'POST',
    headers: {
      Host: 'localhost:3002',
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': version,
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
test('official client initializes, discovers paginated resources, searches scopes and reads bounded Markdown', async () => {
  const handler = createMcpHandler({ provider: provider() }, 'http://localhost:3002');
  const client = new Client({ name: 'contract-test', version: '1' });
  await client.connect(
    new StreamableHTTPClientTransport(new URL('http://localhost:3002/mcp'), {
      fetch: async (url, init) => {
        const headers = new Headers(init?.headers);
        headers.set('Host', 'localhost:3002');
        return handler(new Request(url, { ...init, headers }));
      },
    }),
  );
  try {
    assert.deepEqual((await client.listTools()).tools, descriptorCatalog());
    const first = await client.listResources();
    assert.equal(first.resources.length, 20);
    assert.equal(first.resources[0].name, 'integration-index');
    assert.equal((await client.listResources({ cursor: first.nextCursor })).resources.length, 5);
    const search = await client.callTool({ name: 'search_docs', arguments: { query: 'health' } });
    assert.equal(search.structuredContent.scope, 'integration');
    assert(search.structuredContent.items.every((item) => item.section === 'integration'));
    const repo = await client.callTool({ name: 'search_docs', arguments: { query: 'health', scope: 'repository' } });
    assert.equal(repo.structuredContent.items[0].id, 'doc-24');
    const doc = await client.callTool({ name: 'get_doc', arguments: { id: 'doc-1' } });
    assert.equal(doc.structuredContent.markdown.length, 12000);
    assert(doc.structuredContent.nextCursor);
    assert(
      (await client.readResource({ uri: 'docs://project/integration-index' })).contents[0].text.includes(
        'Revision: test',
      ),
    );
    assert.equal((await client.callTool({ name: 'get_doc', arguments: { id: '../../README.md' } })).isError, true);
    assert.equal(
      (await client.callTool({ name: 'search_docs', arguments: { query: 'health', limit: 100 } })).isError,
      true,
    );
  } finally {
    await client.close();
  }
});
test('legacy individual requests use SDK framing; Host, Origin, versions and byte limits are enforced', async () => {
  const handler = createMcpHandler({ provider: provider() }, 'http://localhost:3002');
  assert.equal((await handler(request('tools/list', {}, '2025-03-26'))).status, 200);
  assert.equal((await handler(request('tools/list', {}, '2099-01-01'))).status, 400);
  const evil = request('tools/list');
  evil.headers.set('Origin', 'https://evil.example');
  assert.equal((await handler(evil)).status, 403);
  const host = request('tools/list');
  host.headers.set('Host', 'evil.example');
  assert.equal((await handler(host)).status, 403);
  assert.equal((await handler(request('tools/call', { padding: 'x'.repeat(65536) }))).status, 413);
  const limited = createMcpHandler({ provider: provider() }, 'http://localhost:3002', 1);
  await limited(request('tools/list'));
  assert.equal((await limited(request('tools/list'))).status, 429);
});
test('test-only extension enforces scope before handler execution', async () => {
  let calls = 0;
  const descriptor = {
    name: 'test_echo',
    description: 'Test only',
    input: z.object({ text: z.string().max(10) }),
    output: z.object({ text: z.string() }),
    implementation: 'fixture.echo',
    requiredScopes: ['echo:read'],
    guideIds: ['integration-index'],
    examples: [{ input: { text: 'hi' }, output: { text: 'hi' } }],
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  };
  const options = {
    provider: provider(),
    descriptors: [descriptor],
    handlers: {
      'fixture.echo': (input, context, signal) => {
        calls++;
        assert.equal(context.tenantId, 'test');
        signal.throwIfAborted();
        return input;
      },
    },
  };
  const denied = createMcpHandler(options, 'http://localhost:3002');
  assert.equal(
    (await (await denied(request('tools/call', { name: 'test_echo', arguments: { text: 'hi' } }))).json()).result
      .isError,
    true,
  );
  assert.equal(calls, 0);
  const allowed = createMcpHandler(
    { ...options, authorization: { scopes: ['echo:read'], tenantId: 'test' } },
    'http://localhost:3002',
  );
  assert.deepEqual(
    (await (await allowed(request('tools/call', { name: 'test_echo', arguments: { text: 'hi' } }))).json()).result
      .structuredContent,
    { text: 'hi' },
  );
  assert.equal(calls, 1);
});

test('request cancellation aborts an executing injected handler and settles the HTTP response', async () => {
  const controller = new AbortController();
  let cancelled = false;
  const descriptor = {
    name: 'test_wait',
    description: 'Test only',
    input: z.object({}),
    output: z.object({}),
    implementation: 'fixture.wait',
    requiredScopes: [],
    guideIds: ['integration-index'],
    examples: [{ input: {}, output: {} }],
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  };
  const handler = createMcpHandler(
    {
      provider: provider(),
      descriptors: [descriptor],
      handlers: {
        'fixture.wait': (_input, _context, signal) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener(
              'abort',
              () => {
                cancelled = true;
                reject(signal.reason);
              },
              { once: true },
            );
            controller.abort();
          }),
      },
    },
    'http://localhost:3002',
  );
  const response = await handler(
    new Request(request('tools/call', { name: 'test_wait', arguments: {} }), { signal: controller.signal }),
  );
  assert.equal(response.status, 408);
  assert.equal(cancelled, true);
});
