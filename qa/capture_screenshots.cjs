const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('./.playwright-runtime/node_modules/playwright');

const out = path.resolve('qa/screenshots');
const base = 'http://127.0.0.1:8767/';
const viewports = [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-430', width: 430, height: 932 },
];
const baselineStyles = `
  .section-world h2 em, .section-activities h2 em, .section-steam h2 em { color: #e1c28b !important; }
  .eyebrow-dark { color: #8f7650 !important; }
  .section-heading .section-intro { color: rgba(232,220,197,.6) !important; }
  .fine-print { color: #77757a !important; }
  .site-footer { color: rgba(232,220,197,.42) !important; }
`;

async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
  });
  await page.waitForTimeout(500);
}

async function captureVersion(browser, vp, version) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  const failed = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('requestfailed', (req) => failed.push({ url: req.url(), error: req.failure()?.errorText }));
  page.on('response', (res) => { if (res.status() >= 400) errors.push(`HTTP ${res.status()} ${res.url()}`); });
  const response = await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await settle(page);
  if (version === 'before') await page.addStyleTag({ content: baselineStyles });
  const suffix = version === 'before' ? '-before' : '';
  const fullName = `${vp.name}${suffix}.png`;
  await page.screenshot({ path: path.join(out, fullName), fullPage: true, animations: 'disabled' });
  const sectionNames = [];
  if (vp.name === 'desktop-1440' || vp.name === 'mobile-390') {
    for (const id of ['activities', 'gameplay', 'steam']) {
      const name = `${id}-${vp.name === 'desktop-1440' ? 'desktop' : 'mobile'}${suffix}.png`;
      await page.locator(`#${id}`).evaluate((el) => window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 78));
      await page.evaluate(() => document.activeElement?.blur());
      await page.waitForTimeout(100);
      await page.screenshot({ path: path.join(out, name), fullPage: false, animations: 'disabled' });
      sectionNames.push(name);
    }
  }
  let multiplayerName;
  if (version === 'after' && (vp.name === 'desktop-1440' || vp.name === 'mobile-390')) {
    multiplayerName = `multiplayer-${vp.name === 'desktop-1440' ? 'desktop' : 'mobile'}.png`;
    await page.locator('#multiplayer').evaluate((el) => window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 78));
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({ path: path.join(out, multiplayerName), fullPage: false, animations: 'disabled' });
  }
  const missingImages = await page.locator('img').evaluateAll((imgs) => imgs.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.getAttribute('src')));
  await context.close();
  return { viewport: `${vp.width}x${vp.height}`, version, httpStatus: response.status(), screenshot: fullName, sections: sectionNames, multiplayer: multiplayerName || null, missingImages: [...new Set(missingImages)], consoleOrPageErrors: [...new Set(errors)], failedRequests: failed };
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const version = require('./.playwright-runtime/node_modules/playwright/package.json').version;
  const results = [];
  for (const vp of viewports) results.push(await captureVersion(browser, vp, 'before'));
  for (const vp of viewports) results.push(await captureVersion(browser, vp, 'after'));
  await browser.close();
  console.log(JSON.stringify({ playwrightVersion: version, chromiumVersion: browser.version(), results }, null, 2));
})().catch((err) => { console.error(err.stack || err); process.exitCode = 1; });
