# Phase 4 QA report

Project: Ragnarok: The New World TAF2  
Project root: `C:\Users\PC\Downloads\Antigravity_Projects\Ragnarok_TAF2`  
Date: 2026-11-15  
Browser: Playwright 1.65.1 with Google Chrome 157.0.8103.52

## Brand accessible-name correction

The prior axe-core JSON identifies the exact failing node as `a.brand`, an anchor in the site header with `href="#hero"`. It contains the star emblem and visible text, “Ragnarok The New World”. It is the brand home link, not one of the primary navigation links.

Before: the anchor had `aria-label="Ragnarok: The New World home"`. That explicit label replaced the link's visible text as its accessible name. axe-core reported a serious `label-content-name-mismatch` because the visible brand text was not included exactly in the accessible name.

After: removed only the anchor's `aria-label`. Playwright's accessibility snapshot now reports `link "Ragnarok The New World"` with destination `#hero`. This matches the visible text. The icon, visual wordmark, and navigation were unchanged.

Before evidence: `qa/axe-accessibility-before.json`. After evidence: `qa/axe-accessibility.json`.

## axe-core results

axe-core 4.14.0 ran in Chromium at desktop 1440 × 900 and mobile 390 × 844.

| Viewport | Before violations | After violations | After passed rules | Result |
| --- | --- | --- | ---: | --- |
| Desktop, 1440 × 900 | 1 serious brand name mismatch | 0 | 19 | PASS |
| Mobile, 390 × 844 | 1 serious brand name mismatch | 0 | 20 | PASS |

The accessible name check now passes at both viewport sizes.

## Image and gradient contrast investigation

axe-core did not confirm contrast failures in these areas. It returned incomplete checks because it could not determine the text background through gradients, images, or overlapping elements. These are not passing contrast results.

| Viewport | Incomplete color contrast nodes | axe explanation |
| --- | ---: | --- |
| Desktop, 1440 × 900 | 37 | Background could not be determined due to gradients, images, overlaps, or non-text glyphs. |
| Mobile, 390 × 844 | 32 | Background could not be determined due to gradients, images, overlaps, or non-text glyphs. |

Affected areas include the brand and navigation over the hero image, hero text over its gradient, activity card text over image gradients, the World image label, Multiplayer text over its image background, the caption and outline button where axe detected overlap, and final CTA text over its gradient. The exact affected selectors and axe explanations are in `qa/axe-accessibility.json`.

These image and gradient combinations remain unverified for WCAG contrast. The earlier approved ratios in `CONTRAST_AUDIT.md` apply to the measured solid color combinations only. No pass or fail claim is made for the image and gradient cases. axe also marked two ARIA checks incomplete for `.hero-meta` and `.requirements`; it did not report these as confirmed violations.

## Lighthouse results

Lighthouse 13.6.0 ran before and after the name correction. Categories are Performance, Accessibility, Best Practices, and SEO.

| Run | Desktop | Mobile |
| --- | --- | --- |
| Before correction | 99 / 100 / 100 / 100 | 76 / 100 / 100 / 100 |
| After correction, first run | 97 / 100 / 100 / 100 | 78 / 100 / 100 / 100 |
| After correction, confirmation run | 99 / 100 / 100 / 100 | 77 / 100 / 100 / 100 |

The accessibility, Best Practices, and SEO scores remained 100. Performance varied between repeat runs, with a 97 to 99 desktop range and a 77 to 78 mobile range after the correction. The second post-correction run returned to the prior desktop score. The correction only removed one accessible-name attribute and made no visual or layout changes.

Reports:

- Before correction: `qa/lighthouse-desktop.report.html`, `qa/lighthouse-desktop.report.json`, `qa/lighthouse-mobile.report.html`, `qa/lighthouse-mobile.report.json`.
- After correction: `qa/lighthouse-desktop-after-brand-fix.report.html`, `qa/lighthouse-desktop-after-brand-fix.report.json`, `qa/lighthouse-mobile-after-brand-fix.report.html`, `qa/lighthouse-mobile-after-brand-fix.report.json`.
- Confirmation runs: `qa/lighthouse-desktop-confirmation.report.json`, `qa/lighthouse-mobile-confirmation.report.json`.

## Functional regression checks

The Playwright functional suite was rerun after the brand change. It passed. The exact Steam destination remained correct, all internal anchors resolved, desktop and mobile navigation and FAQ keyboard interactions passed, and no overflow appeared at 1920 × 1080, 1440 × 900, 390 × 844, or 430 × 932. The brand link's accessible name matched `Ragnarok The New World` exactly.

The favicon remained available at HTTP 200 with `image/x-icon`. The SVG favicon returned HTTP 200. The run recorded no console errors, failed network requests, or other HTTP errors. The independent Steam request returned HTTP 200.

Functional evidence: `qa/phase4_functional_qa.cjs`.

## Remaining findings

- Image and gradient contrast remains unverified because axe-core could not determine the backgrounds. Do not treat these checks as passing.
- The two ARIA checks noted above remain axe incomplete items, not confirmed violations.

Only the `.brand` accessible-name implementation was changed in this pass. No design or visible copy changed. The site remains unpublished, and AFBooster has not been configured.

## Final accessibility review

Date: 2026-11-15. This section records the follow-up after the contrast and ARIA review above and supersedes its earlier statement that image and gradient contrast remained entirely unverified.

### ARIA review

- `.hero-meta` had `aria-label="Game details"` on a generic `div`. The label was unnecessary because its metadata is already visible and readable in sequence. The unsupported, redundant attribute was removed.
- `.requirements` uses `aria-labelledby="requirements-title"`. The referenced visible label, “Steam system requirements”, appropriately names this set of requirements. The container now has `role="group"`, so it is exposed as a named group.
- axe-core no longer reports the two incomplete ARIA checks for these elements.

### axe-core after ARIA and contrast corrections

axe-core 4.14.0 ran in Chrome 157.0.8103.52 using Playwright 1.65.1.

| Viewport | Passed rules | Violations | Incomplete checks |
| --- | ---: | ---: | --- |
| Desktop, 1440 × 900 | 22 | 0 | Color contrast: 37 nodes |
| Mobile, 390 × 844 | 23 | 0 | Color contrast: 32 nodes |

The contrast items remain **incomplete**, not axe passes. axe could not calculate the backgrounds containing gradients, imagery, overlap, and image-only marks. A separate rendered-pixel audit was performed for the requested hero, activity cards, World image label, Multiplayer background, and final CTA regions. Its measured ratios, effective sampled backgrounds, method, and limitations are recorded in [ACCESSIBILITY_CONTRAST_AUDIT.md](ACCESSIBILITY_CONTRAST_AUDIT.md). All sampled text combinations in those regions meet the applicable WCAG AA text threshold after the documented CSS corrections.

### Functional regression after corrections

Playwright functional checks ran against the local HTTP server in Chrome 157.0.8103.52. All checks passed:

- All seven visible desktop/mobile Steam CTA instances opened the exact Steam destination in a new tab with `noopener`; the direct Steam request returned HTTP 200.
- All seven internal anchors resolved. Desktop and mobile navigation reached their sections below the fixed header. Browser back and forward restored the expected anchor locations.
- The closed mobile menu was inert and its links could not receive keyboard focus. Enter, Space, and click opened or closed it while `aria-expanded` and `inert` updated. Following a menu link closed the menu.
- All four FAQ disclosures opened and closed with the keyboard, and their answers were visible and unclipped.
- Keyboard skip link and visible focus passed. All eight images had appropriate alternative text or were correctly marked decorative. Reduced-motion settings suppressed reveal transitions and smooth scrolling.
- No horizontal overflow at 1920 × 1080, 1440 × 900, 390 × 844, or 430 × 932.
- Favicon endpoints returned HTTP 200. No console errors, failed requests, or HTTP errors were recorded by the test run.

Evidence: `qa/phase4_functional_qa.cjs`, `qa/axe-accessibility.json`, and `qa/dynamic-contrast-samples.json`.

### Contrast screenshots

Before: [desktop](qa/screenshots/contrast-before-desktop.png), [mobile](qa/screenshots/contrast-before-mobile.png).  
After: [desktop](qa/screenshots/contrast-after-desktop.png), [mobile](qa/screenshots/contrast-after-mobile.png).

The contrast corrections adjust overlays and a small label backing only. The site remains unpublished, and AFBooster has not been configured.

## Official overall gameplay trailer showcase QA

Date: 2026-11-15. This section records the later trailer integration and supersedes earlier statements that fresh screenshots or Lighthouse checks could not be completed.

### Source and guide review

- Selected video: [Ragnarok: The New World｜First Global Full Gameplay Trailer Released](https://www.youtube.com/watch?v=KVHa83JkUV0), ID `KVHa83JkUV0`.
- The source page identifies the publisher as Ragnarok: The New World. Gravity's official launch announcement links that YouTube channel: https://www.globenewswire.com/news-release/2026/07/16/3328291/0/en/Ragnarok-The-New-World-Officially-Launched-in-Southeast-Asia-on-July-16-2026.html.
- The video was opened and played for inspection. The inspected footage shows gameplay scenes with traversal, environment, multiple characters, and HUD. No additional feature claim is inferred from this viewing.
- `TAF-1-2-Guides.md` was read. The exact Steam destination, asset organization, media optimization, reserved video sizing, accessibility, mobile testing, and Lighthouse guidance were checked for consistency. No separate original TAF2 brief was found in the supplied project files.
- Rights remain unverified. YouTube availability and embed functionality do not grant commercial reuse rights. The poster is served remotely and is not downloaded or rehosted.

### Browser and interaction results

Playwright 1.65.1 with Chromium 157.0.8103.52 tested the local page at all four approved viewports. The local response was HTTP 200 at each size.

| Check | Result |
| --- | --- |
| Showcase order | PASS. After Hero and before Gameplay & World. The original eight primary sections remain present. |
| Layout | PASS. Responsive frame measured 16:9 at all four viewports. |
| Deferred loading | PASS. No iframe or YouTube player request before activation. |
| Keyboard activation | PASS. Focused play button activated the iframe with Enter. |
| Embedded player | PASS. Uses `www.youtube-nocookie.com`, selected video ID, and a descriptive iframe title. Autoplay parameter appears only after the explicit play-button action. |
| Fallback | PASS. “Watch on YouTube” opened the exact watch URL in a new tab with `noopener`. |
| Steam CTA links | PASS. All checked Steam links retain `https://store.steampowered.com/app/4212480/Ragnarok_The_New_World/`. |
| Poster | PASS. Remote poster returned HTTP 200 in tested runs. |
| Browser console and page errors | PASS. No console errors or uncaught page errors in these runs. |
| HTTP error responses | PASS. No HTTP status 400 or higher in recorded page/player responses. |
| Failed network requests | NOTE. One nonessential YouTube image request aborted in each viewport run (`i.ytimg.com` at 1920 × 1080; `yt3.ggpht.com` at the other sizes). The poster, iframe, and video stream returned successful responses. |

Evidence JSON: `qa/video-showcase-test-results.json`.

### axe-core results

axe-core 4.14.0 ran before player activation and after playback activation at all four viewports.

| Viewport | Host page before player | Host page after player, excluding third-party iframe | Full scan after player |
| --- | --- | --- | --- |
| 1920 × 1080 | 0 violations | 0 violations | 2 iframe violations: `aria-allowed-attr` and `aria-prohibited-attr`. |
| 1440 × 900 | 0 violations | 0 violations | 2 iframe violations: `aria-allowed-attr` and `aria-prohibited-attr`. |
| 430 × 932 | 0 violations | 0 violations | 2 iframe violations: `aria-allowed-attr` and `aria-prohibited-attr`. |
| 390 × 844 | 0 violations | 0 violations | 2 iframe violations: `aria-allowed-attr` and `aria-prohibited-attr`. |

The violations are inside YouTube's cross-origin player UI, not the local document. The first concerns YouTube's `aria-level` on a non-heading link. The second concerns `aria-label` on its player `div` without a valid role. The complete embedded experience therefore does not have a zero-violation axe result. The local host page had zero detected violations in both before-play and after-play scans that excluded the external iframe.

axe also returned incomplete checks. These are unresolved automated checks, not passes. Counts by viewport before/after activation were: 42/45 at 1920 × 1080, 42/59 at 1440 × 900, 37/53 at 430 × 932, and 37/55 at 390 × 844. This count includes checks beyond contrast. Existing image and gradient contrast limitations remain as documented in the final accessibility review above and `ACCESSIBILITY_CONTRAST_AUDIT.md`.

The activated player was confirmed to render and play before each player screenshot: decoded video `readyState` 4, `paused` false, and `currentTime` above 0.5 seconds. The observed decoded resolution varied by run from 640 × 360 to 854 × 480. The QA harness now waits for this playback state instead of treating iframe insertion alone as successful playback.

### Lighthouse

Lighthouse 13.6.0 ran after the final CSS change. Scores are actual category scores in the order Performance, Accessibility, Best Practices, SEO.

| Mode | Scores | Previous mobile baseline comparison |
| --- | --- | --- |
| Desktop | 100 / 100 / 100 / 100 | Not applicable |
| Mobile | 99 / 100 / 100 / 100 | Previous measured mobile Performance varied between 77 and 78. Current result is 21 to 22 points higher than that range. |

Reports: `qa/lighthouse-video-desktop.report.json` and `qa/lighthouse-video-mobile.report.json`. The comparison is between local Lighthouse lab runs, not field data.

### Screenshots

Each viewport has a full-page facade screenshot, a viewport screenshot of the showcase, and a viewport screenshot with the player activated:

- Desktop 1920 × 1080: `qa/screenshots/video-showcase-desktop-1920.png`, `qa/screenshots/video-block-desktop-1920.png`, `qa/screenshots/video-player-desktop-1920.png`.
- Desktop 1440 × 900: `qa/screenshots/video-showcase-desktop-1440.png`, `qa/screenshots/video-block-desktop-1440.png`, `qa/screenshots/video-player-desktop-1440.png`.
- Mobile 430 × 932: `qa/screenshots/video-showcase-mobile-430.png`, `qa/screenshots/video-block-mobile-430.png`, `qa/screenshots/video-player-mobile-430.png`.
- Mobile 390 × 844: `qa/screenshots/video-showcase-mobile-390.png`, `qa/screenshots/video-block-mobile-390.png`, `qa/screenshots/video-player-mobile-390.png`.

Screenshots were captured at device scale factor 1 after fonts and images settled, with animations disabled. No browser extension or debugging overlay was used.

The addition remains a local development change. The site is not published, AFBooster is not configured, and video/poster commercial rights are not cleared.

## YouTube Error 153 and referrer verification

Date: 2026-11-15.

### Finding

The screenshot was opened through `file://C:/Users/PC/Downloads/Antigravity_Projects/Ragnarok_TAF2/index.html`. Chromium sent no `Referer` header for the YouTube iframe request from that origin, and the player did not reach the tested playable state. This is the observed cause of Error 153 in the screenshot context.

### Correction

The dynamic iframe creation in `script.js` now sets:

```js
player.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
player.referrerPolicy = 'strict-origin-when-cross-origin';
```

The selected video ID, click-to-load flow, 16:9 layout, `youtube-nocookie.com` host, and YouTube fallback are unchanged. No `noreferrer` was added. No fake Referer or origin was used.

`index.html` and the project configuration were inspected. No `no-referrer`, `same-origin`, `noreferrer`, Content Security Policy, or equivalent referrer suppression was present.

### Actual browser results

Chromium 157.0.8103.52 tested a local HTTP server at `http://127.0.0.1:8767/`.

| Context | Viewport | Iframe Referer header | Iframe attribute | Playback |
| --- | --- | --- | --- | --- |
| Local HTTP | 1440 × 900 | `http://127.0.0.1:8767/` | `strict-origin-when-cross-origin` | PASS. `readyState` 4, playing, current time above 0.5 seconds. |
| Local HTTP | 390 × 844 | `http://127.0.0.1:8767/` | `strict-origin-when-cross-origin` | PASS. `readyState` 4, playing, current time above 0.5 seconds. |
| Direct file | 1440 × 900 | No Referer header | `strict-origin-when-cross-origin` | FAIL. Player did not reach the tested playable state within 20 seconds. |

The local HTTP page and poster returned HTTP 200. The player request used `https://www.youtube-nocookie.com/embed/KVHa83JkUV0?autoplay=1&playsinline=1&rel=0`. Evidence is in `qa/youtube-referer-probe.json`.

No HTTPS-hosted version was available to test. Production HTTPS playback remains unverified until the page has an actual HTTPS URL. The site remains unpublished and AFBooster is not configured.

## Private browsing verification

Date: 2026-11-15. A fresh Chromium browser was used with isolated Playwright contexts, equivalent to private or incognito browsing because no persistent profile, cookies, localStorage, or sessionStorage was supplied.

| Viewport | Page | Player | Referer | Storage | Console | Failed requests |
| --- | --- | --- | --- | --- | --- | --- |
| 1440 × 900 | HTTP 200 | Played, `readyState` 4, active playback | `http://127.0.0.1:8767/` | Empty | No errors | External YouTube avatar request aborted |
| 390 × 844 | HTTP 200 | Played, `readyState` 4, active playback | `http://127.0.0.1:8767/` | Empty | No errors | External YouTube avatar request aborted |

The local stylesheet, deferred script, hero image, trailer poster, iframe, fallback flow, and video ID were checked in both contexts. Evidence: `qa/private-context-qa.json` and `qa/private_context_qa.cjs`.

## Evidence inventory verification

The four required viewport sets are present and referenced above. Each set contains a full-page facade screenshot, a showcase viewport screenshot, and an activated-player screenshot:

- `qa/screenshots/video-showcase-desktop-1920.png`
- `qa/screenshots/video-block-desktop-1920.png`
- `qa/screenshots/video-player-desktop-1920.png`
- `qa/screenshots/video-showcase-desktop-1440.png`
- `qa/screenshots/video-block-desktop-1440.png`
- `qa/screenshots/video-player-desktop-1440.png`
- `qa/screenshots/video-showcase-mobile-430.png`
- `qa/screenshots/video-block-mobile-430.png`
- `qa/screenshots/video-player-mobile-430.png`
- `qa/screenshots/video-showcase-mobile-390.png`
- `qa/screenshots/video-block-mobile-390.png`
- `qa/screenshots/video-player-mobile-390.png`

The referenced Lighthouse reports are present:

- `qa/lighthouse-video-desktop.report.json`: 100 / 100 / 100 / 100.
- `qa/lighthouse-video-mobile.report.json`: 99 / 100 / 100 / 100.

The report paths and scores were checked against the files on disk. The eventual hosted-page compression check and HTTPS playback check remain outstanding.

## Typography and readability correction pass

Date: 2026-11-15. The pass addressed the supplied screenshots showing an obscured hero eyebrow, small metadata, and low-comfort body copy in the Activities section.

### Implemented changes

- Base body text increased from 15px to 16px.
- Main body paragraphs increased to 17px on desktop, with 16px minimum on mobile.
- Meaningful eyebrows, labels, metadata, fine print, footer text, and card descriptions increased to at least 12px.
- Small-text letter spacing reduced and body line-height kept around 1.5 to 1.6.
- Hero eyebrow changed to warm ivory and hero content moved below the fixed header overlap.
- No approved copy, architecture, imagery, YouTube implementation, Steam CTA, or section order changed.

### Contrast audit

Rendered-pixel contrast checks ran in Chromium 157.0.8103.52 at 1440 × 900 and 390 × 844. The grouped audit measured 31 text elements at each viewport. No measured group failed WCAG AA. The lowest measured result was the Activities eyebrow at 4.66:1. The Activities supporting paragraph measured 5.65:1 at both sizes. The hero eyebrow measured 13.02:1 desktop and 9.95:1 mobile. Activity card descriptions measured 9.48:1 minimum desktop and 8.37:1 minimum mobile.

All four FAQ answers were measured separately with each disclosure open. Each returned 9.35:1 and passed the 4.5:1 threshold.

Raw outputs: `qa/typography-contrast-results.json` and `qa/faq-contrast-results.json`. Method and category details: `TYPOGRAPHY_READABILITY_AUDIT.md`. axe-core still reports incomplete image and gradient contrast checks. Those are recorded as incomplete, not passes.

### Fresh visual and layout checks

Fresh full-page and focused screenshots were captured at 1920 × 1080, 1440 × 900, 1024 × 768, 430 × 932, and 390 × 844. The hero eyebrow, Activities paragraph, and mobile Activities heading were visually inspected. The mobile heading remains readable and wraps without clipping. All five viewport captures reported no horizontal overflow, console errors, or failed local requests.

Screenshot evidence: `qa/typography-screenshot-results.json` and the `qa/screenshots/typography-*` files.

### Regression results after the CSS change

- Existing functional suite: PASS. Steam CTAs, internal navigation, mobile navigation state, FAQ keyboard interaction, visible focus, alt text, reduced motion, favicon, and overflow checks passed. The QA harness now allows the required YouTube fallback link alongside the Steam destination.
- Trailer suite: PASS at 1920 × 1080, 1440 × 900, 430 × 932, and 390 × 844. Click-to-load, keyboard activation, 16:9 layout, playback, fallback, and original eight-section count passed.
- axe-core: 0 confirmed violations at 1440 × 900 and 390 × 844. Incomplete image and gradient contrast checks remain documented.
- Lighthouse after the typography update: desktop 100 / 100 / 100 / 100; mobile 72 / 100 / 100 / 100. These are fresh local lab results from `qa/lighthouse-typography-desktop.report.json` and `qa/lighthouse-typography-mobile.report.json`. Mobile Performance varies between runs, so no broader performance conclusion is made from one run.

### Targeted readability follow-up

Date: 2026-11-15. The supplied screenshots were treated as visual evidence. The latest correction added a restrained dark backing to the Hero eyebrow, changed shared light-section body text to darker charcoal, increased World and Activities supporting text to 18px desktop and 17px mobile, and presented the Druid source note in a bordered slate panel. The Druid note remains because it explains the approved Steam-scoped wording and the unpublished complete roster. It is a source transparency note, not a gameplay claim.

Fresh Playwright screenshots at 1920 × 1080, 1440 × 900, 1024 × 768, 430 × 932, and 390 × 844 returned HTTP 200 with no horizontal overflow, console errors, or failed local requests. Hero and Activities focused captures were also produced. Evidence: `qa/typography-screenshot-results.json` and `qa/screenshots/typography-*`.

The rendered-pixel contrast audit was rerun at 1440 × 900 and 390 × 844. Updated measured minimums were 13.30:1 for the Hero eyebrow, 8.26:1 for World body text, 7.39:1 for the Activities supporting paragraph, and 7.76:1 for the Druid source note panel. All measured combinations passed WCAG AA. The separate FAQ audit measured all four answers at 9.35:1 at both viewports. Axe-core reported zero confirmed violations at both viewports. Its image, gradient, and overlap color checks remain incomplete and are not reported as passes.

Regression checks after this follow-up passed for Steam CTA destinations, internal navigation, mobile menu state and inert behavior, FAQ keyboard interaction, visible focus, image alt text, reduced motion, favicon, and horizontal overflow. The trailer suite passed the click-to-load, keyboard activation, 16:9, playback, fallback, and section-count checks at all four approved viewports. YouTube's own activated iframe still reports third-party axe findings, which are external to project HTML and remain documented separately.

Final Lighthouse runs after this follow-up were actual local lab results from Lighthouse 13.6.0: desktop 82 / 100 / 100 / 100 and mobile 39 / 100 / 100 / 100. The full reports are `qa/lighthouse-typography-final-desktop.report.json` and `qa/lighthouse-typography-final-mobile.report.json`. Performance is variable in this networked local run, so these scores are recorded without treating them as a broader field-performance claim.

## Phase 4.5 final content and performance refinement

Date: 2026-11-15.

### Content change

- Removed the player-facing Druid evidence disclaimer from the page and removed its now-unused slate panel styling.
- Preserved the limitation in `CLAIM_VERIFICATION.md`: official platform listings contain inconsistent seven-class and eight-class references, and no complete current eight-class roster was verified.
- Kept the verified Druid forms and all other approved copy unchanged.

### Performance investigation

The prior reports were compared with the earlier video implementation reports. The earlier mobile report was 99 Performance with 0ms TBT, 1,652ms LCP, 2,007ms Speed Index, and 1,374ms main-thread work. The latest pre-change report was 39 Performance with 1,623ms TBT, 5,613ms LCP, 5,641ms Speed Index, and 8,078ms main-thread work.

The current valid Lighthouse samples show the regression is dominated by the page origin under mobile throttling, not the inactive YouTube player. The mobile trace recorded 3.1 seconds and 1.1 seconds page-origin long tasks, 4.5 seconds of Style and Layout work, and 8.3 seconds of total main-thread work. Network evidence showed the hero image, 660KB World screenshot, 360KB class image, Google fonts, and the remote YouTube poster loading during the full-page audit. Script evaluation was only about 145ms. The iframe was not created during the audit.

Evidence-based changes attempted:

- Added `decoding="async"` to non-hero content images.
- Tested deferred section rendering with `content-visibility: auto`; it did not improve the mobile result and was removed.
- Tested hero image preloads; the mobile probe fell to 29 Performance, so the preloads were removed.
- Kept the YouTube facade, poster, click-to-load behavior, and meaningful imagery intact.

### Final Lighthouse median

Three valid runs per viewport were completed after the final code state. Median category scores are recorded below in the order Performance, Accessibility, Best Practices, SEO.

| Viewport | Median score | LCP median | TBT median | Speed Index median | Main-thread median |
| --- | --- | ---: | ---: | ---: | ---: |
| Desktop | 96 / 100 / 100 / 100 | 605ms | 143ms | 1,211ms | 1,049ms |
| Mobile | 33 / 100 / 100 / 100 | 6,683ms | 1,899ms | 6,698ms | 9,343ms |

The desktop target was met. The mobile target was not met. The mobile score remains environment-sensitive and is consistently limited by page-origin style/layout work and image/font loading in these runs. Reports: `qa/lighthouse-phase45-final2-desktop-1.json` through `-3.json`, and `qa/lighthouse-phase45-final2-mobile-1.json` through `-3.json`.

### Final verification

- axe-core: 0 confirmed violations at 1440 × 900 and 390 × 844. Image, gradient, and overlap checks remain incomplete and are not counted as passes.
- Rendered contrast: 30 measured groups at each viewport, no failures. FAQ answers separately passed at 9.35:1 at both viewports.
- Fresh full-page screenshots: captured at 1440 × 900 and 390 × 844. Both returned HTTP 200 with no console errors in the capture.
- Existing functional regression suite: attempted after the change but did not complete because its external Steam request stalled in the local environment. It is not marked as passed by this phase.
- No publication, AFBooster configuration, or rights clearance was performed.

## Phase 4.6 final content and performance refinement

Date: 2026-11-16.

The controlled server-fixed baseline median was 100 / 100 / 100 / 100 desktop and 74 / 100 / 100 / 100 mobile. The final content-preserving state median was 99 / 100 / 100 / 100 desktop and 79 / 100 / 100 / 100 mobile. Final mobile metrics were LCP 3,007ms, TBT 369ms, Speed Index 3,045ms, and main-thread work 2,656ms. The mobile target of 85 was not met.

Responsive `srcset` and `sizes` candidates plus asynchronous image decoding reduced mobile LCP, TBT, Speed Index, and main-thread work against the server-fixed baseline. Section containment and hero preload probes were removed because containment produced blank full-page sections and preload worsened the mobile result. The YouTube iframe remained click-to-load and was absent during Lighthouse page-load audits.

Final bounded local functional checks passed at all four viewports. Steam CTA hrefs, anchors, mobile navigation, FAQ keyboard interaction, video activation, iframe attributes, overflow, and disclaimer removal were checked. Steam availability was checked separately and returned HTTP 200. axe-core reported zero confirmed violations. Image, gradient, and overlap contrast checks remain incomplete.

Fresh screenshots are in `qa/screenshots/phase46-final-*.png`. Detailed findings and individual Lighthouse reports are in `PERFORMANCE_AUDIT.md`.
