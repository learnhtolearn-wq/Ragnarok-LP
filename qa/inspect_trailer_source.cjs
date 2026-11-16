const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('./.playwright-runtime/node_modules/playwright');

const videoId = 'KVHa83JkUV0';
const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const failedRequests = [];
  page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
  const response = await page.goto(videoUrl, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch((error) => ({ status: () => null, error: error.message }));
  const pageInfo = await page.evaluate(() => ({
    title: document.title,
    channel: document.querySelector('#owner #channel-name a')?.textContent?.trim() || document.querySelector('ytd-channel-name a')?.textContent?.trim() || null,
    videoTitle: document.querySelector('h1 yt-formatted-string')?.textContent?.trim() || null,
    videoPresent: !!document.querySelector('video'),
    playerError: document.querySelector('.ytp-error-content-wrap')?.textContent?.trim() || null,
  })).catch((error) => ({ evaluationError: error.message }));
  let playback = { attempted: false, result: null, currentTime: null, videoSize: null };
  const playButton = page.locator('.ytp-large-play-button').first();
  if (await playButton.count().catch(() => 0)) {
    playback.attempted = true;
    await playButton.click({ timeout: 5000 }).catch((error) => { playback.result = error.message; });
    await page.waitForTimeout(7000);
    playback.currentTime = await page.locator('video').evaluate((video) => video.currentTime).catch(() => null);
    playback.videoSize = await page.locator('video').evaluate((video) => ({ width: video.videoWidth, height: video.videoHeight, readyState: video.readyState })).catch(() => null);
  }
  const thumbnailVariants = [];
  for (const name of ['maxresdefault', 'hq720', 'sddefault', 'hqdefault']) {
    const url = `https://i.ytimg.com/vi/${videoId}/${name}.jpg`;
    const imageResponse = await page.request.get(url).catch((error) => ({ status: () => null, error: error.message }));
    const dimensions = await page.evaluate(async (imageUrl) => {
      const image = new Image();
      image.src = imageUrl;
      await image.decode().catch(() => {});
      return { naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight };
    }, url);
    thumbnailVariants.push({ name, url, status: imageResponse.status(), error: imageResponse.error || null, ...dimensions });
  }
  const screenshotPath = path.resolve('qa/screenshots/official-trailer-source-review.png');
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath, animations: 'disabled' }).catch(() => {});
  const posterPreview = await context.newPage();
  await posterPreview.goto(`https://i.ytimg.com/vi/${videoId}/sddefault.jpg`, { waitUntil: 'load', timeout: 20000 });
  const posterScreenshotPath = path.resolve('qa/screenshots/official-trailer-poster-review.png');
  await posterPreview.screenshot({ path: posterScreenshotPath });
  const result = { videoUrl, httpStatus: response.status(), navigationError: response.error || null, browser: browser.version(), pageInfo, playback, thumbnailVariants, failedRequests, screenshot: path.relative(process.cwd(), screenshotPath), posterScreenshot: path.relative(process.cwd(), posterScreenshotPath) };
  fs.writeFileSync('qa/official-trailer-source-review.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await context.close();
  await browser.close();
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
