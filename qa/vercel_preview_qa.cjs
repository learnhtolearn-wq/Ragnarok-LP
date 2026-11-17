const fs = require('node:fs');
const { chromium } = require('./.playwright-runtime/node_modules/playwright');

const base = 'https://ragnarok-dra4mqnwb-learnhtolearn-3709s-projects.vercel.app';
const viewports = [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-430', width: 430, height: 932 },
];
const steam = 'https://store.steampowered.com/app/4212480/Ragnarok_The_New_World/';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const output = { base, browser: browser.version(), viewports: [], checkedAt: new Date().toISOString() };
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];
    const iframeRequests = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
    page.on('request', request => { if (request.url().includes('youtube-nocookie.com/embed/KVHa83JkUV0')) iframeRequests.push({ url: request.url(), referer: request.headers().referer || null }); });
    const response = await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 30000 });
    assert(response.status() === 200, `${viewport.name}: root HTTP ${response.status()}`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `qa/screenshots/vercel-${viewport.name}.png`, fullPage: false, scale: 'css' });
    const assetUrls = await page.evaluate(() => Array.from(document.querySelectorAll('link[href],script[src],img[src],img[srcset]')).flatMap(element => {
      const urls = [];
      if (element.href) urls.push(element.href);
      if (element.src) urls.push(element.src);
      if (element.srcset) urls.push(...element.srcset.split(',').map(item => item.trim().split(/\s+/)[0]));
      return urls;
    }).filter(url => url.startsWith(location.origin)));
    const resolvedAssets = await Promise.all(assetUrls.map(async url => ({ url, status: await page.evaluate(async assetUrl => (await fetch(assetUrl)).status, url) })));
    const failedAssets = resolvedAssets.filter(asset => asset.status !== 200);
    const steamLinks = await page.locator(`a[href="${steam}"]`).count();
    assert(steamLinks >= 1, `${viewport.name}: Steam CTA missing`);
    assert(await page.locator('a[href^="#"]').count() >= 4, `${viewport.name}: internal navigation missing`);
    const faqCount = await page.locator('section#faq details').count();
    for (let index = 0; index < faqCount; index += 1) {
      const faq = page.locator('section#faq details').nth(index);
      if (await faq.getAttribute('open') === null) await faq.locator('summary').click();
      assert(await faq.getAttribute('open') !== null, `${viewport.name}: FAQ ${index + 1} did not open`);
      assert(await faq.locator('p').isVisible(), `${viewport.name}: FAQ ${index + 1} answer hidden`);
      await faq.locator('summary').click();
    }
    const menuButton = page.getByRole('button', { name: /menu/i });
    if (await menuButton.count()) {
      await menuButton.click();
      assert(await menuButton.getAttribute('aria-expanded') === 'true', `${viewport.name}: menu did not open`);
      await menuButton.click();
      assert(await menuButton.getAttribute('aria-expanded') === 'false', `${viewport.name}: menu did not close`);
    }
    const play = page.getByRole('button', { name: /play.*trailer/i });
    await play.click();
    const iframe = page.locator('#trailer-showcase iframe');
    await iframe.waitFor({ state: 'visible', timeout: 10000 });
    assert(await iframe.getAttribute('title') === 'Ragnarok: The New World | First Global Full Gameplay Trailer Released', `${viewport.name}: iframe title mismatch`);
    assert(await iframe.getAttribute('referrerpolicy') === 'strict-origin-when-cross-origin', `${viewport.name}: iframe referrer policy mismatch`);
    output.viewports.push({
      viewport: `${viewport.width}x${viewport.height}`,
      pageStatus: response.status(),
      steamLinks,
      localAssetCount: resolvedAssets.length,
      allLocalAssets200: failedAssets.length === 0,
      failedAssets,
      faqCount,
      iframeRequest: iframeRequests[0] || null,
      consoleErrors,
      failedRequests,
    });
    await context.close();
  }
  await browser.close();
  fs.writeFileSync('qa/vercel-preview-qa.json', JSON.stringify(output, null, 2));
  console.log(JSON.stringify(output, null, 2));
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
