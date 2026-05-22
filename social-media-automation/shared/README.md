# shared/ — Cross-post orchestrator

Thin glue that takes one blog and fans it out across the existing per-platform
harnesses in this folder. Does not re-implement platform logic — it reads
asset files Claude (via the `seo-copy-adapter` subagent) writes, then shells
out to `npm run` scripts in `youtube-automation/`, `x-automation/`, and
`tiktok automation/`.

## Setup (first time)

```powershell
npm install
```

## Workflow

### 1. Fetch a published blog post

```powershell
npm run fetch-wp -- --url https://tartanofredlands.com/some-slug/
```

Writes `posts/<slug>/source/{post.json, content.html, content.txt}`.

### 2. Generate per-platform copy

Use Claude's `/cross-post-blog` skill, or invoke the `seo-copy-adapter` agent
directly. It reads `posts/<slug>/source/` and writes:

```
posts/<slug>/
  medium/article.md         <- frontmatter title + body + tags
  bluesky/post.md           <- contains a "## Bluesky" section
  x/tweet.txt               <- <=280 chars
  youtube/{title.txt, description.txt, tags.txt}
  tiktok/caption.txt
```

For YouTube and TikTok you also need a `video.mp4` in the platform folder
(or pass `--video <path>` at run time).

### 3. Post

```powershell
# Dry-run first to see what would happen
npm run cross-post -- --slug some-slug --platforms medium,bluesky,x --dry-run

# Real run
npm run cross-post -- --slug some-slug --platforms medium,bluesky,x

# All platforms (requires video.mp4 for yt/tt)
npm run cross-post -- --slug some-slug --platforms all --visibility unlisted
```

Result summary written to `posts/<slug>/result.json`.

## Why this design

Each platform script in this monorepo already has its own input contract:
- YouTube: `npm run upload -- <file> --title ... --description-file ... --tags ...`
- Medium: `npm run md:post -- <article.md>`
- Bluesky: `npm run bsky:post -- <post.md>` (needs `BSKY_HANDLE` / `BSKY_APP_PASSWORD` env)
- X: `npm run post -- "<tweet text>"`
- TikTok: `node publish.cjs <video> <caption.txt>`

The orchestrator wraps all five with one CLI surface and per-slug state.

## Quora

No harness. The `/cross-post-blog` skill writes a draft answer to
`posts/<slug>/quora/draft.txt` for manual paste. Quora's ToS does not permit
automated posting.
