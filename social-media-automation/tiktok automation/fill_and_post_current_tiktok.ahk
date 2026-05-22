#Requires AutoHotkey v2.0
SetTitleMatchMode 2
CoordMode "Mouse", "Window"

captionPath := "d:\UserProfile\skumari\OneDrive - Technijian, Inc\Microsoft Teams Chat Files\Technjijian-Seo-Team-work-main\Technjijian-Seo-Team-work-main\sdlc\clients\Saroj - X Twitter YouTube TikTok Medium Bluesky\tiktok automation\seo-pricing-oc-2026-tiktok-post.txt"
caption := FileRead(captionPath, "UTF-8")

if WinExist("TikTok Studio ahk_exe chrome.exe") {
    WinActivate "TikTok Studio ahk_exe chrome.exe"
    WinMaximize "TikTok Studio ahk_exe chrome.exe"
} else if WinExist("TikTok ahk_exe chrome.exe") {
    WinActivate "TikTok ahk_exe chrome.exe"
    WinMaximize "TikTok ahk_exe chrome.exe"
} else if WinExist("technijian ahk_exe chrome.exe") {
    WinActivate "technijian ahk_exe chrome.exe"
    WinMaximize "technijian ahk_exe chrome.exe"
} else {
    MsgBox "TikTok Chrome window not found"
    ExitApp
}

Sleep 1500
; Try several likely caption-field positions on the current upload details page.
for point in [[1085,255],[1040,285],[1110,320],[1030,350]] {
    Click point[1], point[2]
    Sleep 400
}

Send "^a"
Sleep 200
Send "{Backspace}"
Sleep 300
A_Clipboard := Trim(caption)
ClipWait 2
Send "^v"
Sleep 2000

; Try the likely post button area twice.
Click 1450, 830
Sleep 1500
Click 1450, 830
Sleep 8000
ExitApp
