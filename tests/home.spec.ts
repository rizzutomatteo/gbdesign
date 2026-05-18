import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('carica con titolo corretto', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/GB Design/);
  });

  test('esattamente un H1', async ({ page }) => {
    await page.goto('/');
    const h1s = await page.getByRole('heading', { level: 1 }).count();
    expect(h1s).toBe(1);
  });

  test('lang="it" sul documento', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('it');
  });

  test('nessun errore console', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    expect(errors).toEqual([]);
  });

  test('skip link accessibile', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.getByRole('link', { name: /vai al contenuto/i });
    await expect(skipLink).toBeAttached();
  });

  test('header presente e visibile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
  });

  test('footer presente', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeAttached();
  });

  test('sezione contatti raggiungibile via anchor', async ({ page }) => {
    await page.goto('/#contatti');
    await expect(page.locator('#contatti')).toBeAttached();
  });
});

test.describe('Pagina 404', () => {
  test('risponde con contenuto', async ({ page }) => {
    await page.goto('/pagina-che-non-esiste');
    await expect(page.locator('h1')).toBeAttached();
  });
});

test.describe('Pagine legali', () => {
  test('privacy carica', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveTitle(/Privacy/i);
  });

  test('cookie carica', async ({ page }) => {
    await page.goto('/cookie');
    await expect(page).toHaveTitle(/Cookie/i);
  });

  test('grazie carica', async ({ page }) => {
    await page.goto('/grazie');
    await expect(page.locator('h1')).toBeAttached();
  });
});
