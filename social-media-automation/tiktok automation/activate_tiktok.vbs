Set sh = CreateObject("WScript.Shell")
If sh.AppActivate("TikTok") Then
  WScript.Echo "activated"
ElseIf sh.AppActivate("technijian") Then
  WScript.Echo "activated-technijian"
Else
  WScript.Echo "not-found"
End If
