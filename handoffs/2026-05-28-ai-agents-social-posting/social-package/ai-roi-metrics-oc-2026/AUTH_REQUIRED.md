# Auth Required Before Headless Upload

The video package is ready, but upload cannot run without real platform authorization.

Headless publishing needs cached tokens in:

```text
sdlc/_agency_assets/scripts/social/state/
```

Current missing items from preflight:

- TikTok: real `client_key`, `client_secret`, and cached `social_token_tiktok.json`
- X: real `client_id`, `client_secret`, and cached `social_token_x.json`
- YouTube: real `channel_id`, OAuth client secret, YouTube token, and cached token mirror
- Bluesky: real `handle`, `app_password`, and cached `social_token_bluesky.json`
- LinkedIn: real app credentials, organization URN, and cached token
- Meta/Facebook/Instagram: real app/page/IG credentials and cached token
- Threads: real app credentials, user ID, and cached token
- Pinterest: real app credentials and cached token

Run this anytime to check readiness without printing secret values:

```powershell
python -m sdlc._agency_assets.scripts.social.preflight
```

For only Twitter/X, TikTok, and Bluesky:

```powershell
python -m sdlc._agency_assets.scripts.social.preflight_core
```

Important: placeholder credential files have been created in:

```text
D:\UserProfile\skumari\OneDrive - Technijian, Inc\Documents\VSCODE\keys
```

Replace only the placeholder values there. Do not commit real credentials.
