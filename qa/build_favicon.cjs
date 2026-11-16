const fs = require('node:fs');
const { chromium } = require('./.playwright-runtime/node_modules/playwright');

(async () => {
  const svg = fs.readFileSync('assets/logos/favicon.svg', 'utf8').replace('<svg ', '<svg width="64" height="64" ');
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 64, height: 64 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><body style="margin:0;width:64px;height:64px">${svg}</body></html>`);
  const png = await page.screenshot({ type: 'png', omitBackground: false });
  await browser.close();

  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(64, 6);
  header.writeUInt8(64, 7);
  header.writeUInt8(0, 8);
  header.writeUInt8(0, 9);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  fs.writeFileSync('favicon.ico', Buffer.concat([header, png]));
  console.log(`Created favicon.ico, 64x64 PNG image data, ${png.length} bytes`);
})().catch((err) => { console.error(err.stack || err); process.exitCode = 1; });
