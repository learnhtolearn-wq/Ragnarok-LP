const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('./.playwright-runtime/node_modules/playwright');

const base = 'http://127.0.0.1:8767/';
const files = [
  ['assets/images/hero_mobile.webp', 'assets/images/hero_mobile_compact.webp', 640, 800],
  ['assets/images/screenshot_01_full.webp', 'assets/images/screenshot_01_compact.webp', 768, 432],
  ['assets/classes/class_lineup.webp', 'assets/classes/class_lineup_compact.webp', 768, 432],
  ['assets/images/hero_mobile.webp', 'assets/images/hero_mobile_optimized.webp', 768, 960],
  ['assets/images/screenshot_01_full.webp', 'assets/images/screenshot_01_mobile.webp', 960, 540],
  ['assets/classes/class_lineup.webp', 'assets/classes/class_lineup_mobile.webp', 960, 540],
  ['assets/images/screenshot_04_full.webp', 'assets/images/screenshot_04_mobile.webp', 960, 540],
  ['assets/images/screenshot_02_full.webp', 'assets/images/screenshot_02_mobile.webp', 960, 540],
  ['assets/images/screenshot_11_full.webp', 'assets/images/screenshot_11_mobile.webp', 960, 540],
  ['assets/images/screenshot_06_full.webp', 'assets/images/screenshot_06_mobile.webp', 960, 540],
  ['assets/images/screenshot_03_full.webp', 'assets/images/screenshot_03_mobile.webp', 960, 540],
];

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage();
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  const results = [];
  for (const [source, output, width, height] of files) {
    const data = await page.evaluate(async ({ url, width, height }) => {
      const image = new Image();
      image.src = url;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, width, height);
      return canvas.toDataURL('image/webp', 0.82);
    }, { url: base + source, width, height });
    const buffer = Buffer.from(data.split(',')[1], 'base64');
    const outputPath = path.resolve(output);
    fs.writeFileSync(outputPath, buffer);
    results.push({ source, output, dimensions: `${width}x${height}`, bytes: buffer.length });
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
