const fs = require('node:fs');
const { chromium } = require('./.playwright-runtime/node_modules/playwright');
const { PNG } = require('./.playwright-runtime/node_modules/pngjs');

const base = 'http://127.0.0.1:8767/';
const scopes = [
  'header .brand-copy', 'header .site-nav', '#hero .hero-content', '#hero .scroll-cue',
  '#trailer-showcase .video-showcase-shell', '#gameplay .image-label', '#gameplay .world-copy',
  '#classes .section-heading', '#classes .class-detail', '#classes .gallery-note',
  '#activities .section-heading', '#activities .activity-grid', '#activities .activity-footnote',
  '#multiplayer .community-copy', '#multiplayer .community-caption', '#steam .steam-copy',
  '#steam .requirements', '#faq .faq-layout', '#final-cta .final-content', 'footer'
];
const viewports = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'mobile-390', width: 390, height: 844 }
];
const rgba = (value) => {
  const m = value.match(/rgba?\(([^)]+)\)/i);
  if (!m) throw new Error(`Unsupported computed color: ${value}`);
  const p = m[1].split(',').map((x) => Number.parseFloat(x.trim()));
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
};
const lum = (rgb) => {
  const c = rgb.map((v) => v / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (fg, bg) => {
  const a = lum(fg), b = lum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};
const hex = (c) => `#${c.map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
const cssPath = (el, stop) => {
  const parts = [];
  for (let p = el; p && p !== stop.parentElement; p = p.parentElement) {
    let part = p.tagName.toLowerCase();
    if (p.id) { part += `#${p.id}`; parts.unshift(part); break; }
    const classes = [...p.classList].filter(Boolean);
    if (classes.length) part += `.${classes.join('.')}`;
    if (!classes.length && !p.id) {
      const same = [...p.parentElement.children].filter((s) => s.tagName === p.tagName);
      if (same.length > 1) part += `:nth-of-type(${same.indexOf(p) + 1})`;
    }
    parts.unshift(part);
    if (p === stop) break;
  }
  return parts.join(' > ');
};

async function prepare(page) {
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(400, innerHeight * 0.7)) {
      window.scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(200);
}

async function collectTextNodes(page) {
  return page.evaluate((roots) => {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let textNode;
    while ((textNode = walk.nextNode())) {
      if (!textNode.nodeValue.trim()) continue;
      const parent = textNode.parentElement;
      if (parent.closest('[aria-hidden="true"],script,style,noscript')) continue;
      const root = roots.find((selector) => parent.closest(selector));
      if (!root) continue;
      const style = getComputedStyle(parent);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const ancestors = [];
      for (let p = parent; p; p = p.parentElement) ancestors.push(p);
      const opacity = ancestors.reduce((a, p) => a * Number.parseFloat(getComputedStyle(p).opacity || '1'), 1);
      const range = document.createRange();
      range.selectNodeContents(textNode);
      const rect = range.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const token = `contrast-${nodes.length + 1}`;
      const wrapper = document.createElement('span');
      wrapper.dataset.contrastSample = token;
      textNode.parentNode.insertBefore(wrapper, textNode);
      wrapper.appendChild(textNode);
      nodes.push({
        token, scope: root, selector: `${root} ${parent === document.querySelector(root) ? ':text' : parent.tagName.toLowerCase() + (parent.id ? `#${parent.id}` : [...parent.classList].map((c) => `.${c}`).join(''))}`,
        elementPath: (() => { const a=[]; for(let p=parent;p&&p!==document.body;p=p.parentElement){let s=p.tagName.toLowerCase();if(p.id){s+=`#${p.id}`;a.unshift(s);break}for(const c of p.classList)s+=`.${c}`;a.unshift(s);if(p.matches(root))break}return a.join(' > '); })(),
        text: textNode.nodeValue.trim(), foreground: style.color, fontSize: style.fontSize, fontWeight: style.fontWeight,
        opacity, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
      });
    }
    return nodes;
  }, scopes);
}

async function screenshotsFor(page, item) {
  const locator = page.locator(`[data-contrast-sample="${item.token}"]`);
  await locator.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
  await page.waitForTimeout(30);
  const rect = await locator.boundingBox();
  if (!rect) return null;
  const viewport = page.viewportSize();
  const x = Math.max(0, Math.floor(rect.x - 2));
  const y = Math.max(0, Math.floor(rect.y - 2));
  const width = Math.min(viewport.width - x, Math.max(1, Math.ceil(rect.width + 4)));
  const height = Math.min(viewport.height - y, Math.max(1, Math.ceil(rect.height + 4)));
  if (width <= 0 || height <= 0) return null;
  const clip = { x, y, width, height };
  await page.addStyleTag({ content: `*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}` });
  const underlay = await page.screenshot({ clip, animations: 'disabled' });
  await page.evaluate(() => document.querySelectorAll('style').forEach((s) => { if (s.textContent.includes('-webkit-text-fill-color:transparent!important')) s.remove(); }));
  await page.addStyleTag({ content: `html,body,*{background:transparent!important;background-color:transparent!important;background-image:none!important;border-color:transparent!important;box-shadow:none!important;filter:none!important;mix-blend-mode:normal!important;color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}html::before,body::before,*::before,*::after{background:transparent!important;background-image:none!important;border-color:transparent!important;box-shadow:none!important}img,picture,video,canvas{visibility:hidden!important}[data-contrast-sample="${item.token}"]{color:#ff00ff!important;-webkit-text-fill-color:#ff00ff!important;opacity:1!important;visibility:visible!important}` });
  const mask = await page.screenshot({ clip, omitBackground: true, animations: 'disabled' });
  await page.evaluate(() => document.querySelectorAll('style').forEach((s) => { if (s.textContent.includes('data-contrast-sample=') || s.textContent.includes('-webkit-text-fill-color:transparent!important')) s.remove(); }));
  return { underlay: PNG.sync.read(underlay), mask: PNG.sync.read(mask) };
}

function analyze(item, shots) {
  if (!shots) return { ...item, samples: 0, error: 'No visible screenshot region' };
  const { underlay, mask } = shots;
  const f = rgba(item.foreground);
  const samples = [];
  const len = Math.min(underlay.data.length, mask.data.length);
  for (let i = 0; i < len; i += 4) {
    const alpha = mask.data[i + 3];
    if (alpha < 72 || mask.data[i] < 180 || mask.data[i + 1] > 75 || mask.data[i + 2] < 180) continue;
    const bg = [underlay.data[i], underlay.data[i + 1], underlay.data[i + 2]];
    const effectiveAlpha = Math.max(0, Math.min(1, f[3] * item.opacity));
    const effectiveFg = [0, 1, 2].map((k) => f[k] * effectiveAlpha + bg[k] * (1 - effectiveAlpha));
    samples.push({ background: bg, contrast: ratio(effectiveFg, bg) });
  }
  if (!samples.length) return { ...item, samples: 0, error: 'No magenta glyph pixels found in mask' };
  const min = samples.reduce((a, b) => b.contrast < a.contrast ? b : a);
  const ratios = samples.map((s) => s.contrast).sort((a, b) => a - b);
  const size = Number.parseFloat(item.fontSize);
  const weight = Number.parseInt(item.fontWeight, 10) || 400;
  const threshold = size >= 24 || (size >= 18.67 && weight >= 700) ? 3 : 4.5;
  return {
    token: item.token, scope: item.scope, selector: item.elementPath, text: item.text,
    foreground: item.foreground, fontSize: item.fontSize, fontWeight: item.fontWeight,
    opacity: item.opacity, samples: samples.length,
    worstBackground: hex(min.background), minRatio: Number(min.contrast.toFixed(2)),
    medianRatio: Number(ratios[Math.floor(ratios.length / 2)].toFixed(2)),
    threshold, wcagAA: min.contrast >= threshold ? 'PASS' : 'FAIL'
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const output = { chromiumVersion: browser.version(), method: 'Chromium rendered screenshot. A text-only magenta mask locates glyph pixels; a matching screenshot with text hidden supplies the composited background RGB at each glyph sample. Foreground alpha and ancestor opacity are composited over each sampled background before WCAG luminance ratios are calculated.', viewports: [] };
  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await prepare(page);
    const nodes = await collectTextNodes(page);
    const rows = [];
    for (const item of nodes) {
      const shots = await screenshotsFor(page, item);
      rows.push(analyze(item, shots));
    }
    output.viewports.push({ name: vp.name, viewport: `${vp.width}x${vp.height}`, textFragments: nodes.length, results: rows });
    await context.close();
  }
  await browser.close();
  fs.writeFileSync('qa/typography-contrast-results.json', JSON.stringify(output, null, 2));
  console.log(JSON.stringify({ chromiumVersion: output.chromiumVersion, viewports: output.viewports.map((v) => ({ name: v.name, textFragments: v.textFragments, errors: v.results.filter((r) => r.error).map((r) => ({ token: r.token, text: r.text, error: r.error })), failures: v.results.filter((r) => r.wcagAA === 'FAIL') })) }, null, 2));
})().catch((err) => { console.error(err.stack || err); process.exitCode = 1; });
