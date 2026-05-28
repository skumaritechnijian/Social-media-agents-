$ErrorActionPreference = "Stop"

Write-Host "Checking X, TikTok, and YouTube readiness..."
python -m sdlc._agency_assets.scripts.social.preflight_video

Write-Host ""
Write-Host "Starting one-time auth for X..."
python -m sdlc._agency_assets.scripts.social.cli auth x

Write-Host ""
Write-Host "Starting one-time auth for TikTok..."
python -m sdlc._agency_assets.scripts.social.cli auth tiktok

Write-Host ""
Write-Host "Checking YouTube token..."
python -c "from sdlc._agency_assets.scripts.social import auth; creds=auth.youtube_load_google_creds(); tok=auth.Token(access_token=creds.token, refresh_token=creds.refresh_token, expires_at=creds.expiry.timestamp() if creds.expiry else 0, platform='youtube', raw={'token_path': str(auth._yt_creds_dir() / 'youtube_token.json'), 'scopes': auth.YT_DATA_SCOPES}); auth.save_token(tok); print('YouTube token ready')"

Write-Host ""
Write-Host "Final readiness check:"
python -m sdlc._agency_assets.scripts.social.preflight_video

