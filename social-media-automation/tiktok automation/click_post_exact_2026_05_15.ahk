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

Sleep 1200
Click 378, 811
Sleep 1000
Click 378, 811
Sleep 4000
ExitApp
