# Ragnarok TAF2: Task Board

Project root: `C:\Users\PC\Downloads\Antigravity_Projects\Ragnarok_TAF2`

## Phase 0: Setup
- [x] Extract this context pack into the project root.
- [x] Inspect existing files before changing anything.
- [x] Confirm folder structure and preserve existing work.

## Phase 1: Asset collection and audit
- [x] Inspect official Steam Store API data for App ID `4212480`.
- [x] Collect publicly accessible official screenshots, artwork, trailer thumbnails, and available trailer media.
- [x] Use browser automation only if API data is insufficient.
- [x] Preserve untouched source files in `assets/originals/`.
- [x] Create optimized derivatives in appropriate asset folders.
- [x] Create/update `assets/manifest.csv`: source URL, source type, dimensions, file size, intended use, derivative path, rights status.
- [x] Detect duplicates and unsuitable/low-resolution files.
- [x] Create a visual contact sheet with filenames.
- [x] Create `ASSET_REPORT.md` listing inventory, sources, dimensions, sizes, missing needs, duplicates, and rights questions.
- [x] Stop and request user approval of the contact sheet/report. Approved for development use.

Candidate uses:
- [ ] A01 Hero desktop
- [ ] A02 Hero mobile
- [ ] A03 Midgard/world
- [ ] A04 Combat
- [ ] A05 Class gallery
- [ ] A06 Druid
- [ ] A07 MVP mount
- [ ] A08 Customization
- [ ] A09 Trading
- [ ] A10 Multiplayer
- [x] A11 Trailer: selected YouTube gameplay embed for development, rights remain unverified.
- [ ] A12 Game logo
- [ ] A13 Steam logo

## Phase 2: Verify product claims
- [x] Verify class count and names, including Druid.
- [x] Verify MVP taming/mount feature.
- [x] Verify customization count, trading, and multiplayer claims.
- [x] Verify free-to-play/in-game purchase wording.
- [x] Verify Gravity account and launcher flow.
- [x] Verify storage, RAM, and Steam-supported languages.
- [x] Record official source URL and date for every published factual claim.
- [x] Omit claims that cannot be verified.

## Phase 3: Landing-page implementation (only after asset approval)
- [x] Build `index.html`, `style.css`, `script.js`.
- [x] Implement approved sections in order: Hero; Gameplay & World; Classes & Builds; Exploration & Activities; Multiplayer & Community; PC / Steam Access; FAQ; Final CTA.
- [x] Apply approved Dark Fantasy MMORPG Premium art direction.
- [x] Implement mobile-first responsive layout.
- [x] Use relative asset paths and accessible semantic HTML.
- [x] Point primary CTA to the exact Steam URL in `PROJECT_CONTEXT.md`.
- [x] Avoid unsupported claims and fictional media.
- [x] Prevent layout shift and ensure fixed mobile CTA does not obscure content.

## Phase 4: QA
- [x] Test desktop/mobile at 1920 × 1080, 1440 × 900, 430 × 932, and 390 × 844.
- [x] Test private browsing in isolated Chromium contexts at 1440 × 900 and 390 × 844.
- [x] Check all local paths, scripts, images, video, links, and CTA destinations in the local browser build.
- [x] Check keyboard access, focus states, alt text, and FAQ interactions.
- [x] Run Lighthouse and record actual results only.
- [x] Check console errors, loading, and layout stability.
- [ ] Check delivery compression on the eventual hosted page.
- [x] Fix identified defects and rerun tests.

### Official overall gameplay trailer addition, 2026-11-15
- [x] Review `TAF-1-2-Guides.md` for media, responsive layout, CTA, accessibility, and QA consistency.
- [x] Inspect the selected official Ragnarok: The New World trailer and confirm the footage represents the overall game.
- [x] Record trailer source, title, video ID, remote poster URL, and unverified rights status in `assets/manifest.csv` and `ASSET_REPORT.md`.
- [x] Add a responsive 16:9 click-to-load YouTube facade between Hero and Gameplay & World, leaving the original eight primary sections intact.
- [x] Preserve the exact Steam CTA URLs and provide an accessible YouTube fallback link.
- [x] Run Playwright checks at 1920 × 1080, 1440 × 900, 430 × 932, and 390 × 844, including keyboard activation, poster/player loading, link destinations, and axe-core scans.
- [x] Capture full-page, showcase, and activated-player screenshots at all four viewports.
- [x] Run Lighthouse desktop and mobile, and record actual scores in `QA_REPORT.md`.
- [x] Update implementation, QA, project context, and asset reports.
- [ ] Obtain user review of implementation and evidence.
- [ ] Obtain commercial video and poster rights approval before publication.

## Targeted visual correction pass
- [x] Improve supporting text and gold contrast on cream backgrounds.
- [x] Adjust activities heading wrapping and line-height for narrow mobile.
- [x] Review city versus coastal source screenshots and retain city for the World section; coastal image remains an activity image.
- [x] Improve multiplayer image and caption spacing for mobile.
- [x] Improve mobile Steam requirements spacing and hierarchy.
- [x] Capture fresh desktop and mobile screenshots. Updated video-showcase screenshots at all four required sizes are recorded in `qa/screenshots/`.

## Typography readability follow-up
- [x] Improve Hero eyebrow legibility with a restrained backing and safe positioning below the header.
- [x] Increase World and Activities supporting text size and darkness using shared styles.
- [x] Present the Druid evidence note in a readable panel without changing its wording.
- [x] Capture fresh focused and full-page screenshots at the approved review sizes.
- [x] Rerun rendered contrast, FAQ contrast, functional, axe-core, and trailer checks.
- [x] Rerun Lighthouse and record the actual final scores in `QA_REPORT.md`.

## Phase 4.5 final content and performance refinement
- [x] Remove the player-facing Druid disclaimer without changing verified Druid forms or approved class wording.
- [x] Preserve the Druid evidence limitation in `CLAIM_VERIFICATION.md`.
- [x] Compare the latest and baseline Lighthouse JSON reports, including LCP, CLS, TBT, Speed Index, main-thread work, and network resources.
- [x] Apply the evidence-based asynchronous image decoding change.
- [x] Test and remove performance probes that did not improve the mobile result.
- [x] Run three Lighthouse samples per viewport and record medians.
- [x] Run axe-core, contrast checks, and fresh desktop and mobile screenshots.
- [ ] Reach the mobile Performance target of at least 85. The current median is 33 in the local lab environment.
- [ ] Complete the existing functional regression suite after the external Steam request stall is resolved.

## Phase 4.6 final content and performance refinement
- [x] Establish and preserve a controlled three-run Lighthouse baseline with a reliable local static server.
- [x] Compare LCP, CLS, TBT, Speed Index, main-thread work, long tasks, image requests, font requests, and YouTube loading.
- [x] Add responsive local image sources and asynchronous image decoding without changing approved imagery.
- [x] Test section containment and hero preload probes, then remove probes that harmed content or performance.
- [x] Run final three-run Lighthouse audits and record individual reports and medians.
- [x] Run bounded local functional checks, axe-core, contrast checks, external Steam availability, and fresh screenshots.
- [ ] Reach the mobile Performance target of at least 85. Final controlled median: 79.
- [ ] Verify font licensing before considering self-hosted font optimization.

## Phase 5: AFBooster and publication
- [ ] Confirm current Academy instructions.
- [ ] Configure affiliate account and required Motivation field.
- [ ] Verify email/platform validation.
- [ ] Configure class attribution.
- [ ] Publish and record public URL.
- [ ] Verify public URL and Steam destination in private browsing.
- [ ] Do not claim first-login attribution works until end-to-end event/attribution is tested.

## Phase 6: Handoff
- [ ] Record public landing-page URL.
- [ ] Include source files and asset manifest.
- [ ] Include actual QA checks and Lighthouse results.
- [ ] List unresolved limitations and rights issues.
- [ ] Submit public hosted URL unless Academy instructions change.

## Phase 5A: Vercel Preview deployment, 2026-11-17
- [x] Push the current project state to the public GitHub repository `learnhtolearn-wq/Ragnarok-LP`.
- [x] Create the Vercel project `ragnarok-lp` under the authenticated team scope.
- [x] Deploy a Vercel Preview from the approved static project.
- [x] Verify HTTPS page response, key local assets, favicon, Steam CTA hrefs, FAQ, mobile navigation, and YouTube facade.
- [x] Confirm the YouTube iframe received the Preview Referer over HTTPS.
- [x] Run hosted Lighthouse desktop and mobile audits and record actual scores.
- [x] Capture hosted desktop and mobile viewport screenshots.
- [x] Re-enable SSO protection after hosted verification.
- [x] Disable SSO protection for `ragnarok-lp` so the approved Preview URL is publicly accessible by link.
- [x] Create `VERCEL_DEPLOYMENT_REPORT.md`.
- [ ] Configure a Git-connected Vercel deployment workflow.
- [ ] Obtain commercial media rights clearance.
- [ ] Configure AFBooster or campaign tracking.
- [ ] Create a production alias or publish the campaign.
- [ ] Verify first-login attribution end to end.

## Immediate instruction
The official gameplay trailer showcase and its local browser QA are complete for review. Do not proceed to AFBooster publication or configuration without separate approval. Commercial media rights remain unverified.
