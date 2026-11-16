# Implementation report

Project: Ragnarok: The New World TAF2
Phase: 3, landing-page implementation
Date: 2026-11-15

## Targeted visual correction pass

- Darkened supporting text, light-background eyebrow labels, and gold accents on cream sections for clearer contrast.
- Reduced the activities heading size at narrow mobile widths, adjusted line-height, and removed the forced line break so the heading can wrap naturally.
- Kept the city image in the World section. It directly shows Midgard/Prontera and remains the more informative setting image; the coastal alternative is visually clearer but less specific. The coastal screenshot remains in the activity card.
- Positioned the multiplayer gold caption inside the image at `bottom: 16px` on desktop and tablet, and `bottom: 12px` on narrow mobile. Its left inset and responsive maximum width keep it within the image boundary. The existing offset frame remains intact.
- Tightened mobile requirements panel spacing and kept labels and values aligned in a clearer two-column row.
- Did not alter page architecture or approved factual copy.
- Fresh browser screenshots could not be captured: the local server was blocked from binding to the port, and headless Chrome rejected the requested invocation. No screenshots or functional test results are claimed for this pass.

## Implemented

- Created `index.html`, `style.css`, and `script.js`.
- Implemented the approved eight-section architecture:
  1. Hero
  2. Gameplay and World
  3. Classes and Builds
  4. Exploration and Activities
  5. Multiplayer and Community
  6. PC and Steam Access
  7. FAQ
  8. Final CTA
- Applied the approved midnight blue, slate, muted gold, and ivory palette.
- Used official downloaded screenshots and WebP derivatives only.
- Used the exact Steam CTA URL in all primary CTA links.
- Added responsive navigation, FAQ accordions, scroll reveal effects, reduced-motion handling, and a mobile fixed CTA with reserved footer spacing.
- Added mobile navigation `inert` and `aria-hidden` state handling so closed links are removed from the keyboard and accessibility tree.
- Gated scroll reveal hiding behind the `js-enabled` class so content remains visible when JavaScript is unavailable or fails before initialization.
- Made the hero image meaningful by removing the conflicting `aria-hidden` attribute from its picture wrapper.
- Replaced the ambiguous custom RO monogram with a decorative star mark that cannot be mistaken for official game logo artwork.
- Renamed the class media label from “Class gallery” to “Character styles”.
- Updated `PROJECT_CONTEXT.md` with the approved claim wording and initial-copy restrictions.

## Claim restrictions applied

- Used: “Eight classes are listed on Steam, including Druid.”
- Did not publish a complete list of eight class names.
- Used: “Customize 100+ looks.”
- Used only the verified Druid forms: Werewolf, Wereraptor, and Human Arcanist.
- Excluded 120 FPS, offline progression, and cross-device synchronization from the initial copy.
- Did not invent Druid, MVP mount, trading, or standalone logo artwork.

## Verification results

| Check | Result |
|---|---|
| Phase 3 structural test | PASS after report creation |
| JavaScript syntax check | PASS with `node --check script.js` |
| Required sections | 8 of 8 present |
| Local image references | 8 checked, 0 missing |
| Exact Steam CTA URL | 6 references present |
| Restricted claim scan | 0 matches |
| CSS brace balance | 214 opening, 214 closing |
| Images with alt attributes | 8 of 8 |
| Primary navigation label | Present |
| Skip link | Present |
| FAQ disclosures | 4 present |
| Reduced motion support | Present |
| Closed mobile navigation focus protection | Present via `inert` and `aria-hidden` |
| JavaScript-disabled content fallback | Present via `js-enabled` reveal gate |

## Accessibility notes

Implemented semantic sections, one page-level `h1`, labelled navigation, a skip link, keyboard-visible focus states, accessible FAQ `details` elements, alt text for all images, and a reduced-motion media query.

The mobile navigation uses a button with `aria-expanded` and `aria-controls`. The fixed mobile CTA remains above the footer spacing and does not cover the final content area.

## Performance notes

- Images use WebP derivatives and lazy loading for below-the-fold content.
- The hero image uses `fetchpriority="high"`.
- CSS uses a single stylesheet and JavaScript is deferred.
- The Google Fonts stylesheet is an external dependency. If production must work without third-party font requests, self-host licensed font files before publication.
- No Lighthouse or PageSpeed score was recorded because the local browser preview could not access the development server in this environment.

## Preview limitation

The in-app browser could not connect to the local development server, and the Windows browser automation surface stopped before a screenshot could be captured. Static checks passed, but a real desktop and mobile browser visual pass remains required before publication.

Open the local file directly for review:

- `index.html`
- `style.css`
- `script.js`

## Not performed

- No AFBooster configuration.
- No external account changes.
- No site publication.
- No commercial rights clearance.
- No end-to-end Steam, launcher, Gravity account, server, or first-login attribution test.

## Remaining tasks

- Perform desktop and mobile browser review.
- Check visual spacing, cropping, navigation, FAQ behavior, and mobile CTA in a real browser.
- Run Lighthouse or PageSpeed and record actual results.
- Resolve font hosting and artwork rights before commercial publication.
- Continue with Phase 4 QA only after review of this implementation.

## Official overall gameplay trailer showcase

Update date: 2026-11-15. This section supersedes the earlier preview limitations and records the targeted trailer addition.

- Placement: supplemental video showcase immediately after Hero and before Gameplay & World. The original eight primary sections, navigation, approved copy, and all Steam CTA destinations remain unchanged.
- Heading: “Discover the world of Midgard”. Subtitle: “Explore the world. Experience the adventure.”
- Selected source: [Ragnarok: The New World｜First Global Full Gameplay Trailer Released](https://www.youtube.com/watch?v=KVHa83JkUV0), video ID `KVHa83JkUV0`. The Gravity launch announcement links the Ragnarok: The New World official YouTube channel: https://www.globenewswire.com/news-release/2026/07/16/3328291/0/en/Ragnarok-The-New-World-Officially-Launched-in-Southeast-Asia-on-July-16-2026.html.
- Source inspection: opened and played footage from the selected trailer. The inspected footage showed traversal, world environment, multiple characters, and game HUD. This classification does not add claims about game features.
- Poster: remote YouTube `sddefault.jpg` at `https://i.ytimg.com/vi/KVHa83JkUV0/sddefault.jpg`. It is not copied or rehosted. The video itself is not downloaded.
- Playback: responsive 16:9 facade with a visible keyboard-operable play button. No iframe or player request is made before activation. On explicit activation, the page inserts a titled `youtube-nocookie.com` iframe. The autoplay parameter is only used following this user action. A separate YouTube watch-page fallback opens in a new tab with `noopener`.
- Rights: the official source/channel was identified, but neither channel ownership nor YouTube embed availability establishes commercial reuse permission. Commercial embedding and use of the thumbnail for this campaign remain unverified. The manifest records this restriction.
- TAF guide consistency: `TAF-1-2-Guides.md` was reviewed. Its requirements for local project structure, exact Steam URL, optimized and mobile-ready media, stable reserved media space, keyboard access, and browser/Lighthouse QA are met by this implementation and tested locally. The guide does not clear artwork or media rights. The separately mentioned original TAF2 brief was not present among the supplied project documents.

### Trailer implementation evidence

Playwright 1.65.1 with Chromium 157.0.8103.52 was used at 1920 × 1080, 1440 × 900, 430 × 932, and 390 × 844. All local page responses were HTTP 200. The player stayed unloaded until activation. Keyboard Enter activated playback. Before each activated-player screenshot, the browser confirmed decoded video `readyState` 4, active playback, and a current time beyond 0.5 seconds. The frame remained 16:9 at each viewport. The original eight primary sections were present. Existing Steam links retained the exact approved destination. The fallback link opened the exact YouTube watch URL. Screenshots are in `qa/screenshots/`, named `video-showcase-*`, `video-block-*`, and `video-player-*`.

axe-core 4.14.0 reported zero violations on the local host page before player activation at all four sizes, and zero host-page violations after activation when the third-party iframe was excluded. The complete after-activation scan included accessibility violations in YouTube's own iframe UI. Those findings are external to project HTML and are documented in `QA_REPORT.md`; they are not reported as passing. Axe also returned incomplete checks, which are not counted as passes.

Lighthouse 13.6.0 ran after the final page CSS update. Desktop: Performance 100, Accessibility 100, Best Practices 100, SEO 100. Mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100. Previous approved mobile performance baseline was 77 to 78, giving an observed increase of 21 to 22 points across that range. Full reports: `qa/lighthouse-video-desktop.report.json` and `qa/lighthouse-video-mobile.report.json`.

Browser results, exact axe findings, failed external requests, and screenshot paths are recorded in `QA_REPORT.md` and `qa/video-showcase-test-results.json`. The YouTube poster and player load over the network only as required. There were no host console errors, page errors, or HTTP error responses. A YouTube channel-avatar image request was aborted during player loading at some viewport runs. See QA report for scope.

The trailer addition is ready for review. It has not been published, AFBooster has not been configured, and commercial media rights remain uncleared.

## YouTube Error 153 investigation

Update date: 2026-11-15.

- Root cause confirmed: a page opened through `file://` has no HTTP origin and Chromium sent no `Referer` header with the YouTube iframe request. The iframe was inserted, but the embedded player did not reach a playable state in the file-origin probe.
- The page has no `no-referrer`, `same-origin`, `noreferrer`, Content Security Policy, or equivalent referrer-suppressing directive in `index.html` or the project configuration.
- The generated iframe now sets both the explicit `referrerpolicy` content attribute and the matching DOM property to `strict-origin-when-cross-origin`. It keeps the selected ID `KVHa83JkUV0`, `youtube-nocookie.com`, click-to-load behavior, responsive 16:9 sizing, and the existing YouTube fallback.
- Local HTTP test: at desktop 1440 × 900 and mobile 390 × 844, Chromium sent `Referer: http://127.0.0.1:8767/` to `https://www.youtube-nocookie.com/embed/KVHa83JkUV0?...`. The iframe reported the expected attribute and property, decoded video reached `readyState` 4, playback was active, and the current time passed 0.5 seconds.
- File-origin comparison: at `file://C:/Users/PC/Downloads/Antigravity_Projects/Ragnarok_TAF2/index.html`, the same request contained no `Referer` header and the player did not reach the tested playable state within 20 seconds. This confirms that the screenshot's direct file opening is the cause of Error 153 in this environment.
- No fake Referer, fabricated origin, `noreferrer`, or design/copy/CTA change was introduced.
- Evidence: `qa/youtube-referer-probe.json`. The browser used was Chromium 157.0.8103.52. The local server returned HTTP 200.
- No eventual HTTPS-hosted page was available in this project, so HTTPS playback and its final production Referer behavior were not tested. That check remains pending publication on an actual HTTPS origin.

## Typography and readability correction pass

Update date: 2026-11-15.

- Increased reusable body, label, metadata, and fine-print text sizes for comfortable reading.
- Reduced letter spacing on small text and increased body line-height.
- Corrected hero eyebrow visibility with warm ivory text and a lower hero content position below the fixed header overlap.
- Preserved approved copy, visual identity, imagery, video, CTA destinations, architecture, and section order.

Rendered screenshots and contrast checks support the correction. Detailed ratios and methods are in `TYPOGRAPHY_READABILITY_AUDIT.md`. Functional, trailer, axe-core, and Lighthouse results are appended to `QA_REPORT.md`. No publication or AFBooster action was taken.

## Targeted readability follow-up

Update date: 2026-11-15.

- Added a restrained dark backing, border, and text shadow to the Hero eyebrow so the approved phrase remains readable over the hero image.
- Updated the reusable light-section body color to deep charcoal and increased World and Activities supporting copy to 18px on desktop and 17px on mobile.
- Increased the Druid descriptive paragraph to the same readable scale.
- Kept the Druid source note wording unchanged and styled it as a bordered slate panel. It explains the Steam evidence boundary around the class statement and does not present a new player-facing claim.
- Preserved the approved copy, palette direction, imagery, trailer, CTA destinations, architecture, and section order.

The current screenshots, measured contrast results, functional checks, axe-core results, video checks, and Lighthouse scores are recorded in `QA_REPORT.md` and `TYPOGRAPHY_READABILITY_AUDIT.md`. No publication or AFBooster action was taken.

## Phase 4.5 final content and performance refinement

Update date: 2026-11-15.

- Removed the player-facing Druid evidence disclaimer and its unused slate panel styling.
- Preserved the factual seven-class versus eight-class limitation in `CLAIM_VERIFICATION.md`.
- Added asynchronous decoding to non-hero content images. Hero readability, World and Activities typography, imagery, trailer behavior, architecture, and Steam CTAs remain unchanged.

Performance investigation compared the previous 39 mobile report and the earlier 99 mobile video report. The final mobile Lighthouse traces show the dominant work is page-origin style/layout and image/font loading during the audit. Script evaluation was about 145ms and the YouTube iframe was absent until activation. A section containment probe did not improve the result and was removed. A hero preload probe worsened mobile performance and was also removed.

The final three-run medians were desktop 96 / 100 / 100 / 100 and mobile 33 / 100 / 100 / 100. The desktop target was met. The mobile target was not met in this local lab environment. The exact runs and findings are recorded in `QA_REPORT.md`.

## Phase 4.6 final content and performance refinement

Update date: 2026-11-16.

- Added responsive `srcset` and `sizes` delivery for approved local game imagery.
- Generated WebP mobile derivatives without changing original downloads or visual content.
- Added asynchronous decoding to content images.
- Tested section containment and hero preload changes, then removed both when evidence showed blank full-page sections or worse mobile results.

The controlled final median is 99 desktop and 79 mobile for Performance, with Accessibility, Best Practices, and SEO at 100. The mobile target of 85 remains outstanding. No approved copy, visual architecture, trailer, CTA destination, publication, or AFBooster configuration changed.
