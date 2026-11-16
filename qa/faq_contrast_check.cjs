const fs = require('node:fs');
const { PNG } = require('./.playwright-runtime/node_modules/pngjs');
const { chromium } = require('./.playwright-runtime/node_modules/playwright');

const base = 'http://127.0.0.1:8767/';
const viewports = [{ name: 'desktop-1440', width: 1440, height: 900 }, { name: 'mobile-390', width: 390, height: 844 }];
const lum = (rgb) => { const c = rgb.map((v) => v / 255).map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const parse = (value) => { const p = value.match(/rgba?\(([^)]+)\)/)[1].split(',').map((v) => Number.parseFloat(v.trim())); return [p[0], p[1], p[2], p[3] ?? 1]; };

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const output = { browser: browser.version(), viewports: [] };
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(async () => { await document.fonts.ready; });
    const answers = page.locator('#faq details');
    const rows = [];
    for (let index = 0; index < await answers.count(); index += 1) {
      const detail = answers.nth(index);
      if (await detail.getAttribute('open') === null) await detail.locator('summary').click();
      const answer = detail.locator('p');
      await answer.scrollIntoViewIfNeeded();
      const box = await answer.boundingBox();
      const style = await answer.evaluate((element) => { const s = getComputedStyle(element); const opacity = [...(function* ancestors(node) { for (let p = node; p; p = p.parentElement) yield Number.parseFloat(getComputedStyle(p).opacity || '1'); })(element)].reduce((a, b) => a * b, 1); return { color: s.color, opacity, text: element.textContent.trim() }; });
      const clip = { x: Math.max(0, Math.floor(box.x - 2)), y: Math.max(0, Math.floor(box.y - 2)), width: Math.ceil(box.width + 4), height: Math.ceil(box.height + 4) };
      const visible = PNG.sync.read(await page.screenshot({ clip, animations: 'disabled' }));
      await page.addStyleTag({ content: '#faq details p{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}' });
      const underlay = PNG.sync.read(await page.screenshot({ clip, animations: 'disabled' }));
      await page.evaluate(() => document.querySelectorAll('style').forEach((style) => { if (style.textContent.includes('#faq details p{color:transparent')) style.remove(); }));
      const fg = parse(style.color); const alpha = fg[3] * style.opacity; const samples = [];
      for (let i = 0; i < visible.data.length; i += 4) {
        const delta = Math.abs(visible.data[i] - underlay.data[i]) + Math.abs(visible.data[i + 1] - underlay.data[i + 1]) + Math.abs(visible.data[i + 2] - underlay.data[i + 2]);
        if (delta < 18) continue;
        const bg = [underlay.data[i], underlay.data[i + 1], underlay.data[i + 2]];
        const composite = [0, 1, 2].map((k) => fg[k] * alpha + bg[k] * (1 - alpha));
        samples.push(ratio(composite, bg));
      }
      rows.push({ index: index + 1, text: style.text, fontSize: '16px', minRatio: samples.length ? Number(Math.min(...samples).toFixed(2)) : null, threshold: 4.5, wcagAA: samples.length ? (Math.min(...samples) >= 4.5 ? 'PASS' : 'FAIL') : 'UNMEASURED', samples: samples.length });
      await detail.locator('summary').click();
    }
    output.viewports.push({ viewport: `${viewport.width}x${viewport.height}`, rows });
    await context.close();
  }
  await browser.close();
  fs.writeFileSync('qa/faq-contrast-results.json', JSON.stringify(output, null, 2));
  console.log(JSON.stringify(output, null, 2));
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
