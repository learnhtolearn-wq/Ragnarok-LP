const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('./.playwright-runtime/node_modules/playwright');
const AxeBuilder = require('./.playwright-runtime/node_modules/@axe-core/playwright').default;

const base = 'http://127.0.0.1:8767/';
const videoId = 'KVHa83JkUV0';
const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
const axeTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const output = {
  playwrightVersion: require('./.playwright-runtime/node_modules/playwright/package.json').version,
  axeCoreVersion: require('./.playwright-runtime/node_modules/axe-core/package.json').version,
  viewports: [],
};
const viewports = [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'mobile-390', width: 390, height: 844 },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  output.chromiumVersion = browser.version();
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    const httpErrors = [];
    const externalRequests = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
    page.on('response', (response) => {
      if (response.status() >= 400) httpErrors.push({ status: response.status(), url: response.url() });
      if (/youtube|ytimg/.test(response.url())) externalRequests.push({ status: response.status(), url: response.url() });
    });
    const response = await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
    assert(response.status() === 200, `${viewport.name}: page HTTP ${response.status()}`);
    await page.evaluate(() => document.fonts.ready);
    const showcase = page.locator('#trailer-showcase');
    assert(await showcase.count() === 1, `${viewport.name}: missing unique trailer showcase`);
    const ordered = await page.evaluate(() => {
      const hero = document.querySelector('#hero');
      const trailer = document.querySelector('#trailer-showcase');
      const gameplay = document.querySelector('#gameplay');
      return !!(hero && trailer && gameplay && hero.compareDocumentPosition(trailer) & Node.DOCUMENT_POSITION_FOLLOWING && trailer.compareDocumentPosition(gameplay) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    assert(ordered, `${viewport.name}: trailer block is not between Hero and Gameplay & World`);
    assert((await showcase.locator('h2').innerText()).trim().toLowerCase() === 'discover the world of midgard', `${viewport.name}: unexpected showcase heading`);
    assert((await showcase.locator('.video-subtitle').innerText()).trim() === 'Explore the world. Experience the adventure.', `${viewport.name}: unexpected showcase subtitle`);
    assert(await showcase.locator('iframe').count() === 0, `${viewport.name}: iframe loaded before activation`);
    assert(!externalRequests.some((item) => /youtube\.com\/embed|youtube-nocookie\.com\/embed/.test(item.url)), `${viewport.name}: player requested before activation`);
    const play = showcase.getByRole('button', { name: /play.*trailer/i });
    assert(await play.count() === 1 && await play.isVisible(), `${viewport.name}: accessible play control missing`);
    const fallback = showcase.getByRole('link', { name: /watch on youtube/i });
    assert(await fallback.getAttribute('href') === youtubeUrl, `${viewport.name}: fallback URL mismatch`);
    assert(await fallback.getAttribute('target') === '_blank' && /\bnoopener\b/.test(await fallback.getAttribute('rel') || ''), `${viewport.name}: fallback link target is unsafe`);

    const frame = showcase.locator('.video-facade');
    const ratio = await frame.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return { width: box.width, height: box.height, ratio: box.width / box.height, cssAspectRatio: getComputedStyle(element).aspectRatio };
    });
    assert(Math.abs(ratio.ratio - (16 / 9)) < 0.03, `${viewport.name}: video ratio is ${ratio.ratio}`);
    const headingWidth = await showcase.locator('h2').evaluate((element) => ({ title: element.getBoundingClientRect().width, container: element.closest('.video-showcase-shell').getBoundingClientRect().width }));
    if (viewport.name.startsWith('mobile-')) assert(headingWidth.title >= headingWidth.container * 0.9, `${viewport.name}: video heading is squeezed at ${headingWidth.title}px within ${headingWidth.container}px`);
    const image = showcase.locator('.video-poster');
    await image.evaluate((element) => { element.loading = 'eager'; });
    await image.evaluate((element) => element.decode());

    const beforeAxe = await new AxeBuilder({ page }).withTags(axeTags).analyze();
    const originalSections = await page.locator('main > section:not(#trailer-showcase)').count();
    assert(originalSections === 8, `${viewport.name}: existing eight-section architecture changed (${originalSections} sections)`);
    const steamLinks = await page.locator('a[href*="store.steampowered.com"]').evaluateAll((links) => links.map((link) => link.href));
    assert(steamLinks.length > 0 && steamLinks.every((href) => href === 'https://store.steampowered.com/app/4212480/Ragnarok_The_New_World/'), `${viewport.name}: a Steam CTA destination changed`);

    const fallbackRoute = await context.route(youtubeUrl, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Fallback destination</title>' }));
    const fallbackPagePromise = context.waitForEvent('page');
    await fallback.click();
    const fallbackPage = await fallbackPagePromise;
    await fallbackPage.waitForLoadState('domcontentloaded');
    assert(fallbackPage.url() === youtubeUrl, `${viewport.name}: fallback link opened ${fallbackPage.url()}`);
    await fallbackPage.close();
    await context.unroute(youtubeUrl);

    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach((element) => { element.loading = 'eager'; });
      await Promise.all([...document.images].map((element) => element.decode().catch(() => {})));
      for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(400, innerHeight * 0.7)) {
        window.scrollTo(0, y);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }
      window.scrollTo(0, 0);
    });
    const screenshotRoot = path.resolve('qa/screenshots');
    fs.mkdirSync(screenshotRoot, { recursive: true });
    const suffix = viewport.name;
    const fullPageScreenshot = path.join(screenshotRoot, `video-showcase-${suffix}.png`);
    await page.screenshot({ path: fullPageScreenshot, fullPage: true, animations: 'disabled' });
    const sectionScrollTop = await showcase.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
    const headerHeight = await page.locator('.site-header').evaluate((element) => element.getBoundingClientRect().height);
    const screenshotScrollTop = Math.max(0, sectionScrollTop - headerHeight - 36);
    await page.evaluate((y) => window.scrollTo(0, y), screenshotScrollTop);
    await page.screenshot({ path: path.join(screenshotRoot, `video-block-${suffix}.png`), animations: 'disabled' });
    await page.evaluate(() => window.scrollTo(0, 0));

    await play.focus();
    await page.keyboard.press('Enter');
    const iframe = showcase.locator('iframe');
    assert(await iframe.count() === 1, `${viewport.name}: Enter did not activate the player`);
    const iframeAttrs = await iframe.evaluate((element) => ({ src: element.src, title: element.title, allow: element.allow, referrerPolicy: element.referrerPolicy }));
    assert(new URL(iframeAttrs.src).hostname === 'www.youtube-nocookie.com', `${viewport.name}: iframe did not use youtube-nocookie.com`);
    assert(new URL(iframeAttrs.src).pathname === `/embed/${videoId}`, `${viewport.name}: iframe video ID mismatch`);
    assert(new URL(iframeAttrs.src).searchParams.get('autoplay') === '1', `${viewport.name}: user-initiated playback is not started from the facade control`);
    assert(iframeAttrs.title.toLowerCase().includes('full gameplay trailer'), `${viewport.name}: iframe title is missing or unclear`);
    await iframe.waitFor({ state: 'visible' });
    const frameDeadline = Date.now() + 20000;
    let youtubeFrame;
    while (!youtubeFrame && Date.now() < frameDeadline) {
      youtubeFrame = page.frame({ url: /youtube-nocookie\.com\/embed\/KVHa83JkUV0/ });
      if (!youtubeFrame) await page.waitForTimeout(250);
    }
    assert(youtubeFrame, `${viewport.name}: YouTube iframe document did not attach`);
    await youtubeFrame.waitForFunction(() => {
      const video = document.querySelector('video');
      return !!video && video.readyState >= 2 && video.currentTime > 0.5;
    }, null, { timeout: 20000 });
    const playerPlaybackState = await youtubeFrame.evaluate(() => {
      const video = document.querySelector('video');
      return { readyState: video.readyState, currentTime: video.currentTime, paused: video.paused, dimensions: `${video.videoWidth}x${video.videoHeight}` };
    });
    const afterAxe = await new AxeBuilder({ page }).withTags(axeTags).analyze();
    const afterHostAxe = await new AxeBuilder({ page }).withTags(axeTags).exclude('iframe').analyze();
    await page.evaluate((y) => window.scrollTo(0, y), screenshotScrollTop);
    const sectionScreenshot = path.join(screenshotRoot, `video-player-${suffix}.png`);
    await page.screenshot({ path: sectionScreenshot, animations: 'disabled' });
    const finalFrame = await frame.boundingBox();
    const passed = beforeAxe.violations.length === 0 && afterHostAxe.violations.length === 0;
    output.viewports.push({
      name: viewport.name,
      dimensions: `${viewport.width}x${viewport.height}`,
      pageStatus: response.status(),
      orderedBetweenHeroAndGameplay: ordered,
      iframeAbsentUntilActivation: true,
      keyboardActivation: true,
      iframeAttrs,
      playerPlaybackState,
      facadeRatio: ratio,
      postActivationViewportWidth: finalFrame.width,
      originalEightSectionCount: originalSections,
      fallbackLink: { href: youtubeUrl, target: await fallback.getAttribute('target'), rel: await fallback.getAttribute('rel') },
      axe: {
        beforeViolations: beforeAxe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, description: violation.help, nodes: violation.nodes.map((node) => ({ target: node.target, html: node.html, failureSummary: node.failureSummary })) })),
        afterViolations: afterAxe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, description: violation.help, nodes: violation.nodes.map((node) => ({ target: node.target, html: node.html, failureSummary: node.failureSummary })) })),
        afterHostViolations: afterHostAxe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.map((node) => ({ target: node.target, html: node.html, failureSummary: node.failureSummary })) })),
        incompleteBefore: beforeAxe.incomplete.reduce((sum, item) => sum + item.nodes.length, 0),
        incompleteAfter: afterAxe.incomplete.reduce((sum, item) => sum + item.nodes.length, 0),
        incompleteAfterHost: afterHostAxe.incomplete.reduce((sum, item) => sum + item.nodes.length, 0),
        passed,
      },
      consoleErrors,
      pageErrors,
      failedRequests,
      httpErrors,
      youtubeRequests: externalRequests,
      screenshots: { fullPageFacade: path.relative(process.cwd(), fullPageScreenshot), showcaseFacade: path.relative(process.cwd(), path.join(screenshotRoot, `video-block-${suffix}.png`)), showcasePlaying: path.relative(process.cwd(), sectionScreenshot) },
    });
    await context.close();
  }
  await browser.close();
  const resultPath = path.resolve('qa/video-showcase-test-results.json');
  fs.writeFileSync(resultPath, JSON.stringify(output, null, 2));
  console.log(JSON.stringify(output, null, 2));
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
