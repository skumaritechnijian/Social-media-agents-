# AI ROI Metrics - Headless Publish Commands

Video:

```powershell
d:\UserProfile\skumari\Downloads\AI ROI Metrics That Actually Matter for Orange County Businesses.mp4
```

Video check:

- Format: MP4
- Video: H.264, 1280x720, 30 fps
- Audio: AAC
- Duration: 145.08 seconds
- Size: 28.5 MB

## TikTok API

Requires cached TikTok OAuth token in:

```text
sdlc/_agency_assets/scripts/social/state/social_token_tiktok.json
```

Run after token exists:

```powershell
python -m sdlc._agency_assets.scripts.social.cli publish tiktok `
  --file "d:\UserProfile\skumari\Downloads\AI ROI Metrics That Actually Matter for Orange County Businesses.mp4" `
  --caption (Get-Content -Raw "sdlc-main\sdlc\_agency_assets\scripts\social\pending\ai-roi-metrics-oc-2026\tiktok-caption.txt") `
  --privacy SELF_ONLY `
  --campaign ai_roi_metrics_oc_2026 `
  --client TECH
```

## YouTube API

Requires:

```text
%USERPROFILE%\.creds\google\youtube_client_secret.json
%USERPROFILE%\.creds\google\youtube_token.json
```

Run after token exists:

```powershell
python -m sdlc._agency_assets.scripts.social.cli publish youtube `
  --file "d:\UserProfile\skumari\Downloads\AI ROI Metrics That Actually Matter for Orange County Businesses.mp4" `
  --title "AI ROI Metrics That Actually Matter for Orange County Businesses" `
  --description-file "sdlc-main\sdlc\_agency_assets\scripts\social\pending\ai-roi-metrics-oc-2026\youtube\description.txt" `
  --tags "AI ROI,business automation,Orange County business,AI automation,digital transformation,workflow automation,Technijian" `
  --privacy unlisted `
  --campaign ai_roi_metrics_oc_2026 `
  --client TECH
```

## X / Bluesky Text Posts

These are prepared in:

```text
x-post.txt
bluesky-post.md
```

They can run headlessly only after cached tokens exist in the social state folder.

