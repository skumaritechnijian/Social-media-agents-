# X, TikTok, and Bluesky Posting Requirements

Local automation is ready for these three platforms, but real posting access is issued by each platform.

## X / Twitter

- Requires an X Developer app.
- Requires real `client_id` and `client_secret`.
- Requires OAuth token creation for `tweet.write`.
- X currently presents the API as pay-per-use, not a free anonymous posting endpoint.

Local files:

```text
D:\UserProfile\skumari\OneDrive - Technijian, Inc\Documents\VSCODE\keys\x.md
sdlc/_agency_assets/scripts/social/state/social_token_x.json
```

## TikTok

- Requires a registered TikTok developer app.
- Requires Content Posting API product.
- Requires Direct Post configuration and authorization for `video.publish`.
- Public posting may require app review/approval; use `SELF_ONLY` until approved.

Local files:

```text
D:\UserProfile\skumari\OneDrive - Technijian, Inc\Documents\VSCODE\keys\tiktok.md
sdlc/_agency_assets/scripts/social/state/social_token_tiktok.json
```

## Bluesky

- Requires a Bluesky handle and app password.
- Does not require a paid developer app.
- The local toolkit can create the session token directly from the app password.

Local files:

```text
D:\UserProfile\skumari\OneDrive - Technijian, Inc\Documents\VSCODE\keys\bluesky.md
sdlc/_agency_assets/scripts/social/state/social_token_bluesky.json
```

## Commands

Fill credentials:

```powershell
.\sdlc\_agency_assets\scripts\social\set-core-credentials.ps1
```

Authorize:

```powershell
.\sdlc\_agency_assets\scripts\social\auth-core.ps1
```

Publish AI ROI package:

```powershell
.\sdlc\_agency_assets\scripts\social\publish-core-ai-roi.ps1
```

