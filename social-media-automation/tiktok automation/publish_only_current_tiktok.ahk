#Requires AutoHotkey v2.0
SetTitleMatchMode 2
CoordMode "Mouse", "Window"

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
    ExitApp
}

Sleep 1500
; Try likely Publish/Post button locations on TikTok Studio.
for point in [[1450,830],[1410,820],[1380,825],[1465,780],[1425,780],[1350,780]] {
    Click point[1], point[2]
    Sleep 1200
}

; Also try keyboard confirmation in case focus reached the button.
Send "{Tab 3}"
Sleep 500
Send "{Enter}"
Sleep 1000
Send "{Enter}"
Sleep 5000
ExitApp
