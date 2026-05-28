# Social Credential Templates

Copy these files to:

`D:\UserProfile\skumari\OneDrive - Technijian, Inc\Documents\VSCODE\keys`

Then replace every `REPLACE_WITH_...` value with real platform credentials.

Do not commit real key files.

## Platforms

1. X/Twitter: `x.md`, then run `auth x`
2. YouTube: `youtube.md` plus `~/.creds/google/youtube_client_secret.json`, then run `auth youtube`
3. TikTok: `tiktok.md`, then run `auth tiktok`
4. Bluesky: `bluesky.md`, then run `auth bluesky`
5. LinkedIn: `linkedin.md`, then run `auth linkedin`
6. Meta/Facebook/Instagram: `meta-graph.md`, then run `auth meta --short-token "..."`
7. Threads: `threads.md`, then run `auth threads`
8. Pinterest: `pinterest.md`, then run `auth pinterest`
9. Medium: browser login state, run `auth medium`
10. Quora: browser login state, run `auth quora`

Check headless publishing readiness without printing secrets:

```powershell
python -m sdlc._agency_assets.scripts.social.preflight
```
