const path = require('node:path');
const { chromium } = require('./.playwright-runtime/node_modules/playwright');

const videoId = 'KVHa83JkUV0';
const localUrl = 'http://127.0.0.1:8767/';
const fileUrl = `file://${path.resolve('index.html').replace(/\\/g, '/')}`;

async function probe(browser, url, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const result = { url, pageStatus: null, iframeRequest: null, player: null, consoleErrors: [] };
  page.on('console', message => { if (message.type() === 'error') result.consoleErrors.push(message.text()); });
  page.on('request', request => {
    if (request.url().includes(`youtube-nocookie.com/embed/${videoId}`)) {
      result.iframeRequest = { url: request.url(), headers: request.headers() };
    }
  });
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    result.pageStatus = response?.status() ?? null;
    const play = page.getByRole('button', { name: /play.*trailer/i });
    result.playButtonVisible = await play.isVisible().catch(() => false);
    await play.click();
    const iframe = page.locator('#trailer-showcase iframe');
    await iframe.waitFor({ state: 'visible', timeout: 10000 });
    result.iframeAttributes = await iframe.evaluate(element => ({
      referrerpolicy: element.getAttribute('referrerpolicy'),
      property: element.referrerPolicy,
      src: element.src,
      title: element.title,
    }));
    const deadline = Date.now() + 20000;
    let frame;
    while (!frame && Date.now() < deadline) {
      frame = page.frame({ url: new RegExp(`youtube-nocookie\\.com/embed/${videoId}`) });
      if (!frame) await page.waitForTimeout(250);
    }
    if (frame) {
      await frame.waitForFunction(() => {
        const video = document.querySelector('video');
        return !!video && video.readyState >= 2 && video.currentTime > 0.5;
      }, null, { timeout: 20000 });
      result.player = await frame.evaluate(() => {
        const video = document.querySelector('video');
        return { readyState: video.readyState, paused: video.paused, currentTime: video.currentTime, dimensions: `${video.videoWidth}x${video.videoHeight}` };
      });
    }
  } catch (error) {
    result.error = error.message;
  }
  await context.close();
  return result;
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const output = {
    chromium: browser.version(),
    localDesktop: await probe(browser, localUrl, { width: 1440, height: 900 }),
    localMobile: await probe(browser, localUrl, { width: 390, height: 844 }),
    fileDesktop: await probe(browser, fileUrl, { width: 1440, height: 900 }),
  };
  require('node:fs').writeFileSync('qa/youtube-referer-probe.json', JSON.stringify(output, null, 2));
  await browser.close();
  console.log(JSON.stringify(output, null, 2));
})();
