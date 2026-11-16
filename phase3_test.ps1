$ErrorActionPreference = 'Stop'
$required = @('index.html','style.css','script.js','IMPLEMENTATION_REPORT.md')
foreach($file in $required){ if(!(Test-Path $file)){ throw "Missing required file: $file" } }
$html = Get-Content -Raw index.html
$css = Get-Content -Raw style.css
$js = Get-Content -Raw script.js
$cta = 'https://store.steampowered.com/app/4212480/Ragnarok_The_New_World/'
$sections = @('hero','gameplay','classes','activities','multiplayer','steam','faq','final-cta')
foreach($section in $sections){ if($html -notmatch ('id="'+[regex]::Escape($section)+'"')){ throw "Missing section: $section" } }
if($html -notmatch [regex]::Escape($cta)){ throw 'Exact Steam CTA URL missing' }
if($html -notmatch 'Eight classes are listed on Steam, including Druid'){ throw 'Approved class wording missing' }
if($html -notmatch 'Customize 100\+ looks'){ throw 'Approved customization wording missing' }
if($html -match '100\+ appearance options|120 FPS|offline progression|cross-device synchronization|all eight class names'){ throw 'Restricted claim found' }
if($html -notmatch '<nav id="site-nav"[^>]*inert'){ throw 'Closed navigation inert state missing' }
if($js -notmatch 'siteNav\.inert'){ throw 'Navigation inert state is not updated by JavaScript' }
if($css -notmatch '\.js-enabled \[data-reveal\]'){ throw 'Progressive reveal CSS gate missing' }
if($js -notmatch 'js-enabled'){ throw 'Progressive reveal JavaScript initialization missing' }
if($html -match '<picture[^>]*aria-hidden="true"[^>]*>\s*<source[^>]*>\s*<img[^>]*alt="[^"]+"'){ throw 'Hero image has conflicting hidden state and alt text' }
if($html -match '>RO<'){ throw 'Brand mark still uses an ambiguous RO monogram' }
if($html -match '>Class gallery<'){ throw 'Old class gallery label remains' }
foreach($asset in @('assets/images/hero_desktop.webp','assets/images/hero_mobile.webp','assets/images/screenshot_01_full.webp','assets/images/screenshot_04_full.webp','assets/classes/class_lineup.webp','assets/images/screenshot_02_full.webp','assets/images/screenshot_06_full.webp')){ if(!(Test-Path $asset)){ throw "Missing referenced asset: $asset" } }
if($js -notmatch 'addEventListener'){ throw 'JavaScript interactions missing' }
if($css -notmatch '--midnight|#10131D'){ throw 'Approved palette missing' }
Write-Output 'PASS: Phase 3 structural checks'
