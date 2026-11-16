# Typography and readability audit

Date: 2026-11-15

## Changes

- Increased the base body size from 15px to 16px.
- Increased body paragraphs to 17px on desktop and retained at least 16px on mobile.
- Increased meaningful eyebrows, labels, metadata, fine print, footer text, and card descriptions to at least 12px.
- Reduced excessive letter spacing on small text and increased body line-height.
- Changed the hero eyebrow to warm ivory and moved hero content below the fixed header so the label is not hidden beneath it.
- Kept approved copy, palette direction, imagery, video, CTA destinations, architecture, and section order unchanged.

## Rendered contrast results

Paired Chromium screenshots were sampled at 1440 × 900 and 390 × 844. Text remained visible in one capture and was hidden in the paired capture. Changed glyph pixels identified rendered text locations, and the effective foreground was composited over the sampled background before calculating WCAG ratios.

The grouped audit measured 31 rendered text elements at each viewport. No measured group failed the 4.5:1 normal-text threshold. The lowest measured group was the Activities eyebrow at 4.66:1 on both viewports.

| Text group | Desktop minimum | Mobile minimum | Size | Result |
| --- | ---: | ---: | ---: | --- |
| Hero eyebrow | 13.02:1 | 9.95:1 | 12px | PASS |
| Hero body | 9.39:1 | 7.74:1 | 17px / 16px | PASS |
| Activities eyebrow | 4.66:1 | 4.66:1 | 12px | PASS |
| Activities supporting paragraph | 5.65:1 | 5.65:1 | 17px | PASS |
| Activity card descriptions | 9.48:1 minimum | 8.37:1 minimum | 14px | PASS |
| World body | 6.32:1 | 6.32:1 | 17px | PASS |
| Multiplayer body | 9.70:1 | 9.33:1 | 17px | PASS |
| FAQ answers | 9.35:1 | 9.35:1 | 16px | PASS |
| Footer | 6.63:1 | 6.63:1 | 12px | PASS |

All four FAQ answers were audited separately with each disclosure open. Each passed at 9.35:1. Raw results are in `qa/typography-contrast-results.json` and `qa/faq-contrast-results.json`.

axe-core 4.14.0 reported zero confirmed violations at 1440 × 900 and 390 × 844. It still reported incomplete color contrast checks for image, gradient, and overlap cases. Those incomplete checks are not treated as automated passes.

## Layout evidence

Fresh screenshots were captured at 1920 × 1080, 1440 × 900, 1024 × 768, 430 × 932, and 390 × 844. Focused Hero and Activities captures were produced for each viewport. All captures reported no horizontal overflow, console errors, or failed local requests.

Evidence index: `qa/typography-screenshot-results.json`.

## Targeted readability follow-up

Date: 2026-11-15.

- Added a subtle dark backing, border, and text shadow to the Hero eyebrow so the approved phrase remains readable over the artwork.
- Changed the shared light-section body color to `#3f3a35` and increased desktop supporting paragraphs to 18px, with 17px on mobile.
- Increased the Druid supporting paragraph to 18px on desktop and 17px on mobile.
- Styled the Druid source note as a bordered, padded panel with a dark slate background. The wording was retained because it explains the evidence boundary around the Steam-scoped class statement. It is a transparency note, not a player benefit claim.

The updated rendered-pixel audit measured the changed combinations at 1440 × 900 and 390 × 844:

| Text group | Desktop minimum | Mobile minimum | Size | Result |
| --- | ---: | ---: | --- | --- |
| Hero eyebrow with backing | 13.30:1 | 9.95:1 | 12px | PASS |
| World body | 8.26:1 | 8.26:1 | 18px / 17px | PASS |
| Activities supporting paragraph | 7.39:1 | 7.39:1 | 18px / 17px | PASS |
| Druid source note panel | 7.76:1 | 7.76:1 | 12px | PASS |

Fresh screenshot output and raw measurements remain in `qa/screenshots/typography-*`, `qa/typography-contrast-results.json`, and `qa/faq-contrast-results.json`. The automated audit still reports image, gradient, and overlap cases as incomplete. They are not counted as passes.

## Phase 4.5 current state

Date: 2026-11-15.

The Druid source disclaimer was removed from the player-facing page. The factual limitation remains in `CLAIM_VERIFICATION.md`. The earlier panel styling was removed with the content, so no empty visual block remains in the Druid layout.

The final rendered contrast audit measured 30 groups at 1440 × 900 and 390 × 844 with no failures. The changed Hero, World, Activities, and Druid descriptive text remains within the previously measured passing combinations. FAQ answers were measured separately at 9.35:1 at both viewports. Automated image, gradient, and overlap cases remain incomplete.

## Phase 4.6 current state

Date: 2026-11-16.

The performance pass did not change approved typography or contrast colors. Responsive image sources and asynchronous decoding were added without changing text layout. A section containment experiment was removed after fresh full-page screenshots showed blank below-fold sections. The final screenshots show all sections present.
