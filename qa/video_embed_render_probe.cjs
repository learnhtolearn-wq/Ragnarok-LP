const { chromium } = require('./.playwright-runtime/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const failed = [];
  const playerResponses = [];
  page.on('requestfailed', request => failed.push({ url: request.url(), error: request.failure()?.errorText }));
  page.on('response', response => {
    if (/youtube-nocookie|googlevideo|ytimg/.test(response.url())) playerResponses.push({ status: response.status(), url: response.url() });
  });
  const result = { browser: browser.version(), viewport: '1440x900' };
  try {
    const response = await page.goto('http://127.0.0.1:8767/', { waitUntil: 'networkidle', timeout: 30000 });
    result.pageStatus = response.status();
    const play = page.getByRole('button', { name: /play.*trailer/i });
    await play.click();
    const iframe = page.locator('#trailer-showcase iframe');
    await iframe.waitFor({ state: 'visible' });
    await page.waitForTimeout(10000);
    const frame = page.frames().find(candidate => candidate.url().includes('youtube-nocookie.com/embed/KVHa83JkUV0'));
    result.frameUrl = frame?.url() || null;
    result.playerState = frame ? await frame.evaluate(() => {
      const video = document.querySelector('video');
      return {
        title: document.title,
        hasPlayer: !!document.querySelector('#movie_player'),
        videoReadyState: video?.readyState ?? null,
        videoNetworkState: video?.networkState ?? null,
        videoCurrentTime: video?.currentTime ?? null,
        videoPaused: video?.paused ?? null,
        videoSize: video ? `${video.videoWidth}x${video.videoHeight}` : null,
        visibleError: document.querySelector('.ytp-error')?.innerText || null,
      };
    }) : null;
    await page.locator('#trailer-showcase').screenshot({ path: 'qa/screenshots/video-player-probe-desktop-1440.png', animations: 'disabled' });
    result.failedRequests = failed;
    result.playerResponses = playerResponses.map(({ status, url }) => ({ status, host: new URL(url).host, path: new URL(url).pathname.slice(0, 90) }));
  } catch (error) {
    result.error = error.message;
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify(result, null, 2));
  if (result.error) process.exitCode = 1;
})();
