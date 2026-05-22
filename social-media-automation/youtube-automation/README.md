# YouTube Automation

Official YouTube Data API automation for login, upload, update, and stats.

## Setup

1. In Google Cloud Console, create an OAuth client for a desktop app or web app.
2. Add this redirect URI if using a web app client:

```text
http://localhost:53682/oauth2callback
```

3. Download the OAuth JSON and save it as:

```text
auth/client_secret.json
```

4. Run:

```powershell
npm.cmd run login
```

## Commands

Upload private video:

```powershell
npm.cmd run upload -- ".\video.mp4" "Video title" "Video description"
```

Update metadata or visibility:

```powershell
npm.cmd run update -- VIDEO_ID --title "New title"
npm.cmd run update -- VIDEO_ID --description "New description"
npm.cmd run update -- VIDEO_ID --visibility public
```

Read stats:

```powershell
npm.cmd run stats -- VIDEO_ID
```
