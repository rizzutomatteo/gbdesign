import { test } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const viewports = [
  { name: '375x812-iphone-se', width: 375, height: 812 },
  { name: '390x844-iphone-14', width: 390, height: 844 },
  { name: '768x1024-ipad-portrait', width: 768, height: 1024 },
  { name: '1024x768-tablet-landscape', width: 1024, height: 768 },
  { name: '1280x800-laptop', width: 1280, height: 800 },
  { name: '1920x1080-desktop', width: 1920, height: 1080 },
];

const screenshotDir = path.join(__dirname, 'screenshots');

test.beforeAll(() => {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
});

for (const vp of viewports) {
  test(`visual audit - ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:4321', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => document.fonts.ready);

    // Scroll to bottom slowly to trigger lazy-loaded content
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 80);
      });
    });

    // Scroll back to top and wait for any animations to settle
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);

    // Full-page screenshot
    await page.screenshot({
      path: path.join(screenshotDir, `${vp.name}-full.png`),
      fullPage: true,
    });

    // Above-the-fold screenshot
    await page.screenshot({
      path: path.join(screenshotDir, `${vp.name}-fold.png`),
      fullPage: false,
    });

    // Detect horizontal overflow at page level
    const overflowInfo = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const hasOverflow = scrollWidth > docWidth;

      // Walk all elements to find which ones bleed outside
      const offenders: Array<{ selector: string; right: number; docWidth: number }> = [];
      document.querySelectorAll('*').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > docWidth + 2) {
          const tag = el.tagName.toLowerCase();
          const id = el.id ? `#${el.id}` : '';
          const cls = el.classList.length ? `.${Array.from(el.classList).slice(0, 2).join('.')}` : '';
          offenders.push({
            selector: `${tag}${id}${cls}`,
            right: Math.round(rect.right),
            docWidth,
          });
        }
      });

      return { hasOverflow, scrollWidth, docWidth, offenders: offenders.slice(0, 10) };
    });

    // Log results to stdout for inspection
    console.log(`\n=== ${vp.name} (${vp.width}x${vp.height}) ===`);
    console.log(`Horizontal overflow: ${overflowInfo.hasOverflow} (scrollWidth=${overflowInfo.scrollWidth}, clientWidth=${overflowInfo.docWidth})`);
    if (overflowInfo.offenders.length > 0) {
      console.log('Offending elements (bleeds outside viewport):');
      overflowInfo.offenders.forEach((o) =>
        console.log(`  ${o.selector}  right=${o.right}px (limit=${o.docWidth}px)`)
      );
    }
  });
}
