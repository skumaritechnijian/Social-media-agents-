#Requires AutoHotkey v2.0
SetTitleMatchMode 2
CoordMode "Mouse", "Window"

uploadUrl := "https://www.tiktok.com/tiktokstudio/upload?from=webapp&lang=en&tab=video"
videoPath := "d:\UserProfile\skumari\Downloads\SEO Pricing.mp4"
caption := "Orange County SEO pricing in 2026 depends on competition, content scope, and growth goals. Read the full guide: https://technijian.com/seo/seo-pricing-oc-2026-the-complete-guide-to-what-orange-county-businesses-actually-pay/ #SEO #SEOPricing #OrangeCountySEO #DigitalMarketing #LeadGeneration"

if WinExist("TikTok ahk_exe chrome.exe") {
    WinActivate "TikTok ahk_exe chrome.exe"
    WinMaximize "TikTok ahk_exe chrome.exe"
} else if WinExist("technijian ahk_exe chrome.exe") {
    WinActivate "technijian ahk_exe chrome.exe"
    WinMaximize "technijian ahk_exe chrome.exe"
} else if WinExist("TikTok") {
    WinActivate "TikTok"
    WinMaximize "TikTok"
} else {
    MsgBox "Logged-in TikTok Chrome window not found"
    ExitApp
}

Sleep 1200
Send "^l"
Sleep 300
A_Clipboard := uploadUrl
ClipWait 2
Send "^v"
Sleep 200
Send "{Enter}"
Sleep 12000

; Click visible Select video button on TikTok Studio upload page.
Click 955, 386
Sleep 1800
A_Clipboard := videoPath
ClipWait 2
Send "^v"
Sleep 200
Send "{Enter}"

; Wait for upload/processing page.
Sleep 60000

; Try caption area clicks in the right column.
Click 1085, 255
Sleep 800
Click 1085, 255
Sleep 500
Send "^a"
Sleep 200
Send "{Backspace}"
Sleep 300
A_Clipboard := caption
ClipWait 2
Send "^v"
Sleep 2000

; Try likely Post button area.
Click 1450, 830
Sleep 8000
ExitApp
