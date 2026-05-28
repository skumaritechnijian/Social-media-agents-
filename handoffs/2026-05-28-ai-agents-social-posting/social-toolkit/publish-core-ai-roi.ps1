$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)))
$package = Join-Path $PSScriptRoot "pending\ai-roi-metrics-oc-2026"
$video = "d:\UserProfile\skumari\Downloads\AI ROI Metrics That Actually Matter for Orange County Businesses.mp4"

Push-Location $root
try {
  Write-Host "Checking X, TikTok, and Bluesky headless readiness..."
  python -m sdlc._agency_assets.scripts.social.preflight_core
  if ($LASTEXITCODE -ne 0) {
    throw "Core platforms are not headless-ready yet. Fill real credentials and run auth first."
  }

  $xCaption = Get-Content -Raw (Join-Path $package "x-post.txt")
  $ttCaption = Get-Content -Raw (Join-Path $package "tiktok-caption.txt")
  $bskyCaption = Get-Content -Raw (Join-Path $package "bluesky-post.md")

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

  Write-Host "Publishing to Bluesky..."
  python -m sdlc._agency_assets.scripts.social.cli publish bluesky `
    --caption $bskyCaption `
    --campaign ai_roi_metrics_oc_2026 `
    --client TECH

  Write-Host "Done."
}
finally {
  Pop-Location
}

