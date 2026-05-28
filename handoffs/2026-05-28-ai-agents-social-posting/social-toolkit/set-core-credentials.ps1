param(
  [string]$KeysDir = "$env:USERPROFILE\OneDrive - Technijian, Inc\Documents\VSCODE\keys"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $KeysDir | Out-Null

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

function Write-KeyFile {
  param(
    [string]$Path,
    [string[]]$Lines
  )
  Set-Content -LiteralPath $Path -Value $Lines -Encoding UTF8
  Write-Host "Wrote $Path"
}

Write-Host ""
Write-Host "Enter real credentials. Values are not echoed to the console."
Write-Host "Press Ctrl+C to cancel."
Write-Host ""

$xClientId = Read-PlainSecret "X client_id"
$xClientSecret = Read-PlainSecret "X client_secret"
Write-KeyFile -Path (Join-Path $KeysDir "x.md") -Lines @(
  "client_id: $xClientId",
  "client_secret: $xClientSecret",
  "redirect_uri: http://localhost:8768/x-callback"
)

$ttClientKey = Read-PlainSecret "TikTok client_key"
$ttClientSecret = Read-PlainSecret "TikTok client_secret"
$ttUsername = Read-Host -Prompt "TikTok username without @"
Write-KeyFile -Path (Join-Path $KeysDir "tiktok.md") -Lines @(
  "client_key: $ttClientKey",
  "client_secret: $ttClientSecret",
  "redirect_uri: http://localhost:8769/tt-callback",
  "username: $ttUsername"
)

$bskyHandle = Read-Host -Prompt "Bluesky handle"
$bskyAppPassword = Read-PlainSecret "Bluesky app_password"
Write-KeyFile -Path (Join-Path $KeysDir "bluesky.md") -Lines @(
  "handle: $bskyHandle",
  "app_password: $bskyAppPassword"
)

Write-Host ""
Write-Host "Credential files updated. Run:"
Write-Host "python -m sdlc._agency_assets.scripts.social.preflight_core"

