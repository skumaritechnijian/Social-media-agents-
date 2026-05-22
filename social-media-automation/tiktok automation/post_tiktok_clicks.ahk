#Requires AutoHotkey v2.0
SetTitleMatchMode 2
CoordMode "Mouse", "Window"

videoPath := "d:\UserProfile\skumari\Downloads\SEO Pricing.mp4"
caption := "Orange County SEO pricing in 2026 depends on competition, content scope, and growth goals. Read the full guide: https://technijian.com/seo/seo-pricing-oc-2026-the-complete-guide-to-what-orange-county-businesses-actually-pay/ #SEO #SEOPricing #OrangeCountySEO #DigitalMarketing #LeadGeneration"

if WinExist("TikTok Studio") {
    WinActivate "TikTok Studio"
    WinMaximize "TikTok Studio"
} else if WinExist("TikTok") {
    WinActivate "TikTok"
    WinMaximize "TikTok"
} else if WinExist("technijian") {
    WinActivate "technijian"
    WinMaximize "technijian"
} else {
    MsgBox "TikTok window not found"
    ExitApp
}

Sleep 1500
; Select video button on the open upload page.
Click 955, 386
Sleep 1500
SendText videoPath
Sleep 300
Send "{Enter}"

; Wait for video upload/processing view.
Sleep 50000

; Caption editor area in the right column.
Click 1085, 255
Sleep 800
Send "^a"
Sleep 200
Send "{Backspace}"
Sleep 300
A_Clipboard := caption
ClipWait 2
Send "^v"

Sleep 2000
; Post button near lower-right.
Click 1450, 830
Sleep 6000
ExitApp
