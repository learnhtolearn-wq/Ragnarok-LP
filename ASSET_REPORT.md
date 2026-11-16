# Asset report

Project: Ragnarok: The New World
Steam App ID: 4212480
Target GEO: Thailand
Collection source: https://store.steampowered.com/api/appdetails?appids=4212480&l=english&cc=TH
Collection date: 2026-11-15

## Collection summary

The public Steam Store API returned 11 full screenshots, one header image, two capsule images, one store background, two trailer thumbnails, and two HLS trailer URLs. Original image downloads are preserved in `assets/originals/`. The public API did not expose a directly downloadable MP4 file. The selected overall gameplay video is embedded from the official Ragnarok: The New World YouTube channel using a click-to-load facade. No video was downloaded or rehosted.

## Current project state

- Phase 1 asset collection and audit: COMPLETE, approved for development use.
- Landing-page files `index.html`, `style.css`, and `script.js`: PRESENT.
- Original source files: preserved under `assets/originals/`.
- Optimized image derivatives: present under `assets/images/`.
- Class artwork folder: contains the class lineup derivative under `assets/classes/`.
- Video folder: contains Steam trailer thumbnail derivatives. The selected overall gameplay video is remotely embedded from YouTube after user activation. No direct video file was downloaded.
- Logos folder: empty. The public API provided header and capsule artwork, but no standalone logo file.
- Selected review sheet: `assets/contact_sheet_selected.jpg`.
- Full original review sheet: `assets/contact_sheet_all_originals.jpg`.

## Recommended selections

| Requested use | Selection | Status | Notes |
|---|---|---|---|
| Best hero image | `assets/originals/screenshot_03_full.jpg` | AVAILABLE | Wide party traversal scene with clear characters and environment. `assets/images/hero_desktop.webp` and `hero_mobile.webp` are prepared crops from this image. |
| Best Midgard exploration image | `assets/originals/screenshot_01_full.jpg` | AVAILABLE | Aerial city and dense street scene. |
| Best combat image | `assets/originals/screenshot_04_full.jpg` | AVAILABLE | Boss encounter with visible action effects. |
| Class artwork | `assets/originals/screenshot_05_full.jpg` | AVAILABLE | Grouped character and outfit lineup. |
| Druid artwork | MISSING | MISSING | No dedicated Druid artwork in the public Steam payload. |
| MVP mount image | MISSING | MISSING | No MVP mount image in the public Steam payload. |
| Character customization image | `assets/originals/screenshot_02_full.jpg` | AVAILABLE | Wardrobe UI and appearance controls. |
| Trading image | MISSING | MISSING | No auction, vendor, or trading scene in the public Steam payload. |
| Multiplayer image | `assets/originals/screenshot_06_full.jpg` | AVAILABLE | Party combat with several player HUDs. |
| Best official trailer | `Ragnarok: The New World｜First Global Full Gameplay Trailer Released`, YouTube video `KVHa83JkUV0` | AVAILABLE FOR EMBED DEVELOPMENT | Inspected footage shows overall game footage, including traversal, environment, characters, and game HUD. Published on the Ragnarok: The New World channel, which Gravity identifies as its official YouTube channel. Embed use does not establish commercial reuse permission. |

## Downloaded files

All originals and derivatives are listed in `assets/manifest.csv` with source type, source URL, dimensions, file size, intended use, derivative path, SHA-256, and rights status. The main original files are:

- `assets/originals/capsule_184x69.jpg`: 184x69, 10,881 bytes
- `assets/originals/capsule_231x87.jpg`: 231x87, 15,996 bytes
- `assets/originals/header.jpg`: 460x215, 56,274 bytes
- `assets/originals/screenshot_01_full.jpg`: 1920x1080, 1,160,509 bytes
- `assets/originals/screenshot_02_full.jpg`: 1920x1080, 640,664 bytes
- `assets/originals/screenshot_03_full.jpg`: 1920x1080, 710,886 bytes
- `assets/originals/screenshot_04_full.jpg`: 1920x1080, 530,649 bytes
- `assets/originals/screenshot_05_full.jpg`: 1920x1080, 656,747 bytes
- `assets/originals/screenshot_06_full.jpg`: 1920x1080, 562,421 bytes
- `assets/originals/screenshot_07_full.jpg`: 1920x1080, 575,928 bytes
- `assets/originals/screenshot_08_full.jpg`: 1920x1080, 809,448 bytes
- `assets/originals/screenshot_09_full.jpg`: 1920x1080, 630,533 bytes
- `assets/originals/screenshot_10_full.jpg`: 1920x1080, 696,699 bytes
- `assets/originals/screenshot_11_full.jpg`: 1920x1080, 328,216 bytes
- `assets/originals/store_background.jpg`: 1438x808, 20,614 bytes
- `assets/originals/trailer_01_thumbnail.jpg`: 600x337, 35,840 bytes
- `assets/originals/trailer_02_thumbnail.jpg`: 600x337, 108,941 bytes

## Prepared derivatives

- `assets/images/*.webp`: WebP versions of suitable downloaded images.
- `assets/images/hero_desktop.webp`: 16:9 desktop derivative prepared from screenshot 03.
- `assets/images/hero_mobile.webp`: portrait derivative prepared from screenshot 03.
- `assets/classes/class_lineup.webp`: class lineup derivative.
- `assets/video/trailer_01_thumbnail.webp` and `trailer_02_thumbnail.webp`: trailer thumbnail derivatives.
- `assets/contact_sheet_selected.jpg`: selected candidates for approval.
- `assets/contact_sheet_all_originals.jpg`: review sheet for the downloaded visual originals.

The derivatives preserve source content and do not add or remove game content.

## Trailer source URLs

- Selected overall gameplay trailer: https://www.youtube.com/watch?v=KVHa83JkUV0
  - Exact YouTube title: `Ragnarok: The New World｜First Global Full Gameplay Trailer Released`
  - Channel: Ragnarok: The New World. Gravity's official launch announcement links the official channel: https://www.globenewswire.com/news-release/2026/07/16/3328291/0/en/Ragnarok-The-New-World-Officially-Launched-in-Southeast-Asia-on-July-16-2026.html
  - Poster endpoint used by the page: https://i.ytimg.com/vi/KVHa83JkUV0/sddefault.jpg. It is requested remotely by the page and was not copied into project assets.
  - Implementation: click-to-load `youtube-nocookie.com` iframe, with a YouTube watch-page fallback. No iframe request occurs before activation and there is no page-load autoplay.
  - Rights status: embed and thumbnail display are not treated as commercial-use permission. Written rights and campaign reuse approval remain unverified.

- Trailer 01, `PV` thumbnail: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257403911/3c8d5a8772326734e8b0051b19927fc831c411aa/movie_600x337.jpg?t=1787308459
  - HLS H.264: https://video.akamai.steamstatic.com/store_trailers/4212480/39565784/97b667e6e8026376064390ed81cf54163913fbd8/1787307582/hls_264_master.m3u8?t=1787308459
  - DASH H.264: https://video.akamai.steamstatic.com/store_trailers/4212480/39565784/97b667e6e8026376064390ed81cf54163913fbd8/1787307582/dash_h264.mpd?t=1787308459
- Trailer 02, `The first open-world RO is officially available on Steam!` thumbnail: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257315994/1600ab91c7f29280909c4c62ea1ac2e7cd569153/movie_600x337.jpg?t=1776247405
  - HLS H.264: https://video.akamai.steamstatic.com/store_trailers/4212480/247566644/93bac4cbb55c38157a6c4cb203ad9eb1768803c5/1775620731/hls_264_master.m3u8?t=1776247405
  - DASH H.264: https://video.akamai.steamstatic.com/store_trailers/4212480/247566644/93bac4cbb55c38157a6c4cb203ad9eb1768803c5/1775620731/dash_h264.mpd?t=1776247405

## Duplicate assets

No exact byte-for-byte duplicate downloads were found among the collected original files. Category files and WebP derivatives intentionally reuse source content and are marked as derivatives in the manifest.

## Suitability and resolution audit

- The 11 full screenshots are 1920x1080 and suitable for section imagery and crops.
- The trailer thumbnails are 600x337 and suitable as poster images only.
- The header is 460x215 and the capsule images are 231x87 and 184x69. These are suitable for compact branding references, not full-width hero backgrounds.
- The store background is 1438x808 and is suitable as a low-detail background fallback.
- No unrelated Ragnarok title assets were used.

## Licensing and reuse questions

- Steam availability does not grant commercial reuse rights. Confirm permission with Gravity Game Vision Limited or the rights holder before publishing these assets.
- Confirm whether the official Steam artwork can be used in the Thailand landing page, and whether any approval, attribution, or territory limitation applies.
- Confirm whether trailer playback can be embedded from Steam CDN URLs or whether a licensed hosted copy is required.
- Confirm with Gravity or the rights holder whether the selected YouTube trailer may be embedded for this campaign and whether the remotely served thumbnail may be displayed commercially in the target GEO. Platform embed availability is not rights clearance.
- Confirm whether the game logo, character art, Druid art, MVP mount art, trading UI, and any Thai-localized assets can be supplied directly by the rights holder.
- Keep the original source URLs and downloaded originals for auditability. Do not edit or overwrite the files in `assets/originals/`.

## Missing assets

- Dedicated Druid artwork
- MVP mount image
- Trading or auction image
- Standalone game logo file
- Directly downloadable original trailer video file. The selected YouTube trailer is intentionally embedded and not downloaded or rehosted.
