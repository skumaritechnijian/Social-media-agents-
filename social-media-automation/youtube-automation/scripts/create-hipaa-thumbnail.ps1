Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot "..\assets"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outPath = Join-Path $outDir "hipaa-audit-2026-thumbnail.png"

$width = 1280
$height = 720
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

function Brush([string]$hex) {
  return New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function Pen([string]$hex, [float]$size) {
  return New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml($hex), $size)
}

$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Rectangle(0, 0, $width, $height)),
  [System.Drawing.ColorTranslator]::FromHtml("#f6fbff"),
  [System.Drawing.ColorTranslator]::FromHtml("#dcebf5"),
  0
)
$graphics.FillRectangle($bg, 0, 0, $width, $height)

$blue = Brush "#1f6fb2"
$navy = Brush "#102033"
$teal = Brush "#0f9d8e"
$white = Brush "#ffffff"
$muted = Brush "#5d6d7e"
$red = Brush "#c9504c"
$gold = Brush "#d49a24"

$graphics.FillRectangle((Brush "#17324d"), 0, 0, 1280, 92)
$graphics.FillRectangle($teal, 0, 92, 1280, 8)

$brandFont = New-Object System.Drawing.Font("Arial", 30, [System.Drawing.FontStyle]::Bold)
$graphics.DrawString("Technijian", $brandFont, $white, 62, 26)

$badgeFont = New-Object System.Drawing.Font("Arial", 25, [System.Drawing.FontStyle]::Bold)
$graphics.FillRectangle($red, 62, 130, 300, 62)
$graphics.DrawString("HIPAA AUDIT", $badgeFont, $white, 86, 146)

$yearFont = New-Object System.Drawing.Font("Arial", 58, [System.Drawing.FontStyle]::Bold)
$graphics.DrawString("2026", $yearFont, $gold, 396, 120)

$titleFont = New-Object System.Drawing.Font("Arial", 62, [System.Drawing.FontStyle]::Bold)
$graphics.DrawString("OC Healthcare", $titleFont, $navy, 62, 230)
$graphics.DrawString("Audit Checklist", $titleFont, $navy, 62, 315)

$subFont = New-Object System.Drawing.Font("Arial", 27, [System.Drawing.FontStyle]::Bold)
$graphics.DrawString("SRA  |  BAAs  |  MFA  |  Audit Logs", $subFont, $muted, 66, 430)

$graphics.FillRectangle($white, 66, 508, 455, 92)
$graphics.DrawRectangle((Pen "#d8e3eb" 3), 66, 508, 455, 92)
$ctaFont = New-Object System.Drawing.Font("Arial", 30, [System.Drawing.FontStyle]::Bold)
$graphics.DrawString("Prepare Before OCR Calls", $ctaFont, $blue, 92, 535)

$graphics.FillEllipse((Brush "#e8f2f9"), 850, 158, 350, 350)
$graphics.DrawEllipse((Pen "#1f6fb2" 10), 850, 158, 350, 350)
$graphics.FillRectangle($white, 928, 238, 205, 260)
$graphics.DrawRectangle((Pen "#17324d" 6), 928, 238, 205, 260)

$docFont = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Bold)
$graphics.DrawString("OCR", $docFont, $navy, 1002, 260)
$graphics.DrawLine((Pen "#0f9d8e" 8), 958, 330, 1100, 330)
$graphics.DrawLine((Pen "#0f9d8e" 8), 958, 372, 1100, 372)
$graphics.DrawLine((Pen "#0f9d8e" 8), 958, 414, 1100, 414)
$graphics.DrawString("CHECK", $docFont, $red, 972, 452)

$graphics.FillRectangle((Brush "#17324d"), 0, 650, 1280, 70)
$footerFont = New-Object System.Drawing.Font("Arial", 25, [System.Drawing.FontStyle]::Bold)
$graphics.DrawString("technijian.com  |  (949) 379-8500", $footerFont, $white, 62, 668)

$bitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()

Write-Host $outPath
