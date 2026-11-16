const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('./.playwright-runtime/node_modules/playwright');

const base = 'http://127.0.0.1:8767/';
const out = path.resolve('qa/screenshots');
const viewports = [
  { name: 'contrast-after-desktop.png', width: 1440, height: 900 },
  { name: 'contrast-after-mobile.png', width: 390, height: 844 }
];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const results = [];
  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const response = await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; }));
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
      for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(400, innerHeight * 0.7)) {
        window.scrollTo(0, y);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(150);
    const file = path.join(out, vp.name);
    await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
    results.push({ viewport: `${vp.width}x${vp.height}`, status: response.status(), file: path.relative(process.cwd(), file) });
    await context.close();
  }
  const browserVersion = browser.version();
  await browser.close();
  console.log(JSON.stringify({ browserVersion, results }, null, 2));
})().catch((err) => { console.error(err.stack || err); process.exitCode = 1; });
