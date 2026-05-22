Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot "..\assets"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outPath = Join-Path $outDir "technical-debt-oc-startups-thumbnail.png"

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
  [System.Drawing.ColorTranslator]::FromHtml("#101820"),
  [System.Drawing.ColorTranslator]::FromHtml("#20313f"),
  25
)
$graphics.FillRectangle($bg, 0, 0, $width, $height)

$navy = Brush "#101820"
$deep = Brush "#132638"
$blue = Brush "#2f80ed"
$teal = Brush "#0f9d8e"
$white = Brush "#ffffff"
$muted = Brush "#b7c6d8"
$red = Brush "#c9504c"
$gold = Brush "#ffbf3f"
$green = Brush "#1f9d68"
$orange = Brush "#f97316"
$panel = Brush "#f6f8fb"

$points = New-Object System.Drawing.Point[] 4
$points[0] = New-Object System.Drawing.Point(0, 0)
$points[1] = New-Object System.Drawing.Point(820, 0)
$points[2] = New-Object System.Drawing.Point(650, 720)
$points[3] = New-Object System.Drawing.Point(0, 720)
$graphics.FillPolygon((Brush "#f4f8fb"), $points)

$graphics.FillRectangle($deep, 0, 0, 1280, 76)
$graphics.FillRectangle($orange, 0, 76, 1280, 7)

$brandFont = New-Object System.Drawing.Font("Arial", 28, [System.Drawing.FontStyle]::Bold)
DrawText "Technijian" $brandFont $white 54 20

$miniFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
$graphics.FillRectangle($orange, 54, 118, 220, 50)
DrawText "OC STARTUPS" $miniFont $white 78 132

$yearFont = New-Object System.Drawing.Font("Arial", 46, [System.Drawing.FontStyle]::Bold)
DrawText "2026" $yearFont $gold 306 106

$titleFont = New-Object System.Drawing.Font("Arial", 76, [System.Drawing.FontStyle]::Bold)
DrawText "Technical" $titleFont $navy 54 205
DrawText "Debt" $titleFont $navy 54 300

$impactFont = New-Object System.Drawing.Font("Arial", 40, [System.Drawing.FontStyle]::Bold)
DrawText "The Hidden Cost" $impactFont $red 58 405

$subFont = New-Object System.Drawing.Font("Arial", 25, [System.Drawing.FontStyle]::Bold)
DrawText "AI delays. Security risk. Lost velocity." $subFont (Brush "#425466") 60 466

$graphics.FillRectangle($navy, 54, 535, 420, 72)
$ctaFont = New-Object System.Drawing.Font("Arial", 25, [System.Drawing.FontStyle]::Bold)
DrawText "Fix Before It Scales" $ctaFont $white 82 556

$graphics.FillRectangle((Brush "#0b141d"), 760, 128, 430, 360)
$graphics.DrawRectangle((Pen "#2f80ed" 4), 760, 128, 430, 360)
$graphics.FillRectangle((Brush "#172536"), 760, 128, 430, 54)
$windowFont = New-Object System.Drawing.Font("Consolas", 17, [System.Drawing.FontStyle]::Bold)
DrawText "debt-audit.dashboard" $windowFont $muted 786 146

$smallFont = New-Object System.Drawing.Font("Arial", 19, [System.Drawing.FontStyle]::Bold)
DrawText "Code Complexity" $smallFont $muted 794 214
DrawText "Security Debt" $smallFont $muted 794 300
DrawText "Test Coverage" $smallFont $muted 794 386

$graphics.FillRectangle((Brush "#c9504c"), 794, 246, 302, 22)
$graphics.FillRectangle((Brush "#2f80ed"), 794, 332, 230, 22)
$graphics.FillRectangle((Brush "#f97316"), 794, 418, 140, 22)

$valueFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
DrawText "HIGH" $valueFont $white 1110 240
DrawText "RISING" $valueFont $white 1040 326
DrawText "LOW" $valueFont $white 950 412

$graphics.FillEllipse($red, 1018, 510, 170, 88)
$moneyFont = New-Object System.Drawing.Font("Arial", 44, [System.Drawing.FontStyle]::Bold)
DrawText "$$$" $moneyFont $white 1061 524

$graphics.DrawLine((Pen "#ffbf3f" 8), 676, 556, 1008, 556)
$graphics.DrawLine((Pen "#ffbf3f" 8), 1008, 556, 970, 520)
$graphics.DrawLine((Pen "#ffbf3f" 8), 1008, 556, 970, 592)

$graphics.FillRectangle($deep, 0, 650, 1280, 70)
$footerFont = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Bold)
DrawText "Software Development Assessment  |  technijian.com  |  (949) 379-8500" $footerFont $white 54 668

$bitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()

Write-Host $outPath
