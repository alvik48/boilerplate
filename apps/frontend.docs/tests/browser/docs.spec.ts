import { rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { expect, test } from '@playwright/test';
import { z } from 'zod';

test('desktop and mobile sections, normalized links and scoped search', async ({ page }) => {
  await page.goto('/docs');
  await expect(page.getByRole('heading', { name: 'Project documentation', exact: true })).toBeVisible();
  await page.goto('/docs/repository/frontend');
  await expect(page.getByRole('navigation', { name: 'Documentation sections' })).toHaveCount(0);
  await expect(page.locator('#nd-sidebar').getByRole('link', { name: /^(Integration|API|Repository)$/ })).toHaveCount(
    0,
  );
  await page.getByRole('button', { name: 'Repository', exact: true }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Integration', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Integration guide', exact: true })).toBeVisible();
  await page.getByLabel('Search documentation', { exact: true }).fill('health');
  await page.getByLabel('Search scope').selectOption('integration');
  await expect(
    page.locator('.docs-search-results').getByRole('link', { name: 'Local health example' }).first(),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open Sidebar', exact: true }).click();
  await page.getByRole('button', { name: 'Integration', exact: true }).click();

  for (const name of ['Integration', 'API', 'Repository']) {
    await expect(page.getByRole('dialog').getByRole('link', { name, exact: true })).toBeVisible();
  }

  await page.getByRole('dialog').getByRole('link', { name: 'Repository', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/repository$/);
  await page.locator('#nd-sidebar-mobile').getByRole('button', { name: 'Close Sidebar', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/docs-mobile.png', fullPage: true });
});

test('health playground sends a real CORS request and renders the contract', async ({ page }) => {
  await page.goto('/docs/api/backend-template/getHealth');
  await expect(page.getByRole('heading', { name: 'Check template health', exact: true }).first()).toBeVisible();
  const response = page.waitForResponse((response) => response.url() === 'http://localhost:3000/health');

  await page.getByRole('button', { name: /send/i }).click();
  expect((await response).status()).toBe(200);
  await page.screenshot({ path: 'test-results/health-playground.png', fullPage: true });
});

test('authenticated body/error fixture never persists credentials', async ({ page }) => {
  await page.goto('/test-fixtures/playground');
  const denied = page.waitForResponse(
    (response) => response.url() === 'http://localhost:3999/echo' && response.request().method() === 'POST',
  );

  await page.getByRole('button', { name: /send/i }).click();
  expect((await denied).status()).toBe(401);
  await page.getByRole('button', { name: 'Authorization', exact: true }).click();
  await page.getByRole('textbox', { name: /authorization/i }).fill('Bearer test-only-token');
  const accepted = page.waitForResponse(
    (response) => response.url() === 'http://localhost:3999/echo' && response.status() === 200,
  );

  await page.getByRole('button', { name: /send/i }).click();
  const response = await accepted;

  expect(await response.json()).toEqual({ message: 'hello' });
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('test-only-token');
  await page.reload();
  await page.getByRole('button', { name: 'Authorization', exact: true }).click();
  await expect(page.getByRole('textbox', { name: /authorization/i })).not.toHaveValue('Bearer test-only-token');
});

test('root Markdown additions, edits, renames and deletion refresh site, exports and MCP corpus', async ({
  page,
  request,
}) => {
  const file = path.resolve('../../docs/integration/browser-verification.md');
  const moved = path.resolve('../../docs/integration/browser-verification-moved.md');
  const content = (text: string) =>
    `---\nid: browser-verification\ntitle: Browser verification\ndescription: Hot reload verification\ntype: guide\naudience: [integrator, agent]\n---\n\n# Browser verification\n\n${text}\n`;
  const readMcp = async () => {
    const response = await request.post('/mcp', {
      headers: { Accept: 'application/json, text/event-stream', 'MCP-Protocol-Version': '2025-11-25' },
      data: {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: 'get_doc', arguments: { id: 'browser-verification' } },
      },
    });

    return z
      .object({
        result: z.object({
          structuredContent: z.object({ markdown: z.string(), url: z.string() }).optional(),
          isError: z.boolean().optional(),
        }),
      })
      .parse(await response.json()).result;
  };

  try {
    await writeFile(file, content('Unique live content'));
    await expect
      .poll(async () => (await request.get('/docs/integration/browser-verification.md')).status(), { timeout: 30000 })
      .toBe(200);
    // Markdown publication precedes Next's asynchronous compilation of the newly
    // discovered MDX module. Wait for the page itself before navigating to it.
    await expect
      .poll(
        async () =>
          (await (await request.get('/docs/integration/browser-verification')).text()).includes('Unique live content'),
        { timeout: 30000 },
      )
      .toBe(true);
    await page.goto('/docs/integration/browser-verification');
    await expect(page.getByText('Unique live content')).toBeVisible();
    await writeFile(file, content('Updated live content'));
    await expect(page.getByText('Updated live content')).toBeVisible({ timeout: 30000 });
    const search = await request.get('/api/search?query=Updated%20live%20content&scope=integration');
    const searchBody = (await search.json()) as { items: { id: string }[] };

    expect(searchBody.items.some((item) => item.id === 'browser-verification')).toBe(true);
    expect((await readMcp()).structuredContent?.markdown).toContain('Updated live content');
    await rename(file, moved);
    await expect
      .poll(async () => (await request.get('/docs/integration/browser-verification-moved.md')).status(), {
        timeout: 30000,
      })
      .toBe(200);
    await expect.poll(async () => (await request.get('/docs/integration/browser-verification.md')).status()).toBe(404);
    await expect
      .poll(async () => (await request.get('/docs/integration/browser-verification-moved')).status(), {
        timeout: 30000,
      })
      .toBe(200);
    await expect
      .poll(async () => (await request.get('/docs/integration/browser-verification')).status(), { timeout: 30000 })
      .toBe(404);
    expect((await readMcp()).structuredContent?.url).toContain('/browser-verification-moved');
    await rm(moved);
    await expect
      .poll(async () => (await request.get('/docs/integration/browser-verification-moved.md')).status(), {
        timeout: 30000,
      })
      .toBe(404);
    await expect
      .poll(async () => (await request.get('/docs/integration/browser-verification-moved')).status(), {
        timeout: 30000,
      })
      .toBe(404);
    await expect.poll(async () => (await request.get('/docs/integration')).status(), { timeout: 30000 }).toBe(200);
    expect((await readMcp()).isError).toBe(true);
  } finally {
    await rm(file, { force: true });
    await rm(moved, { force: true });
  }
});
