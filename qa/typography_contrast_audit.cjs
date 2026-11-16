const fs = require('node:fs');
const { PNG } = require('./.playwright-runtime/node_modules/pngjs');
const { chromium } = require('./.playwright-runtime/node_modules/playwright');

const base = 'http://127.0.0.1:8767/';
const targets = [
  ['Header navigation', 'header .site-nav'],
  ['Hero eyebrow', '#hero .eyebrow'],
  ['Hero body', '#hero .hero-lede'],
  ['Hero metadata', '#hero .hero-meta'],
  ['Video subtitle', '#trailer-showcase .video-subtitle'],
  ['World eyebrow', '#gameplay .eyebrow'],
  ['World body', '#gameplay .world-copy > p:not(.eyebrow)'],
  ['World label', '#gameplay .image-label'],
  ['Classes intro', '#classes .section-intro'],
  ['Class body', '#classes .class-detail > p:not(.fine-print)'],
  ['Class fine print', '#classes .fine-print'],
  ['Activities eyebrow', '#activities .eyebrow'],
  ['Activities intro', '#activities .section-intro'],
  ['Activity card body', '#activities .card-content p'],
  ['Activities footnote', '#activities .activity-footnote'],
  ['Multiplayer body', '#multiplayer .community-copy > p:not(.eyebrow)'],
  ['Multiplayer caption', '#multiplayer .community-caption'],
  ['Steam body', '#steam .steam-copy > p:not(.eyebrow)'],
  ['Requirements kicker', '#steam .requirements-kicker'],
  ['Requirements rows', '#steam .requirement-row'],
  ['Requirements fine print', '#steam .requirements .fine-print'],
  ['FAQ intro', '#faq .faq-intro'],
  ['FAQ answers', '#faq details p'],
  ['Footer', 'footer'],
];
const viewports = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'mobile-390', width: 390, height: 844 },
];

const parseColor = (value) => {
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match) throw new Error(`Unsupported color: ${value}`);
  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
  return [parts[0], parts[1], parts[2], parts[3] ?? 1];
};
const luminance = (rgb) => {
  const linear = rgb.map((value) => value / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};
const contrast = (foreground, background) => {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};
const hex = (rgb) => `#${rgb.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;

async function settle(page) {
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('details').evaluateAll((details) => details.forEach((detail) => { detail.open = true; }));
  if ((page.viewportSize()?.width || 0) <= 850) await page.getByRole('button', { name: /toggle navigation/i }).click();
  await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((image) => { image.loading = 'eager'; }));
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
  });
  await page.waitForTimeout(200);
}

async function auditViewport(browser, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await settle(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  const elements = await page.evaluate((targetList) => targetList.flatMap(([label, selector]) => [...document.querySelectorAll(selector)].map((element, index) => {
    const style = getComputedStyle(element);
    const ancestors = [];
    for (let current = element; current; current = current.parentElement) ancestors.push(Number.parseFloat(getComputedStyle(current).opacity || '1'));
    const rect = element.getBoundingClientRect();
    return { label, selector, index, text: element.innerText?.trim(), foreground: style.color, fontSize: style.fontSize, fontWeight: style.fontWeight, opacity: ancestors.reduce((a, value) => a * value, 1), rect: { x: rect.x + scrollX, y: rect.y + scrollY, width: rect.width, height: rect.height } };
  })), targets);

  const visible = PNG.sync.read(await page.screenshot({ fullPage: true, animations: 'disabled' }));
  await page.addStyleTag({ content: '*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}' });
  const underlay = PNG.sync.read(await page.screenshot({ fullPage: true, animations: 'disabled' }));
  const results = elements.map((element) => {
    const fg = parseColor(element.foreground);
    const alpha = Math.max(0, Math.min(1, fg[3] * element.opacity));
    const effective = [0, 1, 2].map((index) => fg[index] * alpha);
    const x0 = Math.max(0, Math.floor(element.rect.x));
    const y0 = Math.max(0, Math.floor(element.rect.y));
    const x1 = Math.min(visible.width, Math.ceil(element.rect.x + element.rect.width));
    const y1 = Math.min(visible.height, Math.ceil(element.rect.y + element.rect.height));
    const samples = [];
    for (let y = y0; y < y1; y += 1) for (let x = x0; x < x1; x += 1) {
      const offset = (y * visible.width + x) * 4;
      const delta = Math.abs(visible.data[offset] - underlay.data[offset]) + Math.abs(visible.data[offset + 1] - underlay.data[offset + 1]) + Math.abs(visible.data[offset + 2] - underlay.data[offset + 2]);
      if (delta < 18) continue;
      const background = [underlay.data[offset], underlay.data[offset + 1], underlay.data[offset + 2]];
      const compositeForeground = [0, 1, 2].map((index) => effective[index] + background[index] * (1 - alpha));
      samples.push({ background, ratio: contrast(compositeForeground, background) });
    }
    const sorted = samples.sort((a, b) => a.ratio - b.ratio);
    const size = Number.parseFloat(element.fontSize);
    const weight = Number.parseInt(element.fontWeight, 10) || 400;
    const threshold = size >= 24 || (size >= 18.67 && weight >= 700) ? 3 : 4.5;
    const worst = sorted[0];
    return { ...element, samples: samples.length, worstBackground: worst ? hex(worst.background) : null, minRatio: worst ? Number(worst.ratio.toFixed(2)) : null, threshold, wcagAA: worst ? (worst.ratio >= threshold ? 'PASS' : 'FAIL') : 'UNMEASURED' };
  });
  await context.close();
  return { viewport: `${viewport.width}x${viewport.height}`, elements: results };
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const output = { browser: browser.version(), method: 'Paired Chromium full-page screenshots. Text is hidden for the background capture. Changed pixels identify rendered glyph locations, then WCAG ratios are calculated from the sampled composited background.', viewports: [] };
  for (const viewport of viewports) output.viewports.push(await auditViewport(browser, viewport));
  await browser.close();
  fs.writeFileSync('qa/typography-contrast-results.json', JSON.stringify(output, null, 2));
  console.log(JSON.stringify(output.viewports.map((viewport) => ({ viewport: viewport.viewport, measured: viewport.elements.length, failures: viewport.elements.filter((element) => element.wcagAA === 'FAIL'), unmeasured: viewport.elements.filter((element) => element.wcagAA === 'UNMEASURED') })), null, 2));
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
