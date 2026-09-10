import { expect, test } from '@playwright/test';

// Browser test for the behavior that unit tests cannot reach: that the filter
// state genuinely lives in the URL, and survives a reload.

test('filtering by tag puts the filter in the URL and survives a reload', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Articles' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(5);

  await page.getByRole('button', { name: 'testing', exact: true }).click();

  await expect(page).toHaveURL(/\?tag=testing$/);
  await expect(page.getByRole('listitem')).toHaveCount(1);

  // The reload is the point: state held in useState would be gone here.
  await page.reload();
  await expect(page.getByRole('listitem')).toHaveCount(1);

  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(page).not.toHaveURL(/tag=/);
  await expect(page.getByRole('listitem')).toHaveCount(5);
});

test('an unknown tag in the URL falls back to showing everything', async ({ page }) => {
  await page.goto('/?tag=nonsense');

  await expect(page.getByRole('listitem')).toHaveCount(5);
});
