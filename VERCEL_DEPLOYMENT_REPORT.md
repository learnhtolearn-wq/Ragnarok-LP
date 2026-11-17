# Vercel deployment report

Date: 2026-11-17

## Deployment

- Project: `ragnarok-lp`
- Account scope: `learnhtolearn-3709s-projects`
- Deployment type: Vercel Preview
- Deployment ID: `dpl_DPWGnRgiUwQ1v6S8zCNW4moUY3qY`
- Preview URL: https://ragnarok-dra4mqnwb-learnhtolearn-3709s-projects.vercel.app
- Inspector URL: https://vercel.com/learnhtolearn-3709s-projects/ragnarok-lp/DPWGnRgiUwQ1v6S8zCNW4moUY3qY
- Status at deployment: READY
- Source commit: `1b55168` on `main`
- Static configuration: root `index.html`, no build system, relative CSS, JavaScript, and asset paths.
- Deployment protection: SSO is disabled for this project so anyone with the Preview URL can open the page without a Vercel account.
- Production aliases: the unintended aliases created by the first CLI deployment were removed. No production alias is currently assigned to this Preview deployment.

## Hosted HTTPS checks

Browser: Playwright 1.65.1 with Chrome 157.0.8103.52.

The Preview root returned HTTP 200. Key hosted files returned HTTP 200 with the expected content types: `style.css` as CSS, `script.js` as JavaScript, `favicon.ico` as an icon, and the checked WebP images as WebP. The page loaded with no console errors.

Hosted browser checks ran at 1920 × 1080, 1440 × 900, 390 × 844, and 430 × 932.

- Six Steam CTA links were present at each viewport. Their href remained the exact approved Steam URL.
- Twelve discovered local asset URLs returned HTTP 200 at each viewport.
- Four FAQ disclosures opened and closed, and answers were visible.
- Mobile menu open and close behavior passed where the mobile menu was present.
- The YouTube facade inserted the selected `KVHa83JkUV0` iframe only after activation.
- The iframe title and `strict-origin-when-cross-origin` referrer policy were present.
- The YouTube request received the Vercel Preview Referer: `https://ragnarok-dra4mqnwb-learnhtolearn-3709s-projects.vercel.app/`.
- The test context recorded an aborted external YouTube iframe request when the context closed. This was not a local asset failure or console error.

Evidence: `qa/vercel-preview-qa.json`.

## Lighthouse

Lighthouse 13.6.0 was run against the HTTPS Preview using the installed project runtime. Scores are ordered Performance, Accessibility, Best Practices, SEO.

| Mode | Scores | LCP | CLS | TBT |
| --- | --- | --- | --- | --- |
| Desktop | 95 / 100 / 100 / 63 | 1.1 s | 0.004 | 0 ms |
| Mobile | 79 / 100 / 100 / 63 | 3.1 s | 0.025 | 350 ms |

Reports: `qa/lighthouse-vercel-desktop.json` and `qa/lighthouse-vercel-mobile.json`.

The mobile Performance target of 85 was not met in this hosted run. SEO returned 63 in both runs. No score was estimated or reused from local testing.

## Screenshots

Viewport screenshots captured from the Vercel Preview:

- `qa/screenshots/vercel-desktop-1920.png`
- `qa/screenshots/vercel-desktop-1440.png`
- `qa/screenshots/vercel-mobile-390.png`
- `qa/screenshots/vercel-mobile-430.png`

Chromium rejected full-page screenshot capture for the hosted page with `Protocol error (Page.captureScreenshot): Unable to capture screenshot`. The listed files are exact viewport captures, not full-page captures.

## Known limitations

- SSO is disabled for this project by explicit review approval. Re-enable it if the Preview should become private again.
- The Preview was deployed from the local checkout after the GitHub push. A Git-connected Vercel deployment hook was not configured.
- Commercial artwork and YouTube media rights remain unverified.
- AFBooster was not configured.
- No affiliate IDs or campaign tracking parameters were added.
- No first-login attribution is claimed.
- The mobile Lighthouse Performance target was not met, and the SEO score requires follow-up before publication.

## Publication status

The site has not been published to a production alias. AFBooster, campaign tracking, commercial rights clearance, and end-to-end first-login attribution remain outstanding.
