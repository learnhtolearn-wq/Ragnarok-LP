# Phase 4.6 performance audit

Date: 2026-11-16.

## Controlled test setup

- URL: `http://127.0.0.1:8767/`
- Browser: Chromium 157.0.8103.52 through Playwright and Lighthouse 13.6.0.
- Lighthouse configuration: three desktop runs with `--preset=desktop`, three mobile runs with `--preset=perf`, and Performance, Accessibility, Best Practices, and SEO categories.
- Server: cached local static server with explicit `Content-Length` and `Content-Type` headers. The earlier streaming server produced multi-second local asset transfers and distorted the mobile baseline.
- Existing reports were preserved. Controlled baseline files are `qa/lighthouse-phase46-serverfixed-desktop-*.json` and `qa/lighthouse-phase46-serverfixed-mobile-*.json`.

## Controlled before and after results

| Test set | Desktop median | Mobile median | LCP mobile | TBT mobile | Speed Index mobile | Main-thread mobile |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Server-fixed baseline before responsive sources | 100 / 100 / 100 / 100 | 74 / 100 / 100 / 100 | 3,605ms | 563ms | 3,646ms | 4,204ms |
| Final content-preserving state | 99 / 100 / 100 / 100 | 79 / 100 / 100 / 100 | 3,007ms | 369ms | 3,045ms | 2,656ms |

Final reports are `qa/lighthouse-phase46-finalsafe-desktop-1.json` through `-3.json` and `qa/lighthouse-phase46-finalsafe-mobile-1.json` through `-3.json`.

The mobile target of 85 was not reached. Accessibility, Best Practices, and SEO remained 100 in every final run. The earlier 29 mobile result came from a different unreliable server condition and is not used as the controlled comparison.

## Root-cause findings

1. The first apparent regression was partly test infrastructure. The original local server streamed files without explicit length and type headers. Under Lighthouse throttling, local WebP transfers took several seconds. The cached header-complete server raised the controlled mobile baseline from 29 to 74 before page optimizations.
2. The remaining page cost is concentrated in image delivery, image decode, font loading, and style/layout work. In the server-fixed baseline, the 660KB World derivative and 360KB class derivative were selected on mobile. The final responsive state selects 172KB and 99KB derivatives instead.
3. The final mobile trace shows about 1.6 seconds of Style and Layout work, about 2.7 seconds of total main-thread work, and about 62KB of Google Fonts. Script evaluation is small compared with rendering work. No forced synchronous layout items were reported by Lighthouse.
4. The YouTube iframe is absent before activation. The remote poster is lazy-loaded and is not the LCP element. Removing the video would not address the measured root cause.
5. Section containment was tested. It improved a probe to 82, but full-page screenshots showed blank below-fold sections unless they were force-scrolled. It was removed to preserve content and reliable screenshots.
6. Hero preloading was tested and worsened the mobile probe. It was removed.

## Image inventory and responsive delivery

All local source screenshots are 1920x1080 WebP derivatives. The hero mobile crop is 864x1080. Current responsive candidates are:

| Asset | Desktop derivative | Mobile derivative | Mobile bytes | Loading |
| --- | ---: | ---: | ---: | --- |
| Hero | 1920x1080, 400,326 bytes | 768x960, 106,024 bytes | 106,024 | High priority |
| World | 1920x1080, 659,894 bytes | 960x540, 172,338 bytes | 172,338 | Lazy |
| Class lineup | 1920x1080, 359,748 bytes | 960x540, 99,912 bytes | 99,912 | Lazy |
| Combat card | 1920x1080, 242,018 bytes | 960x540, 72,412 bytes | 72,412 | Lazy |
| Customization card | 1920x1080, 325,750 bytes | 960x540, 93,714 bytes | 93,714 | Lazy |
| Coastal card | 1920x1080, 136,402 bytes | 960x540, 32,770 bytes | 32,770 | Lazy |
| Multiplayer | 1920x1080, 286,184 bytes | 960x540, 92,244 bytes | 92,244 | Lazy |
| Final CTA | 1920x1080, 358,990 bytes | 960x540, 100,700 bytes | 100,700 | Lazy |

The page uses `srcset` and `sizes` for responsive local images, keeps the hero prioritized, and uses asynchronous decoding on content images. Original downloads remain untouched. Compact 640px and 768px experiments were generated but are not selected because their controlled result was lower.

## Typography, CSS, and functional findings

Google Fonts requests two WOFF2 files totaling about 62KB. No local font files were found with a verified license, so fonts were not self-hosted. The CSS audit reported about 3KB of minification opportunity with no measurable LCP savings. No minification-only change was made.

Bounded local functional checks passed at all four viewports for CTA hrefs, internal anchors, mobile menu state, FAQ keyboard toggling, video click-to-load, iframe title and referrer policy, overflow, and Druid disclaimer removal. YouTube iframe requests were recorded separately as external-media requests. Steam availability was checked separately and returned HTTP 200.

axe-core reported 0 confirmed violations at desktop and mobile. Image, gradient, and overlap color checks remain incomplete. Fresh screenshots are in `qa/screenshots/phase46-final-*.png`.

No copy, architecture, video selection, Steam destination, AFBooster configuration, or publication change was made.
