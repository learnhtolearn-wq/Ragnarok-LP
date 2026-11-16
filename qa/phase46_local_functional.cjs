const { chromium } = require('./.playwright-runtime/node_modules/playwright');

const base = 'http://127.0.0.1:8767/';
const steam = 'https://store.steampowered.com/app/4212480/Ragnarok_The_New_World/';
const viewports = [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-430', width: 430, height: 932 },
];

const assert = (value, message) => { if (!value) throw new Error(message); };

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const output = { viewports: [], ctaHrefCount: 0, localChecks: [] };
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [];
    const failedRequests = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
    const response = await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30000 });
    assert(response.status() === 200, `${viewport.name}: page returned ${response.status()}`);
    const data = await page.evaluate(({ steam }) => {
      const anchors = [...document.querySelectorAll('a[href]')];
      const internal = anchors.filter((a) => a.getAttribute('href')?.startsWith('#'));
      return {
        steamHrefs: anchors.filter((a) => a.href === steam).length,
        badAnchors: internal.filter((a) => !document.getElementById(a.hash.slice(1))).map((a) => a.hash),
        width: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        navHidden: document.querySelector('#site-nav').getAttribute('aria-hidden'),
        navInert: document.querySelector('#site-nav').inert,
        faqCount: document.querySelectorAll('#faq details').length,
        druidDisclaimer: document.body.textContent.includes('Official Steam descriptions list these Druid forms'),
      };
    }, { steam });
    assert(data.steamHrefs >= 1, `${viewport.name}: missing Steam CTA`);
    assert(data.badAnchors.length === 0, `${viewport.name}: unresolved anchors`);
    assert(data.width <= data.viewport, `${viewport.name}: horizontal overflow`);
    assert(data.faqCount === 4, `${viewport.name}: FAQ count changed`);
    assert(!data.druidDisclaimer, `${viewport.name}: Druid disclaimer remains`);
    if (viewport.width <= 850) {
      const toggle = page.locator('.nav-toggle');
      await toggle.click();
      assert(await toggle.getAttribute('aria-expanded') === 'true', `${viewport.name}: menu did not open`);
      assert(await page.locator('#site-nav').getAttribute('aria-hidden') === 'false', `${viewport.name}: open menu aria state`);
      assert(await page.locator('#site-nav').evaluate((node) => !node.inert), `${viewport.name}: open menu inert state`);
      await toggle.click();
      assert(await toggle.getAttribute('aria-expanded') === 'false', `${viewport.name}: menu did not close`);
      assert(await page.locator('#site-nav').evaluate((node) => node.inert), `${viewport.name}: closed menu inert state`);
    }
    const faq = page.locator('#faq details').first();
    if (await faq.evaluate((node) => node.open)) await faq.locator('summary').press('Space');
    await faq.locator('summary').press('Space');
    assert(await faq.evaluate((node) => node.open), `${viewport.name}: FAQ did not open`);
    await faq.locator('summary').press('Space');
    assert(!(await faq.evaluate((node) => node.open)), `${viewport.name}: FAQ did not close`);
    const facade = page.locator('[data-video-facade]');
    assert(await facade.locator('iframe').count() === 0, `${viewport.name}: video iframe loaded before activation`);
    await facade.locator('[data-video-play]').click();
    const iframe = facade.locator('iframe');
    assert(await iframe.count() === 1, `${viewport.name}: video iframe did not load on activation`);
    assert(await iframe.getAttribute('title') === 'Ragnarok: The New World | First Global Full Gameplay Trailer Released', `${viewport.name}: iframe title`);
    assert(await iframe.getAttribute('referrerpolicy') === 'strict-origin-when-cross-origin', `${viewport.name}: iframe referrer policy`);
    output.ctaHrefCount = data.steamHrefs;
    output.viewports.push({ name: viewport.name, status: response.status(), overflow: false, consoleErrors: errors, failedRequests, ctaHrefCount: data.steamHrefs });
    await context.close();
  }
  await browser.close();
  console.log(JSON.stringify(output, null, 2));
})();
