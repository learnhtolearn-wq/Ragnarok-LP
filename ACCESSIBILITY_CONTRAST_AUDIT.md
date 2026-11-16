# Accessibility contrast audit

Date: 2026-11-15  
Project: Ragnarok: The New World TAF2  
Browser: Google Chrome 157.0.8103.52, controlled with Playwright 1.65.1  
Viewports: desktop 1440 × 900 and mobile 390 × 844, device scale factor 1

## Method

The audit sampled actual rendered pixels at text glyph positions in the requested image and gradient regions. For each viewport, Chromium produced a screenshot with visible text and a paired background-only screenshot. A magenta mask located glyph pixels; the paired screenshot supplied the effective background RGB at each location after the image, gradients, overlays, and other compositing. The measured CSS foreground alpha and ancestor opacity were composited over those pixels before calculating WCAG relative luminance and contrast. Each table ratio is the minimum across sampled glyph pixels for that selector and both viewports. The raw per-fragment samples are in `qa/dynamic-contrast-samples.json`.

Normal text uses the WCAG AA threshold of 4.5:1. Large text uses 3:1. To be conservative, body and small text are judged at 4.5:1. All listed text passed at the sampled locations. This does not convert axe-core's incomplete automated checks into passes: axe still cannot determine these backgrounds, so this is a separate rendered-pixel audit.

## Results

| Region | Selector and sampled text | Foreground | Worst effective background | Minimum ratio | AA threshold | Result |
| --- | --- | --- | --- | ---: | ---: | --- |
| Header | `.brand-copy > span`, Ragnarok | `rgb(232,220,197)` | `#15161d` | 13.29:1 | 4.5:1 | PASS |
| Header | `.brand-copy > small`, The New World | `rgb(201,166,107)` | `#14161d` | 7.87:1 | 4.5:1 | PASS |
| Header | `.site-nav > a`, World, Classes, Activities, Community | `rgba(232,220,197,.72)` | `#13151d` | 7.40:1 | 4.5:1 | PASS |
| Header | `.site-nav > .nav-cta`, Play free on Steam | `rgb(225,194,139)` | `#181a24` | 10.14:1 | 4.5:1 | PASS |
| Hero image and gradient | `.hero-content .eyebrow` | `rgb(225,194,139)` | `#332e34` | 7.77:1 | 4.5:1 | PASS |
| Hero image and gradient | `#hero-title`, Your next adventure | `rgb(232,220,197)` | `#363434` | 9.12:1 | 3:1 | PASS |
| Hero image and gradient | `#hero-title em`, begins in Midgard | `rgb(225,194,139)` | `#2f3134` | 7.64:1 | 3:1 | PASS |
| Hero image and gradient | `.hero-lede` | `rgba(232,220,197,.78)` | `#2b2c2e` | 6.90:1 | 4.5:1 | PASS |
| Hero image and gradient | `.hero-meta b`, PC | `rgb(201,166,107)` | `#0e0f15` | 8.33:1 | 4.5:1 | PASS |
| Hero image and gradient | `.hero-meta > span`, via Steam, Free to play, MMORPG | `rgba(232,220,197,.55)` | `#1b1a1f` | 4.72:1 | 4.5:1 | PASS |
| Hero controls | `.hero-actions .button-primary` | `rgb(16,19,29)` | `#c9a66b` | 8.08:1 | 4.5:1 | PASS |
| Hero controls | `.hero-actions .text-link` | `rgb(232,220,197)` | `#272120` | 11.68:1 | 4.5:1 | PASS |
| World image label | `.image-label`, Midgard / Prontera | `rgb(232,220,197)` | `#24272f` | 11.00:1 | 4.5:1 | PASS |
| Activity cards | `.activity-card-tall .card-index`, 01 | `rgb(225,194,139)` | `#13222e` | 9.48:1 | 4.5:1 | PASS |
| Activity cards | `.activity-card-tall h3`, Meet the challenge | `rgb(232,220,197)` | `#212429` | 10.84:1 | 4.5:1 | PASS |
| Activity cards | `.activity-card-tall p` | `rgba(232,220,197,.72)` | `#1f2328` | 6.71:1 | 4.5:1 | PASS |
| Activity cards | `.activity-card .card-index`, 02 and 03 | `rgb(225,194,139)` | `#313235` | 7.50:1 | 4.5:1 | PASS |
| Activity cards | `.activity-card h3`, Customize 100+ looks, Go beyond the city | `rgb(232,220,197)` | `#34363c` | 8.90:1 | 4.5:1 | PASS |
| Activity cards | `.activity-card p` | `rgba(232,220,197,.72)` | `#242326` | 6.66:1 | 4.5:1 | PASS |
| Multiplayer background | `.community-copy .eyebrow` | `rgb(225,194,139)` | `#12151f` | 10.66:1 | 4.5:1 | PASS |
| Multiplayer background | `#multiplayer-title` | `rgb(232,220,197)` | `#131620` | 13.20:1 | 3:1 | PASS |
| Multiplayer background | `#multiplayer-title em` | `rgb(225,194,139)` | `#151822` | 10.37:1 | 3:1 | PASS |
| Multiplayer background | `.community-copy > p` | `rgba(232,220,197,.65)` | `#161b25` | 6.05:1 | 4.5:1 | PASS |
| Multiplayer background | `.community-copy .button-outline` | `rgb(225,194,139)` | `#151923` | 10.28:1 | 4.5:1 | PASS |
| Multiplayer caption | `.community-caption span, .community-caption b` | `rgb(16,19,29)` | `#c9a66b` | 8.08:1 | 4.5:1 | PASS |
| Final CTA background | `.final-content .eyebrow` | `rgb(225,194,139)` | `#232028` | 9.39:1 | 4.5:1 | PASS |
| Final CTA background | `#final-title` | `rgb(232,220,197)` | `#2a2b31` | 10.40:1 | 3:1 | PASS |
| Final CTA background | `#final-title em` | `rgb(225,194,139)` | `#292b2d` | 8.32:1 | 3:1 | PASS |
| Final CTA control | `.final-content .button-primary` | `rgb(16,19,29)` | `#c9a66b` | 8.08:1 | 4.5:1 | PASS |

## Confirmed corrections

The baseline screenshot samples confirmed low contrast in the hero and header over the artwork, activity card text over its image crops, the World image label, and the final CTA overlay. The multiplayer text and caption passed before correction. The stylesheet was adjusted only for the confirmed failures: a dark translucent header, stronger hero and final CTA gradients, stronger activity card shading, and a dark backing behind the World image label. No copy, section structure, typography family, or background palette changed. The post-change sampling above found no remaining failures in the requested areas.

Before screenshots: `qa/screenshots/contrast-before-desktop.png`, `qa/screenshots/contrast-before-mobile.png`.  
After screenshots: `qa/screenshots/contrast-after-desktop.png`, `qa/screenshots/contrast-after-mobile.png`.

## Limitations

These results describe rendered glyph samples at the two tested viewport sizes and the rendered states captured. They are not an exhaustive proof for every possible display, browser, animation frame, or image crop. axe-core 4.14.0 continues to mark color contrast incomplete for 37 desktop and 32 mobile nodes because it cannot determine their backgrounds. No automated contrast pass is claimed for those nodes.
