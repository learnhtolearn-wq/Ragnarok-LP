const fs = require('node:fs');
const { chromium } = require('./.playwright-runtime/node_modules/playwright');
const AxeBuilder = require('./.playwright-runtime/node_modules/@axe-core/playwright').default;

const base = 'http://127.0.0.1:8767/';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const results = { axeCoreVersion: require('./.playwright-runtime/node_modules/axe-core/package.json').version, browserVersion: browser.version(), scans: [] };
  for (const viewport of [{ name: 'desktop-1440', width: 1440, height: 900 }, { name: 'mobile-390', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const response = await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    results.scans.push({ viewport: `${viewport.width}x${viewport.height}`, httpStatus: response.status(), passes: audit.passes.length, violations: audit.violations.map(({ id, impact, help, helpUrl, nodes }) => ({ id, impact, help, helpUrl, nodes: nodes.map((node) => ({ target: node.target, html: node.html, summary: node.failureSummary })) })), incomplete: audit.incomplete.map(({ id, impact, help, nodes }) => ({ id, impact, help, nodes: nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) })) });
    await context.close();
  }
  await browser.close();
  fs.writeFileSync('qa/axe-accessibility.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
})().catch((err) => { console.error(err.stack || err); process.exitCode = 1; });
