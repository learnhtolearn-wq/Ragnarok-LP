# Screenshot report

Captured: 2026-11-15

## Capture setup

- Playwright: 1.65.1
- Browser: Google Chrome 157.0.8103.52, Chromium based
- Device scale factor: 1
- Motion setting: reduced motion
- Capture mode: fresh headless browser and isolated browser contexts, with no extensions
- Page response: HTTP 200 at `http://127.0.0.1:8767/`
- Images were decoded and `document.fonts.ready` was awaited before capture.

## Full-page screenshots

All filenames below are under `qa/screenshots/`. The viewport is the browser viewport used to lay out the page. The PNG captures the full page height.

| Viewport | Current page | Before comparison |
| --- | --- | --- |
| 1920 × 1080 | `desktop-1920.png` | `desktop-1920-before.png` |
| 1440 × 900 | `desktop-1440.png` | `desktop-1440-before.png` |
| 390 × 844 | `mobile-390.png` | `mobile-390-before.png` |
| 430 × 932 | `mobile-430.png` | `mobile-430-before.png` |

The before captures use browser-injected CSS to reproduce the pre-audit text colors. The project source was not reverted for those captures.

## Section and multiplayer captures

Desktop section captures use a 1440 × 900 viewport. Mobile section captures use a 390 × 844 viewport. They are viewport captures positioned at each section, with the site header and mobile CTA visible as they appear during normal scrolling.

| Section | Desktop before | Desktop current | Mobile before | Mobile current |
| --- | --- | --- | --- | --- |
| Activities | `activities-desktop-before.png` | `activities-desktop.png` | `activities-mobile-before.png` | `activities-mobile.png` |
| World | `gameplay-desktop-before.png` | `gameplay-desktop.png` | `gameplay-mobile-before.png` | `gameplay-mobile.png` |
| Steam | `steam-desktop-before.png` | `steam-desktop.png` | `steam-mobile-before.png` | `steam-mobile.png` |

Additional multiplayer viewport captures use 1440 × 900 desktop and 390 × 844 mobile: `multiplayer-desktop.png`, `multiplayer-mobile.png`.

## Loading status and errors

- All eight full-page captures returned HTTP 200.
- No `<img>` elements were missing or failed to decode.
- No failed network requests were recorded during the final capture run. Google font CSS and font files returned successfully.
- One generic browser console message reported a 404 during the 1920 × 1080 before capture. Chromium did not expose its URL in the message. The other captures had no console or page errors.
- No local image asset was reported missing.
