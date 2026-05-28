$ErrorActionPreference = "Stop"

Write-Host "Checking Twitter/X, TikTok, and Bluesky credential readiness..."
python -m sdlc._agency_assets.scripts.social.preflight_core

Write-Host ""
Write-Host "Starting one-time auth for Bluesky..."
python -m sdlc._agency_assets.scripts.social.cli auth bluesky

Write-Host ""
Write-Host "Starting one-time auth for X..."
python -m sdlc._agency_assets.scripts.social.cli auth x

Write-Host ""
Write-Host "Starting one-time auth for TikTok..."
python -m sdlc._agency_assets.scripts.social.cli auth tiktok

Write-Host ""
Write-Host "Final readiness check:"
python -m sdlc._agency_assets.scripts.social.preflight_core

