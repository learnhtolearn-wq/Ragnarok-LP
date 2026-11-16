const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('./.playwright-runtime/node_modules/playwright');

const base = 'http://127.0.0.1:8767/';
const out = path.resolve('qa/screenshots');
const viewports = [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'mobile-390', width: 390, height: 844 },
];

async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach((image) => { image.loading = 'eager'; });
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
  });
  await page.waitForTimeout(250);
}

async function capture(browser, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
  const response = await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await settle(page);
  const prefix = `typography-${viewport.name}`;
  const fullPage = `${prefix}-full.png`;
  await page.screenshot({ path: path.join(out, fullPage), fullPage: true, animations: 'disabled' });
  const focused = {};
  for (const id of ['hero', 'activities']) {
    const section = page.locator(`#${id}`);
    await section.evaluate((element) => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 78));
    await page.waitForTimeout(100);
    const file = `${prefix}-${id}.png`;
    await page.screenshot({ path: path.join(out, file), fullPage: false, animations: 'disabled' });
    focused[id] = `qa/screenshots/${file}`;
  }
  const layout = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: innerWidth,
    overflow: document.documentElement.scrollWidth > innerWidth,
  }));
  await context.close();
  return { viewport: `${viewport.width}x${viewport.height}`, status: response.status(), fullPage: `qa/screenshots/${fullPage}`, focused, layout, consoleErrors, failedRequests };
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const results = [];
  for (const viewport of viewports) results.push(await capture(browser, viewport));
  const output = { playwright: require('./.playwright-runtime/node_modules/playwright/package.json').version, chromium: browser.version(), results };
  await browser.close();
  fs.writeFileSync('qa/typography-screenshot-results.json', JSON.stringify(output, null, 2));
  console.log(JSON.stringify(output, null, 2));
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
