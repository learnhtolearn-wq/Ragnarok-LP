const { chromium } = require('./.playwright-runtime/node_modules/playwright');

const base = 'http://127.0.0.1:8767/';
const steam = 'https://store.steampowered.com/app/4212480/Ragnarok_The_New_World/';
const viewports = [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-430', width: 430, height: 932 },
];
const results = { runtime: {}, links: {}, navigation: {}, faq: {}, accessibility: {}, viewports: [], consoleErrors: [], failedRequests: [], httpErrors: [] };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
let activeBrowser;

async function openPage(browser, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('console', (msg) => { if (msg.type() === 'error') results.consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => results.consoleErrors.push(err.message));
  page.on('requestfailed', (req) => results.failedRequests.push({ url: req.url(), error: req.failure()?.errorText }));
  page.on('response', (res) => { if (res.status() >= 400) results.httpErrors.push({ status: res.status(), url: res.url() }); });
  const response = await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  return { context, page, status: response.status() };
}

async function verifyPopup(context, page, link, label) {
  const href = await link.getAttribute('href');
  const target = await link.getAttribute('target');
  const rel = (await link.getAttribute('rel') || '').split(/\s+/);
  assert(href === steam, `${label}: unexpected href ${href}`);
  assert(target === '_blank', `${label}: external link does not open in a new tab`);
  assert(rel.includes('noopener'), `${label}: missing rel=noopener`);
  const newPage = context.waitForEvent('page');
  await link.click();
  const popup = await newPage;
  await popup.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
  assert(popup.url() === steam, `${label}: opened ${popup.url()}`);
  const openerIsNull = await popup.evaluate(() => window.opener === null);
  assert(openerIsNull, `${label}: new tab has a JavaScript window.opener`);
  await popup.close();
  return { label, href, target, rel: rel.join(' '), openedExactDestination: true, windowOpenerIsNull: openerIsNull };
}

(async () => {
  const browser = activeBrowser = await chromium.launch({ headless: true, channel: 'chrome' });
  results.runtime.playwrightVersion = require('./.playwright-runtime/node_modules/playwright/package.json').version;
  results.runtime.chromiumVersion = browser.version();
  results.runtime.baseUrl = base;
  results.runtime.steamStatus = null;

  const desktop = await openPage(browser, { width: 1440, height: 900 });
  assert(desktop.status === 200, `Page returned HTTP ${desktop.status}`);
  const desktopPage = desktop.page;
  await desktop.context.route('https://store.steampowered.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>CTA destination capture</title>' }));
  const ctaLinks = desktopPage.locator(`a[href="${steam}"]`);
  const ctaCount = await ctaLinks.count();
  results.links.steamCTAReferences = ctaCount;
  results.links.ctaClicks = [];
  for (let i = 0; i < ctaCount; i++) {
    const link = ctaLinks.nth(i);
    if (await link.isVisible()) results.links.ctaClicks.push(await verifyPopup(desktop.context, desktopPage, link, `desktop CTA ${i + 1}`));
  }

  const allAnchors = await desktopPage.locator('a[href]').evaluateAll((links) => links.map((a) => ({ href: a.href, target: a.target, rel: a.rel, text: a.innerText.trim() })));
  const internalLinks = allAnchors.filter((a) => { const u = new URL(a.href); return u.origin === new URL(base).origin && !!u.hash; });
  const badInternal = await desktopPage.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].filter((a) => !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map((a) => a.getAttribute('href')));
  assert(badInternal.length === 0, `Unresolved internal anchors: ${badInternal.join(', ')}`);
  const externalLinks = allAnchors.filter((a) => a.href.startsWith('http') && !a.href.startsWith(new URL(base).origin));
  const youtubeFallback = 'https://www.youtube.com/watch?v=KVHa83JkUV0';
  assert(externalLinks.every((a) => (a.href === steam || a.href === youtubeFallback) && a.target === '_blank' && /\bnoopener\b/.test(a.rel)), 'An external anchor has an unexpected URL or unsafe target settings');
  results.links.internalAnchorCount = internalLinks.length;
  results.links.allInternalAnchorsResolve = true;
  results.links.externalAnchors = externalLinks;
  results.links.allExternalAnchorsUseExpectedDestinationAndNoopener = true;
  const steamResponse = await desktop.context.request.get(steam, { timeout: 20000 }).catch((err) => ({ status: () => null, error: err.message }));
  results.links.externalSteamRequest = { status: steamResponse.status(), error: steamResponse.error || null };
  results.runtime.steamStatus = steamResponse.status();

  await desktopPage.goto(base, { waitUntil: 'networkidle' });
  results.navigation.desktopLinks = [];
  for (const id of ['gameplay', 'classes', 'activities', 'multiplayer']) {
    const link = desktopPage.locator(`.site-nav a[href="#${id}"]`);
    await link.click();
    const heading = desktopPage.locator(`#${id} h2`).first();
    const position = await heading.evaluate((el) => ({ top: el.getBoundingClientRect().top, headerBottom: document.querySelector('.site-header').getBoundingClientRect().bottom }));
    assert(new URL(desktopPage.url()).hash === `#${id}`, `Desktop navigation failed to reach #${id}`);
    assert(position.top >= position.headerBottom, `#${id} heading is obscured by the sticky header`);
    results.navigation.desktopLinks.push({ target: `#${id}`, hashCorrect: true, headingTop: Math.round(position.top), headerBottom: Math.round(position.headerBottom), headingClearOfHeader: true });
  }
  await desktopPage.goBack();
  const backHash = new URL(desktopPage.url()).hash;
  await desktopPage.goForward();
  const forwardHash = new URL(desktopPage.url()).hash;
  assert(backHash === '#activities' && forwardHash === '#multiplayer', `Back/forward hashes were ${backHash} and ${forwardHash}`);
  results.navigation.backForward = { backHash, forwardHash, passed: true };

  const mobile = await openPage(browser, { width: 390, height: 844 });
  const mobilePage = mobile.page;
  const toggle = mobilePage.locator('.nav-toggle');
  const nav = mobilePage.locator('#site-nav');
  assert(await toggle.getAttribute('aria-expanded') === 'false' && await nav.getAttribute('inert') !== null, 'Mobile navigation did not start closed and inert');
  await toggle.focus();
  await mobilePage.keyboard.press('Tab');
  const focusedInsideClosedNav = await mobilePage.evaluate(() => !!document.querySelector('#site-nav')?.contains(document.activeElement));
  assert(!focusedInsideClosedNav, 'A closed mobile navigation link received keyboard focus');
  await toggle.focus();
  await mobilePage.keyboard.press('Enter');
  assert(await toggle.getAttribute('aria-expanded') === 'true' && await nav.getAttribute('inert') === null, 'Enter did not open the mobile menu accessibly');
  await mobilePage.keyboard.press('Tab');
  const focusedInsideOpenNav = await mobilePage.evaluate(() => !!document.querySelector('#site-nav')?.contains(document.activeElement));
  assert(focusedInsideOpenNav, 'Open mobile navigation link was not keyboard reachable');
  await toggle.focus();
  await mobilePage.keyboard.press('Space');
  assert(await toggle.getAttribute('aria-expanded') === 'false' && await nav.getAttribute('inert') !== null, 'Space did not close the mobile menu accessibly');
  await toggle.click();
  assert(await toggle.getAttribute('aria-expanded') === 'true' && await nav.getAttribute('inert') === null, 'Click did not open the mobile menu');
  const mobileNavLink = nav.locator('a[href="#activities"]');
  await mobileNavLink.click();
  assert(new URL(mobilePage.url()).hash === '#activities', 'Mobile navigation did not reach Activities');
  assert(await toggle.getAttribute('aria-expanded') === 'false' && await nav.getAttribute('inert') !== null, 'Mobile menu did not close after following a link');
  const mobileHeadingPos = await mobilePage.locator('#activities h2').evaluate((el) => ({ top: el.getBoundingClientRect().top, headerBottom: document.querySelector('.site-header').getBoundingClientRect().bottom }));
  assert(mobileHeadingPos.top >= mobileHeadingPos.headerBottom, 'Mobile anchor heading is obscured by the sticky header');
  results.navigation.mobileMenu = { closedLinksNotFocusable: true, enterOpensAndUpdatesAriaAndInert: true, openLinkKeyboardReachable: true, spaceClosesAndUpdatesAriaAndInert: true, clickOpens: true, followingAnchorClosesMenu: true, activitiesHeadingTop: Math.round(mobileHeadingPos.top), headerBottom: Math.round(mobileHeadingPos.headerBottom), anchorClearOfHeader: true };
  const mobileCta = mobilePage.locator('.mobile-cta');
  results.links.ctaClicks.push(await verifyPopup(mobile.context, mobilePage, mobileCta, 'mobile fixed CTA'));
  const mobileNavCta = nav.locator(`a[href="${steam}"]`);
  await toggle.click();
  results.links.ctaClicks.push(await verifyPopup(mobile.context, mobilePage, mobileNavCta, 'mobile navigation CTA'));

  await mobilePage.goto(base, { waitUntil: 'networkidle' });
  const details = mobilePage.locator('details');
  const faqCount = await details.count();
  results.faq.questions = [];
  for (let i = 0; i < faqCount; i++) {
    const item = details.nth(i);
    const summary = item.locator('summary');
    const answer = item.locator('p');
    await summary.focus();
    if (await item.getAttribute('open') !== null) await mobilePage.keyboard.press('Space');
    assert(await item.getAttribute('open') === null, `FAQ ${i + 1} did not close from keyboard`);
    await mobilePage.keyboard.press('Space');
    assert(await item.getAttribute('open') !== null && await answer.isVisible(), `FAQ ${i + 1} did not open from keyboard`);
    const answerLayout = await answer.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const clipped = [...function* (node) { for (let p = node.parentElement; p; p = p.parentElement) yield p; }(el)].some((p) => {
        const s = getComputedStyle(p), pr = p.getBoundingClientRect();
        return /(hidden|clip|scroll)/.test(`${s.overflow} ${s.overflowY}`) && (r.bottom > pr.bottom + 1 || r.top < pr.top - 1);
      });
      return { text: el.innerText, height: r.height, clipped };
    });
    assert(!answerLayout.clipped && answerLayout.height > 0, `FAQ ${i + 1} answer is clipped or hidden`);
    await mobilePage.keyboard.press('Space');
    assert(await item.getAttribute('open') === null, `FAQ ${i + 1} did not close from keyboard`);
    results.faq.questions.push({ question: await summary.innerText(), openedWithSpace: true, closedWithSpace: true, answerVisibleAndUnclipped: true });
  }
  results.faq.allFourToggleByKeyboard = faqCount === 4;
  assert(faqCount === 4, `Expected four FAQ questions, found ${faqCount}`);

  await mobilePage.goto(base, { waitUntil: 'networkidle' });
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.keyboard.press('Tab');
  const firstFocus = await mobilePage.evaluate(() => ({ tag: document.activeElement.tagName, text: document.activeElement.innerText, outlineStyle: getComputedStyle(document.activeElement).outlineStyle, outlineWidth: getComputedStyle(document.activeElement).outlineWidth, visible: !!(document.activeElement.offsetWidth || document.activeElement.offsetHeight) }));
  assert(firstFocus.text.includes('Skip to content') && firstFocus.visible, 'Keyboard navigation did not focus the visible skip link first');
  await mobilePage.keyboard.press('Tab');
  const secondFocus = await mobilePage.evaluate(() => ({ tag: document.activeElement.tagName, outlineStyle: getComputedStyle(document.activeElement).outlineStyle, outlineWidth: getComputedStyle(document.activeElement).outlineWidth }));
  assert(secondFocus.outlineStyle !== 'none' && parseFloat(secondFocus.outlineWidth) >= 2, 'Keyboard focus indicator is missing or too thin');
  const altAudit = await mobilePage.locator('img').evaluateAll((imgs) => imgs.map((img) => ({ src: img.getAttribute('src'), hasAlt: img.hasAttribute('alt'), alt: img.getAttribute('alt'), decorativeContext: !!img.closest('[aria-hidden="true"]') })));
  const badAlt = altAudit.filter((img) => !img.hasAlt || (img.alt === '' && !img.decorativeContext));
  assert(badAlt.length === 0, `Images have missing or inappropriate empty alt text: ${JSON.stringify(badAlt)}`);
  const brandSnapshot = await mobilePage.locator('.brand').ariaSnapshot();
  const brandByVisibleName = await mobilePage.getByRole('link', { name: 'Ragnarok The New World', exact: true }).count();
  assert(brandByVisibleName === 1, `Brand accessible name did not match its visible text: ${brandSnapshot}`);
  const heroMetaLabel = await mobilePage.locator('.hero-meta').getAttribute('aria-label');
  const requirementsGroup = mobilePage.getByRole('group', { name: 'Steam system requirements', exact: true });
  const requirementsGroupCount = await requirementsGroup.count();
  assert(heroMetaLabel === null, 'The generic hero metadata div still has an unsupported aria-label');
  assert(requirementsGroupCount === 1, 'The requirements panel is not exposed as a named group');
  const reducedMotion = await mobilePage.evaluate(() => ({ matches: matchMedia('(prefers-reduced-motion: reduce)').matches, scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior, revealTransition: getComputedStyle(document.querySelector('[data-reveal]')).transitionDuration }));
  assert(reducedMotion.matches && reducedMotion.scrollBehavior === 'auto' && reducedMotion.revealTransition.split(',').every((v) => parseFloat(v) <= 0.0001), 'Reduced-motion styles did not suppress scrolling and transitions');
  results.accessibility.keyboard = { firstFocus: firstFocus.text, skipLinkVisible: firstFocus.visible, secondFocusOutline: secondFocus, passed: true };
  results.accessibility.imageAlt = { imageCount: altAudit.length, missingOrInappropriateAltCount: badAlt.length, images: altAudit };
  results.accessibility.brandLink = { ariaSnapshot: brandSnapshot, expectedAccessibleName: 'Ragnarok The New World', exactNameMatchCount: brandByVisibleName, passed: true };
  results.accessibility.ariaSemantics = { heroMetaLabel: heroMetaLabel || null, requirementsRole: 'group', requirementsAccessibleName: 'Steam system requirements', passed: true };
  results.accessibility.reducedMotion = reducedMotion;
  results.accessibility.automatedScan = 'axe-core 4.14.0 was run separately at desktop and mobile viewports. See qa/axe-accessibility.json.';

  const overflowResults = [];
  for (const vp of viewports) {
    await mobilePage.goto(base, { waitUntil: 'networkidle' });
    await mobilePage.setViewportSize({ width: vp.width, height: vp.height });
    await mobilePage.evaluate(async () => Promise.all([...document.images].map((img) => img.decode().catch(() => {}))));
    const dimensions = await mobilePage.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    const passed = dimensions.document <= dimensions.viewport && dimensions.body <= dimensions.viewport;
    assert(passed, `Horizontal overflow at ${vp.name}: ${JSON.stringify(dimensions)}`);
    overflowResults.push({ name: vp.name, ...dimensions, passed });
  }
  results.viewports = overflowResults;
  const favicon = await mobile.context.request.get(`${base}favicon.ico`).catch((err) => ({ status: () => null, error: err.message }));
  results.links.faviconStatus = favicon.status();
  results.links.faviconContentType = favicon.headers?.()['content-type'] || null;
  results.links.faviconError = favicon.error || null;
  assert(favicon.status() === 200, `Expected favicon HTTP 200, got ${favicon.status()}`);
  const svgFavicon = await mobile.context.request.get(`${base}assets/logos/favicon.svg`);
  results.links.svgFaviconStatus = svgFavicon.status();
  assert(svgFavicon.status() === 200, `SVG favicon returned HTTP ${svgFavicon.status()}`);

  await mobile.context.close();
  await desktop.context.close();
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})().catch(async (err) => { console.error(err.stack || err); await activeBrowser?.close().catch(() => {}); process.exitCode = 1; });
