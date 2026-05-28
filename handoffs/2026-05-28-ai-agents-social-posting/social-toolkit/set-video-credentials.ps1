param(
  [string]$KeysDir = "$env:USERPROFILE\OneDrive - Technijian, Inc\Documents\VSCODE\keys"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $KeysDir | Out-Null
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.creds\google" | Out-Null

function Read-PlainSecret {
  param([string]$Prompt)
  $secure = Read-Host -Prompt $Prompt -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

function Write-Utf8NoBom {
  param([string]$Path, [string[]]$Lines)
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllLines($Path, $Lines, $enc)
  Write-Host "Wrote $Path"
}

Write-Host ""
Write-Host "Enter real X and TikTok developer credentials. Values are not echoed."
Write-Host "YouTube OAuth files are expected under %USERPROFILE%\.creds\google."
Write-Host ""

$xClientId = Read-PlainSecret "X client_id"
$xClientSecret = Read-PlainSecret "X client_secret"
Write-Utf8NoBom -Path (Join-Path $KeysDir "x.md") -Lines @(
  "client_id: $xClientId",
  "client_secret: $xClientSecret",
  "redirect_uri: http://localhost:8768/x-callback"
)

$ttClientKey = Read-PlainSecret "TikTok client_key"
$ttClientSecret = Read-PlainSecret "TikTok client_secret"
$ttUsername = Read-Host -Prompt "TikTok username without @"
Write-Utf8NoBom -Path (Join-Path $KeysDir "tiktok.md") -Lines @(
  "client_key: $ttClientKey",
  "client_secret: $ttClientSecret",
  "redirect_uri: http://localhost:8769/tt-callback",
  "username: $ttUsername"
)

$ytChannel = Read-Host -Prompt "YouTube channel_id override (optional; press Enter to use authenticated channel)"
if ($ytChannel) {
  Write-Utf8NoBom -Path (Join-Path $KeysDir "youtube.md") -Lines @("channel_id: $ytChannel")
} else {
  Write-Utf8NoBom -Path (Join-Path $KeysDir "youtube.md") -Lines @("# channel_id is optional; authenticated channel will be used")
}

Write-Host ""
Write-Host "Now run:"
Write-Host "python -m sdlc._agency_assets.scripts.social.preflight_video"

