$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)))
$package = Join-Path $PSScriptRoot "pending\ai-roi-metrics-oc-2026"
$video = "d:\UserProfile\skumari\Downloads\AI ROI Metrics That Actually Matter for Orange County Businesses.mp4"

Push-Location $root
try {
  Write-Host "Checking X, TikTok, and YouTube headless readiness..."
  python -m sdlc._agency_assets.scripts.social.preflight_video
  if ($LASTEXITCODE -ne 0) {
    throw "X/TikTok/YouTube are not fully headless-ready yet."
  }

  $xCaption = Get-Content -Raw (Join-Path $package "x-post.txt")
  $ttCaption = Get-Content -Raw (Join-Path $package "tiktok-caption.txt")
  $ytDesc = Join-Path $package "youtube\description.txt"
  $ytTags = Get-Content -Raw (Join-Path $package "youtube\tags.txt")
  $ytTitle = (Get-Content -Raw (Join-Path $package "youtube\title.txt")).Trim()

  Write-Host "Publishing to X..."
  python -m sdlc._agency_assets.scripts.social.cli publish x `
    --caption $xCaption `
    --campaign ai_roi_metrics_oc_2026 `
    --client TECH

  Write-Host "Publishing to TikTok..."
  python -m sdlc._agency_assets.scripts.social.cli publish tiktok `
    --file $video `
    --caption $ttCaption `
    --privacy SELF_ONLY `
    --campaign ai_roi_metrics_oc_2026 `
    --client TECH

  Write-Host "Uploading to YouTube..."
  python -m sdlc._agency_assets.scripts.social.cli publish youtube `
    --file $video `
    --title $ytTitle `
    --description-file $ytDesc `
    --tags $ytTags `
    --privacy unlisted `
    --campaign ai_roi_metrics_oc_2026 `
    --client TECH

  Write-Host "Done."
}
finally {
  Pop-Location
}

