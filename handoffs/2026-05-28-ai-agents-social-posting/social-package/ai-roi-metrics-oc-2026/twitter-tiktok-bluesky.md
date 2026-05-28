# Twitter/X, TikTok, and Bluesky Setup

This package is prepared for the AI ROI video.

Video:

```text
d:\UserProfile\skumari\Downloads\AI ROI Metrics That Actually Matter for Orange County Businesses.mp4
```

## Files Created

```text
D:\UserProfile\skumari\OneDrive - Technijian, Inc\Documents\VSCODE\keys\x.md
D:\UserProfile\skumari\OneDrive - Technijian, Inc\Documents\VSCODE\keys\tiktok.md
D:\UserProfile\skumari\OneDrive - Technijian, Inc\Documents\VSCODE\keys\bluesky.md
```

These files already exist. Replace only the placeholder values inside them.

## Check Readiness

```powershell
python -m sdlc._agency_assets.scripts.social.preflight_core
```

## Fill Credential Files

Use the secure prompt helper. It does not echo secret values:

```powershell
.\sdlc\_agency_assets\scripts\social\set-core-credentials.ps1
```

Then run the auth helper:

```powershell
.\sdlc\_agency_assets\scripts\social\auth-core.ps1
```

## One-Time Auth

X/Twitter:

```powershell
python -m sdlc._agency_assets.scripts.social.cli auth x
```

TikTok:

```powershell
python -m sdlc._agency_assets.scripts.social.cli auth tiktok
```

Bluesky:

```powershell
python -m sdlc._agency_assets.scripts.social.cli auth bluesky
```

## Publish Commands After Auth

One command for all three:

```powershell
.\sdlc\_agency_assets\scripts\social\publish-core-ai-roi.ps1
```

X/Twitter:

```powershell
python -m sdlc._agency_assets.scripts.social.cli publish x `
  --caption (Get-Content -Raw "sdlc\_agency_assets\scripts\social\pending\ai-roi-metrics-oc-2026\x-post.txt") `
  --campaign ai_roi_metrics_oc_2026 `
  --client TECH
```

TikTok:

```powershell
python -m sdlc._agency_assets.scripts.social.cli publish tiktok `
  --file "d:\UserProfile\skumari\Downloads\AI ROI Metrics That Actually Matter for Orange County Businesses.mp4" `
  --caption (Get-Content -Raw "sdlc\_agency_assets\scripts\social\pending\ai-roi-metrics-oc-2026\tiktok-caption.txt") `
  --privacy SELF_ONLY `
  --campaign ai_roi_metrics_oc_2026 `
  --client TECH
```

Bluesky:

```powershell
python -m sdlc._agency_assets.scripts.social.cli publish bluesky `
  --caption (Get-Content -Raw "sdlc\_agency_assets\scripts\social\pending\ai-roi-metrics-oc-2026\bluesky-post.md") `
  --campaign ai_roi_metrics_oc_2026 `
  --client TECH
```
