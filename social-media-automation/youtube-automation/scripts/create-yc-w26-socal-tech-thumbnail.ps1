Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot "..\assets"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outPath = Join-Path $outDir "yc-w26-socal-tech-thumbnail.png"

$width = 1280
$height = 720
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

function Brush([string]$hex) {
  return New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function PenX([string]$hex, [float]$size) {
  return New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml($hex), $size)
}

function FontX([float]$size, [System.Drawing.FontStyle]$style = [System.Drawing.FontStyle]::Regular) {
  return New-Object System.Drawing.Font("Arial", $size, $style)
}

function DrawText([string]$text, [System.Drawing.Font]$font, [System.Drawing.Brush]$brush, [int]$x, [int]$y) {
  $graphics.DrawString($text, $font, $brush, $x, $y)
}

function FillRoundRect([System.Drawing.Brush]$brush, [int]$x, [int]$y, [int]$w, [int]$h, [int]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $graphics.FillPath($brush, $path)
  $path.Dispose()
}

function StrokeRoundRect([System.Drawing.Pen]$pen, [int]$x, [int]$y, [int]$w, [int]$h, [int]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $graphics.DrawPath($pen, $path)
  $path.Dispose()
}

$bgRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $bgRect,
  [System.Drawing.ColorTranslator]::FromHtml("#04111f"),
  [System.Drawing.ColorTranslator]::FromHtml("#15243d"),
  12
)
$graphics.FillRectangle($bg, 0, 0, $width, $height)

$dark = Brush "#04111f"
$panel = Brush "#071827"
$white = Brush "#ffffff"
$muted = Brush "#b7c7d9"
$orange = Brush "#ff7a1a"
$gold = Brush "#ffd166"
$cyan = Brush "#24d3ee"
$blue = Brush "#2f80ed"
$green = Brush "#2bd576"
$pink = Brush "#ff4d8d"

# diagonal energy bands
$graphics.FillPolygon((Brush "#0b2b3f"), @(
  [System.Drawing.Point]::new(0, 0),
  [System.Drawing.Point]::new(1280, 0),
  [System.Drawing.Point]::new(1280, 92),
  [System.Drawing.Point]::new(0, 176)
))
$graphics.FillPolygon((Brush "#102f47"), @(
  [System.Drawing.Point]::new(0, 604),
  [System.Drawing.Point]::new(1280, 492),
  [System.Drawing.Point]::new(1280, 720),
  [System.Drawing.Point]::new(0, 720)
))

# subtle grid
$gridPen = PenX "#17364d" 1
for ($x = 0; $x -lt $width; $x += 64) { $graphics.DrawLine($gridPen, $x, 92, $x + 110, 720) }
for ($y = 96; $y -lt $height; $y += 54) { $graphics.DrawLine($gridPen, 0, $y, 1280, $y - 76) }

# header
DrawText "Technijian" (FontX 28 ([System.Drawing.FontStyle]::Bold)) $white 56 28
FillRoundRect $orange 1054 24 156 46 10
DrawText "YC W26" (FontX 25 ([System.Drawing.FontStyle]::Bold)) $white 1080 33

# main title
DrawText "YC W26" (FontX 96 ([System.Drawing.FontStyle]::Bold)) $white 62 144
DrawText "SOCAL TECH" (FontX 66 ([System.Drawing.FontStyle]::Bold)) $orange 62 260

# right visual board
FillRoundRect (Brush "#061522") 716 112 480 430 28
StrokeRoundRect (PenX "#24d3ee" 4) 716 112 480 430 28

# stylized SoCal route/map
$mapPen = PenX "#ffffff" 7
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddBezier(834, 174, 782, 230, 814, 300, 776, 354)
$path.AddBezier(776, 354, 742, 406, 808, 466, 898, 472)
$path.AddBezier(898, 472, 1008, 476, 1070, 398, 1042, 314)
$path.AddBezier(1042, 314, 1018, 238, 950, 190, 834, 174)
$graphics.DrawPath($mapPen, $path)
$path.Dispose()

$thin = PenX "#24d3ee" 3
$graphics.DrawLine($thin, 820, 250, 1046, 308)
$graphics.DrawLine($thin, 804, 358, 1026, 396)
$graphics.DrawLine($thin, 874, 186, 910, 472)
$graphics.DrawLine($thin, 986, 218, 930, 470)

# location dots and labels
$graphics.FillEllipse($orange, 858, 242, 30, 30)
$graphics.DrawEllipse((PenX "#ffffff" 4), 858, 242, 30, 30)
DrawText "LA" (FontX 25 ([System.Drawing.FontStyle]::Bold)) $white 814 232

$graphics.FillEllipse($cyan, 938, 370, 30, 30)
$graphics.DrawEllipse((PenX "#ffffff" 4), 938, 370, 30, 30)
DrawText "OC" (FontX 25 ([System.Drawing.FontStyle]::Bold)) $white 978 360

# growth nodes
$nodePen = PenX "#ffd166" 4
$graphics.DrawLine($nodePen, 814, 476, 882, 430)
$graphics.DrawLine($nodePen, 882, 430, 972, 454)
$graphics.DrawLine($nodePen, 972, 454, 1072, 380)
foreach ($pt in @(@(814,476),@(882,430),@(972,454),@(1072,380))) {
  $graphics.FillEllipse($gold, $pt[0]-10, $pt[1]-10, 20, 20)
}
# simple visual chips, kept light on text
FillRoundRect (Brush "#101f31") 66 432 210 76 14
FillRoundRect (Brush "#101f31") 306 432 250 76 14
StrokeRoundRect (PenX "#ff7a1a" 3) 66 432 210 76 14
StrokeRoundRect (PenX "#24d3ee" 3) 306 432 250 76 14
DrawText "AI" (FontX 38 ([System.Drawing.FontStyle]::Bold)) $orange 146 450
DrawText "OC + LA" (FontX 31 ([System.Drawing.FontStyle]::Bold)) $cyan 344 454

# footer bar
$graphics.FillRectangle((Brush "#03101a"), 0, 642, 1280, 78)
$graphics.FillRectangle($cyan, 0, 642, 1280, 6)
DrawText "AI STARTUPS  |  OC + LA  |  2026" (FontX 27 ([System.Drawing.FontStyle]::Bold)) $white 60 666
DrawText "technijian.com" (FontX 24 ([System.Drawing.FontStyle]::Bold)) $cyan 1030 668

$bitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()

Write-Host $outPath
