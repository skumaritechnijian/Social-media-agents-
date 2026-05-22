Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot "..\assets"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outPath = Join-Path $outDir "technical-seo-audit-oc-2026-thumbnail.png"

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

function DrawText([string]$text, [System.Drawing.Font]$font, [System.Drawing.Brush]$brush, [int]$x, [int]$y) {
  $graphics.DrawString($text, $font, $brush, $x, $y)
}

$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Rectangle(0, 0, $width, $height)),
  [System.Drawing.ColorTranslator]::FromHtml("#f7fbff"),
  [System.Drawing.ColorTranslator]::FromHtml("#dfeaf3"),
  15
)
$graphics.FillRectangle($bg, 0, 0, $width, $height)

$navy = Brush "#102033"
$deep = Brush "#17324d"
$blue = Brush "#1f6fb2"
$teal = Brush "#0f9d8e"
$white = Brush "#ffffff"
$muted = Brush "#536579"
$orange = Brush "#f97316"
$green = Brush "#1f9d68"
$red = Brush "#c9504c"

$graphics.FillRectangle($deep, 0, 0, 1280, 86)
$graphics.FillRectangle($teal, 0, 86, 1280, 8)

$brandFont = New-Object System.Drawing.Font("Arial", 29, [System.Drawing.FontStyle]::Bold)
DrawText "Technijian" $brandFont $white 58 25

$pillFont = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Bold)
$graphics.FillRectangle($orange, 58, 128, 252, 58)
DrawText "SEO AUDIT" $pillFont $white 88 145

$yearFont = New-Object System.Drawing.Font("Arial", 50, [System.Drawing.FontStyle]::Bold)
DrawText "2026" $yearFont (Brush "#d49a24") 342 120

$titleFont = New-Object System.Drawing.Font("Arial", 64, [System.Drawing.FontStyle]::Bold)
DrawText "Technical SEO" $titleFont $navy 58 230
DrawText "Checklist" $titleFont $navy 58 315

$subFont = New-Object System.Drawing.Font("Arial", 27, [System.Drawing.FontStyle]::Bold)
DrawText "Crawlability | Speed | Schema | Indexing" $subFont $muted 62 428

$graphics.FillRectangle($navy, 62, 520, 390, 76)
$ctaFont = New-Object System.Drawing.Font("Arial", 27, [System.Drawing.FontStyle]::Bold)
DrawText "Find Ranking Issues" $ctaFont $white 92 540

$graphics.FillRectangle($white, 760, 136, 390, 390)
$graphics.DrawRectangle((Pen "#c8d7e4" 4), 760, 136, 390, 390)
$graphics.FillRectangle((Brush "#e9f2f8"), 760, 136, 390, 58)
$dashFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
DrawText "SEO Health Dashboard" $dashFont $navy 790 154

$labelFont = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Bold)
DrawText "Indexing" $labelFont $muted 800 235
DrawText "Core Web Vitals" $labelFont $muted 800 315
DrawText "Schema" $labelFont $muted 800 395

$graphics.FillRectangle($green, 800, 268, 250, 22)
$graphics.FillRectangle($orange, 800, 348, 178, 22)
$graphics.FillRectangle($blue, 800, 428, 300, 22)

$scoreFont = New-Object System.Drawing.Font("Arial", 26, [System.Drawing.FontStyle]::Bold)
DrawText "92" $scoreFont $green 1070 254
DrawText "71" $scoreFont $orange 1000 334
DrawText "OK" $scoreFont $blue 1118 414

$graphics.DrawEllipse((Pen "#1f6fb2" 10), 1018, 470, 160, 160)
$graphics.DrawLine((Pen "#1f6fb2" 12), 1134, 586, 1210, 648)
$graphics.FillEllipse((Brush "#f7fbff"), 1045, 496, 106, 106)
$checkFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
DrawText "CHECK" $checkFont $green 1063 535

$graphics.FillRectangle($deep, 0, 650, 1280, 70)
$footerFont = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Bold)
$footer = "technijian.com / (949) 379-8500"
DrawText $footer $footerFont $white 58 668

$bitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()

Write-Host $outPath
