# Text contrast audit

Checked: 2026-11-15

## Method

Ratios were calculated from the CSS foreground and background colors using the WCAG relative luminance formula. For translucent text on a solid background, the foreground was first composited over that background. Large text uses the WCAG AA threshold of 3:1. Normal text uses 4.5:1.

## Corrected combinations

| Text and component | Before | After | Ratio after | Result |
| --- | --- | --- | ---: | --- |
| Gold emphasis in the World heading, `#e1c28b` on `#e6dcc8` | `#e1c28b` on `#e6dcc8`, 1.26:1 | `#705329` on `#e6dcc8` | 5.22:1 | Pass |
| Gold emphasis in the Activities heading, `#e1c28b` on `#ddd0b9` | `#e1c28b` on `#ddd0b9`, 1.12:1 | `#705329` on `#ddd0b9` | 4.66:1 | Pass |
| Gold emphasis in the Steam heading, `#e1c28b` on `#e6dcc8` | `#e1c28b` on `#e6dcc8`, 1.26:1 | `#705329` on `#e6dcc8` | 5.22:1 | Pass |
| Activities supporting paragraph | Ivory at 60% composited on `#ddd0b9`, 1.07:1 | `#514b45` on `#ddd0b9` | 5.65:1 | Pass |
| World and Steam body copy | `#514b45` on `#e6dcc8`, 6.32:1 | `#514b45` on `#e6dcc8` | 6.32:1 | Pass, unchanged |
| Eyebrow labels on cream | `#8f7650` on `#ddd0b9`, 2.83:1 | `#705329` on `#ddd0b9` | 4.66:1 | Pass |
| Eyebrow labels on light cream | `#8f7650` on `#e6dcc8`, 3.17:1 | `#705329` on `#e6dcc8` | 5.22:1 | Pass |
| Fine print on dark sections | `#77757a` on `#10131d`, 4.07:1 | `#9c9a9b` on `#10131d` | 6.63:1 | Pass |
| Footer text on midnight | Ivory at 42% composited on `#10131d`, 3.31:1 | `#9c9a9b` on `#10131d` | 6.63:1 | Pass |

## Reviewed combinations that pass

| Text and component | Measured colors | Ratio | Result |
| --- | --- | ---: | --- |
| Body text on the Activities background | `#514b45` on `#ddd0b9` | 5.65:1 | Pass |
| Gold requirement label on the Steam background | `#705329` on `#e6dcc8` | 5.22:1 | Pass |
| Requirement value on the Steam background | `#62481f` on `#e6dcc8` | 6.26:1 | Pass |
| Ivory text on midnight | `#e8dcc5` on `#10131d` | 13.66:1 | Pass |
| Muted text on midnight | `#9c9a9b` on `#10131d` | 6.63:1 | Pass |
| Gold text on midnight | `#c9a66b` on `#10131d` | 8.08:1 | Pass |
| Pale gold text on midnight | `#e1c28b` on `#10131d` | 10.85:1 | Pass |
| Hero metadata on midnight | Ivory at 55% composited on `#10131d` | 4.85:1 | Pass |
| Scroll cue on midnight | Ivory at 54% composited on `#10131d` | 4.73:1 | Pass |
| Navigation text on midnight | Ivory at 72% composited on `#10131d` | 7.51:1 | Pass |
| Primary button text on gold | `#10131d` on `#c9a66b` | 8.08:1 | Pass |

## Screenshot evidence and limits

Before and current screenshots were captured with Playwright 1.65.1 using Chrome 157.0.8103.52 at device scale factor 1. The before captures reproduce the pre-audit colors with browser-injected CSS. Full-page captures cover 1920 × 1080, 1440 × 900, 390 × 844, and 430 × 932 viewports. Section captures for Activities, World, and Steam are also available in desktop and mobile sizes. See `SCREENSHOT_REPORT.md` for paths and capture status.

Text over game screenshots, image-backed sections, and gradients does not have one fixed background color. Those combinations require rendered-pixel sampling at their text locations to establish a measured ratio. This audit does not claim a contrast result for those image-dependent areas.
