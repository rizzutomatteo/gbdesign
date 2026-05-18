import { test, expect } from '@playwright/test';

test('meta description presente nella home', async ({ page }) => {
  await page.goto('/');
  const meta = await page.locator('meta[name="description"]').getAttribute('content');
  expect(meta).toBeTruthy();
  expect(meta!.length).toBeGreaterThan(10);
});

test('Open Graph tags presenti', async ({ page }) => {
  await page.goto('/');
  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
  const ogDescription = await page
    .locator('meta[property="og:description"]')
    .getAttribute('content');
  expect(ogTitle).toBeTruthy();
  expect(ogDescription).toBeTruthy();
});

test('Schema.org JSON-LD presente', async ({ page }) => {
  await page.goto('/');
  const schemaEl = page.locator('script[type="application/ld+json"]');
  await expect(schemaEl).toBeAttached();
  const content = await schemaEl.textContent();
  const schema = JSON.parse(content!);
  expect(schema['@type']).toBe('MovingCompany');
});

test('numero di telefono presente nella pagina', async ({ page }) => {
  await page.goto('/');
  const telLink = page.locator('a[href^="tel:"]').first();
  await expect(telLink).toBeAttached();
});
