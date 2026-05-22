Option Explicit

Dim videoPath, caption
videoPath = "d:\UserProfile\skumari\Downloads\SEO Pricing.mp4"
caption = "Orange County SEO pricing in 2026 depends on competition, content scope, and growth goals. Read the full guide: https://technijian.com/seo/seo-pricing-oc-2026-the-complete-guide-to-what-orange-county-businesses-actually-pay/ #SEO #SEOPricing #OrangeCountySEO #DigitalMarketing #LeadGeneration"

Dim sh
Set sh = CreateObject("WScript.Shell")

If Not sh.AppActivate("TikTok") Then
  If Not sh.AppActivate("technijian") Then
    WScript.Echo "TikTok window not found"
    WScript.Quit 1
  End If
End If

WScript.Sleep 1200
TabTimes 6
Send "{ENTER}"
WScript.Sleep 1800
SendText videoPath
Send "{ENTER}"
WScript.Sleep 40000

TabTimes 10
WScript.Sleep 400
Send "{ENTER}"
WScript.Sleep 500
Send "^a"
WScript.Sleep 300
Send "{BACKSPACE}"
WScript.Sleep 400
SendText caption
WScript.Sleep 1500

TabTimes 8
WScript.Sleep 400
Send "{ENTER}"
WScript.Sleep 6000
WScript.Echo "Done"

Sub TabTimes(n)
  Dim i
  For i = 1 To n
    Send "{TAB}"
    WScript.Sleep 250
  Next
End Sub

Sub Send(keys)
  sh.SendKeys keys
End Sub

Sub SendText(txt)
  Dim i, ch
  For i = 1 To Len(txt)
    ch = Mid(txt, i, 1)
    Send EscapeChar(ch)
    WScript.Sleep 20
  Next
End Sub

Function EscapeChar(ch)
  Select Case ch
    Case "{": EscapeChar = "{{}"
    Case "}": EscapeChar = "{}}"
    Case "+": EscapeChar = "{+}"
    Case "^": EscapeChar = "{^}"
    Case "%": EscapeChar = "{%}"
    Case "~": EscapeChar = "{~}"
    Case "(": EscapeChar = "{(}"
    Case ")": EscapeChar = "{)}"
    Case "[": EscapeChar = "{[}"
    Case "]": EscapeChar = "{]}"
    Case vbCr: EscapeChar = ""
    Case vbLf: EscapeChar = "{ENTER}"
    Case Else: EscapeChar = ch
  End Select
End Function
