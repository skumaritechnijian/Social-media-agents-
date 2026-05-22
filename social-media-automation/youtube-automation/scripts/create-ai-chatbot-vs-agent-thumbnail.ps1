Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot "..\assets"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outPath = Join-Path $outDir "ai-chatbot-vs-ai-agent-oc-business-thumbnail.png"

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
  [System.Drawing.ColorTranslator]::FromHtml("#07111f"),
  [System.Drawing.ColorTranslator]::FromHtml("#123d4f"),
  22
)
$graphics.FillRectangle($bg, 0, 0, $width, $height)

$navy = Brush "#07111f"
$panel = Brush "#0f1f33"
$agentPanel = Brush "#0f3a35"
$blue = Brush "#2f80ed"
$teal = Brush "#16c7b7"
$white = Brush "#ffffff"
$muted = Brush "#c4d2e4"
$gold = Brush "#ffbf3f"
$green = Brush "#22c55e"
$red = Brush "#ef4444"

$graphics.FillRectangle((Brush "#06101c"), 0, 0, 1280, 84)
$graphics.FillRectangle($teal, 0, 84, 1280, 7)
$brandFont = New-Object System.Drawing.Font("Arial", 28, [System.Drawing.FontStyle]::Bold)
DrawText "Technijian" $brandFont $white 56 24

$guideFont = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Bold)
$graphics.FillRectangle($gold, 872, 24, 342, 44)
DrawText "OC BUSINESS GUIDE" $guideFont $navy 902 34

$titleFont = New-Object System.Drawing.Font("Arial", 58, [System.Drawing.FontStyle]::Bold)
DrawText "AI Chatbot" $titleFont $white 82 128
DrawText "AI Agent" $titleFont $white 780 128

$graphics.DrawLine((Pen "#ffffff" 2), 640, 112, 640, 612)
$graphics.DrawLine((Pen "#16c7b7" 7), 640, 112, 640, 612)

$vsFont = New-Object System.Drawing.Font("Arial", 48, [System.Drawing.FontStyle]::Bold)
$graphics.FillEllipse($gold, 570, 244, 140, 140)
$graphics.DrawEllipse((Pen "#ffffff" 6), 570, 244, 140, 140)
DrawText "VS" $vsFont $navy 602 280

$graphics.FillRectangle($panel, 78, 238, 462, 278)
$graphics.DrawRectangle((Pen "#2f80ed" 5), 78, 238, 462, 278)
$graphics.FillRectangle($agentPanel, 742, 238, 462, 278)
$graphics.DrawRectangle((Pen "#16c7b7" 5), 742, 238, 462, 278)

$labelFont = New-Object System.Drawing.Font("Arial", 31, [System.Drawing.FontStyle]::Bold)
DrawText "Answers" $labelFont $blue 246 266
DrawText "Acts" $labelFont $green 928 266

$bodyFont = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Bold)
DrawText "FAQs" $bodyFont $muted 292 344
DrawText "Lead capture" $bodyFont $muted 236 390
DrawText "Simple support" $bodyFont $muted 218 436

DrawText "Uses tools" $bodyFont $muted 950 344
DrawText "Runs workflows" $bodyFont $muted 922 390
DrawText "Connects apps" $bodyFont $muted 930 436

$iconPen = Pen "#ffffff" 7
$graphics.DrawRectangle($iconPen, 130, 316, 74, 58)
$graphics.DrawArc($iconPen, 150, 356, 34, 34, 180, -80)
$graphics.FillEllipse($blue, 146, 336, 10, 10)
$graphics.FillEllipse($blue, 176, 336, 10, 10)

$nodePen = Pen "#ffffff" 6
$graphics.FillEllipse($green, 790, 326, 34, 34)
$graphics.FillEllipse($green, 790, 430, 34, 34)
$graphics.FillEllipse($green, 880, 378, 34, 34)
$graphics.DrawLine($nodePen, 824, 344, 880, 394)
$graphics.DrawLine($nodePen, 824, 448, 880, 394)

$subFont = New-Object System.Drawing.Font("Arial", 28, [System.Drawing.FontStyle]::Bold)
DrawText "Conversation" $subFont $white 186 548
DrawText "Automation" $subFont $white 880 548

$graphics.FillRectangle((Brush "#06101c"), 0, 650, 1280, 70)
$footerFont = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Bold)
DrawText "Choose the right AI before you automate / technijian.com" $footerFont $white 56 668

$bitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()

Write-Host $outPath
