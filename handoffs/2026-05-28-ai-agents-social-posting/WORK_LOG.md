# 2026-05-28 AI Agents and Social Posting Handoff

## Scope

This note preserves the working context from the chat so the shared SDLC repo contains the agent setup, social publishing process, completed posts, and remaining credential gaps.

## Repository Reviewed

Source checked:

```text
https://github.com/skumaritechnijian/Social-media-agents-
```

The repo contained:

- `social-media-automation/` with YouTube, TikTok, X, Medium, Bluesky, Quora, and shared cross-post tooling.
- `technijian-in-automation/` with SEO/Google workflow agents, skill, harness docs, and implementation guide.

Important review notes:

- No obvious live secrets were found in the GitHub repo scan.
- TikTok automation existed in GitHub but was not originally imported locally.
- YouTube API tooling existed in older local folders and usable OAuth files were found later.
- X/TikTok API credentials were not found locally; only placeholders exist.

## Technijian.in AI Harness Created

Local harness path:

```text
sdlc/clients/TECH/technijian.in/11_AI_Harness/
```

Created agents:

- `agents/technijian-in-orchestrator.agent.md`
- `agents/content-strategist.agent.md`
- `agents/google-platform-manager.agent.md`
- `agents/reporting-analyst.agent.md`
- `agents/seo-qa.agent.md`

Created skill:

- `skills/technijian-in-google-seo/SKILL.md`

Updated:

- `sdlc/clients/TECH/technijian.in/11_AI_Harness/README.md`

Purpose:

- Keep technijian.in India-market SEO, Google, content planning, reporting, and QA workflows separate from Technijian.com/Orange County workflows.
- Use dry-run plans before any Google, WordPress, or SEO live operation.
- Route work to specialist agents for content strategy, Google platform operations, reporting, and SEO QA.

## Social Automation Created or Updated

Social toolkit path:

```text
sdlc/_agency_assets/scripts/social/
```

Created or updated:

- `preflight.py`
- `preflight_core.py`
- `preflight_video.py`
- `set-core-credentials.ps1`
- `auth-core.ps1`
- `publish-core-ai-roi.ps1`
- `set-video-credentials.ps1`
- `auth-video.ps1`
- `publish-video-ai-roi.ps1`
- `CORE_PLATFORM_LIMITS.md`

Credential templates added:

- `credential-templates/linkedin.md`
- `credential-templates/meta-graph.md`
- `credential-templates/threads.md`
- `credential-templates/pinterest.md`

Notes:

- `auth.py` was adjusted so YouTube upload uses YouTube Data API scopes only. This avoids refresh failure from requesting Analytics scopes against an upload-only token.
- `preflight.py` now treats YouTube `channel_id` as optional because uploads use the authenticated channel by default.

## TikTok Browser Automation Imported

Local path:

```text
sdlc/tools/tiktok-automation/
```

Imported from the GitHub repo:

- `login-passive.cjs`
- `publish.cjs`
- `publish.js`
- AutoHotkey/VBS helper scripts
- `package.json`
- `package-lock.json`

Added:

- `.gitignore`
- `page-speed-oc-restaurants-caption.txt`
- `login-google-saroj.cjs`

Important status:

- Browser-based TikTok upload was attempted for `Page Speed Optimization for OC Restaurants _ Faster Websites Win More Diners.mp4`.
- It could not complete because TikTok login/verification was required.
- Stuck automation processes were stopped.
- Local screenshots captured during troubleshooting were removed because sensitive browser tabs were visible.

## AI ROI Social Package

Package path:

```text
sdlc/_agency_assets/scripts/social/pending/ai-roi-metrics-oc-2026/
```

Source video:

```text
d:\UserProfile\skumari\Downloads\AI ROI Metrics That Actually Matter for Orange County Businesses.mp4
```

Video check:

- MP4
- H.264 video
- AAC audio
- 1280x720
- 30 fps
- Duration: about 145 seconds
- Size: about 28.5 MB

Prepared files:

- `tiktok-caption.txt`
- `x-post.txt`
- `bluesky-post.md`
- `youtube/title.txt`
- `youtube/description.txt`
- `youtube/tags.txt`
- `commands.md`
- `twitter-tiktok-bluesky.md`
- `AUTH_REQUIRED.md`
- `youtube-result.md`

## Completed Posts

### Bluesky

Configured:

- Handle: `technijian.bsky.social`
- A Bluesky app password was provided by the user and saved to the local keys vault. The password is intentionally not recorded here.

Auth result:

- `social_token_bluesky.json` created in the social toolkit state folder.

Published URL:

```text
https://bsky.app/profile/technijian.bsky.social/post/3mmwllmmu3n2n
```

### YouTube

Found older YouTube OAuth files in local/OneDrive folders and migrated them into:

```text
%USERPROFILE%\.creds\google\youtube_client_secret.json
%USERPROFILE%\.creds\google\youtube_token.json
```

Created the social token mirror:

```text
sdlc/_agency_assets/scripts/social/state/social_token_youtube.json
```

Uploaded AI ROI video as unlisted:

```text
https://youtube.com/watch?v=NlEd_W-SALg
```

Video ID:

```text
NlEd_W-SALg
```

Channel:

```text
Technijian
```

## Current Credential Status

Ready:

- Bluesky
- YouTube

Still blocked:

- X/Twitter: missing real `client_id` and `client_secret`.
- TikTok API: missing real `client_key` and `client_secret`.

Only placeholder files exist for X and TikTok:

```text
D:\UserProfile\skumari\OneDrive - Technijian, Inc\Documents\VSCODE\keys\x.md
D:\UserProfile\skumari\OneDrive - Technijian, Inc\Documents\VSCODE\keys\tiktok.md
```

## Readiness Commands

From `sdlc-main`:

```powershell
python -m sdlc._agency_assets.scripts.social.preflight_core
python -m sdlc._agency_assets.scripts.social.preflight_video
```

For all supported social platforms:

```powershell
python -m sdlc._agency_assets.scripts.social.preflight
```

## Auth Commands

For Bluesky, X, TikTok:

```powershell
.\sdlc\_agency_assets\scripts\social\set-core-credentials.ps1
.\sdlc\_agency_assets\scripts\social\auth-core.ps1
```

For X, TikTok, YouTube:

```powershell
.\sdlc\_agency_assets\scripts\social\set-video-credentials.ps1
.\sdlc\_agency_assets\scripts\social\auth-video.ps1
```

## Publish Commands

For AI ROI package to X/TikTok/Bluesky after all auth is ready:

```powershell
.\sdlc\_agency_assets\scripts\social\publish-core-ai-roi.ps1
```

For AI ROI package to X/TikTok/YouTube after all auth is ready:

```powershell
.\sdlc\_agency_assets\scripts\social\publish-video-ai-roi.ps1
```

## Operational Rules

- Do not commit real credentials, browser sessions, screenshots, or tokens.
- Real credentials live under:

```text
D:\UserProfile\skumari\OneDrive - Technijian, Inc\Documents\VSCODE\keys
```

- Cached tokens live under:

```text
sdlc/_agency_assets/scripts/social/state/
```

- TikTok browser profile/session files live under:

```text
sdlc/tools/tiktok-automation/auth/
```

- Keep `auth/`, `state/`, `*.png`, and browser profile outputs ignored.
- Treat screenshots from browser automation as sensitive if any login or credential tab was visible.
- For TikTok public API posting, the TikTok developer app must have Content Posting API / `video.publish` access. Use `SELF_ONLY` until public posting is approved.
- For X/Twitter API posting, a developer app with write access and OAuth token is required.

