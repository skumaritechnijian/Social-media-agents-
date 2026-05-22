// Cross-post a single blog to N platforms. Reads per-platform asset files
// produced by the SEO copy adapter (Claude subagent), then shells out to the
// existing per-platform npm scripts.
//
// Expected layout under ../posts/<slug>/:
//   source/             (from fetch-wp-post.ts)
//   medium/article.md          -> frontmatter title + body + tags
//   bluesky/post.md            -> contains a "## Bluesky" section
//   x/tweet.txt                -> plain text, <=280 chars
//   youtube/{title.txt,description.txt,tags.txt} + video.mp4 (you provide)
//   tiktok/caption.txt + video.mp4 (you provide)
//   result.json                (written here)
//
// Usage:
//   npm run cross-post -- --slug some-slug --platforms medium,bluesky,x
//   npm run cross-post -- --slug some-slug --platforms all --dry-run
//   npm run cross-post -- --slug some-slug --platforms youtube --video ./local.mp4

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

type Platform = 'medium' | 'bluesky' | 'x' | 'youtube' | 'tiktok';
const ALL_PLATFORMS: Platform[] = ['medium', 'bluesky', 'x', 'youtube', 'tiktok'];

interface Args {
  slug: string;
  platforms: Platform[];
  dryRun: boolean;
  video?: string;
  visibility: 'private' | 'unlisted' | 'public';
  mediumDraft: boolean;
}

interface PlatformResult {
  platform: Platform;
  ok: boolean;
  durationMs: number;
  stdout: string;
  stderr: string;
  skipped?: string;
}

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');
const POSTS_ROOT = resolve(HERE, '..', 'posts');

const PLATFORM_DIRS: Record<Platform, string> = {
  medium: resolve(REPO_ROOT, 'youtube-automation'),
  bluesky: resolve(REPO_ROOT, 'youtube-automation'),
  youtube: resolve(REPO_ROOT, 'youtube-automation'),
  x: resolve(REPO_ROOT, 'x-automation'),
  tiktok: resolve(REPO_ROOT, 'tiktok automation')
};

function parseArgs(argv: string[]): Args {
  let slug: string | undefined;
  let platformsArg: string | undefined;
  let video: string | undefined;
  let visibility: Args['visibility'] = 'private';
  let dryRun = false;
  let mediumDraft = false;

  for (let i = 0; i < argv.length; i += 1) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--slug') { slug = v; i += 1; }
    else if (k === '--platforms') { platformsArg = v; i += 1; }
    else if (k === '--video') { video = v; i += 1; }
    else if (k === '--visibility') { visibility = v as Args['visibility']; i += 1; }
    else if (k === '--dry-run') { dryRun = true; }
    else if (k === '--medium-draft') { mediumDraft = true; }
  }

  if (!slug || !platformsArg) {
    console.error('Usage: npm run cross-post -- --slug <slug> --platforms medium,bluesky,x [--video file] [--visibility private|unlisted|public] [--dry-run]');
    process.exit(1);
  }

  const platforms: Platform[] =
    platformsArg === 'all'
      ? ALL_PLATFORMS
      : platformsArg.split(',').map((p) => p.trim() as Platform);

  for (const p of platforms) {
    if (!ALL_PLATFORMS.includes(p)) {
      console.error(`Unknown platform: ${p}. Valid: ${ALL_PLATFORMS.join(', ')}`);
      process.exit(1);
    }
  }

  return { slug, platforms, dryRun, video, visibility, mediumDraft };
}

function postDir(slug: string, platform: Platform) {
  return resolve(POSTS_ROOT, slug, platform);
}

function quoteForShell(arg: string): string {
  if (process.platform !== 'win32') return arg;
  if (!/[\s"]/.test(arg)) return arg;
  return `"${arg.replace(/"/g, '\\"')}"`;
}

function runNpm(cwd: string, script: string, scriptArgs: string[], extraEnv?: Record<string, string>): { stdout: string; stderr: string; code: number } {
  const isWin = process.platform === 'win32';
  const cmd = isWin ? 'npm.cmd' : 'npm';
  const rawArgs = ['run', script, '--', ...scriptArgs];
  const args = isWin ? rawArgs.map(quoteForShell) : rawArgs;
  const result = spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...extraEnv },
    shell: isWin
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    code: result.status ?? -1
  };
}

function runNode(cwd: string, script: string, scriptArgs: string[]): { stdout: string; stderr: string; code: number } {
  const result = spawnSync(process.execPath, [script, ...scriptArgs], {
    cwd,
    encoding: 'utf8',
    shell: false
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    code: result.status ?? -1
  };
}

function platformCommand(p: Platform, slug: string, args: Args): { cwd: string; runner: 'npm' | 'node'; script: string; scriptArgs: string[]; preflightError?: string } {
  const dir = postDir(slug, p);

  switch (p) {
    case 'medium': {
      const md = resolve(dir, 'article.md');
      if (!existsSync(md)) return preflightFail(p, `missing ${md}`);
      const script = args.mediumDraft ? 'md:draft' : 'md:post';
      return { cwd: PLATFORM_DIRS.medium, runner: 'npm', script, scriptArgs: [md] };
    }
    case 'bluesky': {
      const md = resolve(dir, 'post.md');
      if (!existsSync(md)) return preflightFail(p, `missing ${md}`);
      return { cwd: PLATFORM_DIRS.bluesky, runner: 'npm', script: 'bsky:post', scriptArgs: [md] };
    }
    case 'x': {
      const txt = resolve(dir, 'tweet.txt');
      if (!existsSync(txt)) return preflightFail(p, `missing ${txt}`);
      const tweet = readFileSync(txt, 'utf8').trim();
      if (tweet.length > 280) return preflightFail(p, `tweet is ${tweet.length} chars (>280)`);
      return { cwd: PLATFORM_DIRS.x, runner: 'npm', script: 'post', scriptArgs: [tweet] };
    }
    case 'youtube': {
      const title = resolve(dir, 'title.txt');
      const desc = resolve(dir, 'description.txt');
      const tags = resolve(dir, 'tags.txt');
      const video = args.video ?? resolve(dir, 'video.mp4');
      for (const f of [title, desc, video]) {
        if (!existsSync(f)) return preflightFail('youtube', `missing ${f}`);
      }
      const titleStr = readFileSync(title, 'utf8').trim();
      const tagsStr = existsSync(tags) ? readFileSync(tags, 'utf8').trim() : '';
      return {
        cwd: PLATFORM_DIRS.youtube,
        runner: 'npm',
        script: 'upload',
        scriptArgs: [
          video,
          '--title', titleStr,
          '--description-file', desc,
          ...(tagsStr ? ['--tags', tagsStr] : []),
          '--visibility', args.visibility
        ]
      };
    }
    case 'tiktok': {
      const caption = resolve(dir, 'caption.txt');
      const video = args.video ?? resolve(dir, 'video.mp4');
      if (!existsSync(caption)) return preflightFail('tiktok', `missing ${caption}`);
      if (!existsSync(video)) return preflightFail('tiktok', `missing ${video}`);
      return {
        cwd: PLATFORM_DIRS.tiktok,
        runner: 'node',
        script: 'publish.cjs',
        scriptArgs: [video, caption]
      };
    }
  }
}

function preflightFail(p: Platform, reason: string): ReturnType<typeof platformCommand> {
  return { cwd: '', runner: 'npm', script: '', scriptArgs: [], preflightError: reason };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const results: PlatformResult[] = [];

  for (const platform of args.platforms) {
    const start = Date.now();
    const cmd = platformCommand(platform, args.slug, args);

    if (cmd.preflightError) {
      results.push({ platform, ok: false, durationMs: 0, stdout: '', stderr: '', skipped: cmd.preflightError });
      console.log(`[${platform}] SKIPPED: ${cmd.preflightError}`);
      continue;
    }

    if (args.dryRun) {
      console.log(`[${platform}] DRY-RUN: ${cmd.runner} ${cmd.script} ${cmd.scriptArgs.map((a) => /\s/.test(a) ? `"${a}"` : a).join(' ')}  (cwd: ${cmd.cwd})`);
      results.push({ platform, ok: true, durationMs: 0, stdout: 'dry-run', stderr: '' });
      continue;
    }

    console.log(`[${platform}] running...`);
    const r = cmd.runner === 'npm'
      ? runNpm(cmd.cwd, cmd.script, cmd.scriptArgs)
      : runNode(cmd.cwd, cmd.script, cmd.scriptArgs);

    const ok = r.code === 0;
    results.push({
      platform,
      ok,
      durationMs: Date.now() - start,
      stdout: r.stdout.slice(-2000),
      stderr: r.stderr.slice(-2000)
    });
    console.log(`[${platform}] ${ok ? 'OK' : `FAIL (exit ${r.code})`}`);
    if (!ok && r.stderr) console.log(r.stderr.split('\n').slice(-10).join('\n'));
  }

  const summary = {
    slug: args.slug,
    timestamp: new Date().toISOString(),
    platforms: args.platforms,
    visibility: args.visibility,
    results
  };
  const outFile = resolve(POSTS_ROOT, args.slug, 'result.json');
  writeFileSync(outFile, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`\nSummary written to ${outFile}`);

  const anyFail = results.some((r) => !r.ok);
  process.exit(anyFail ? 1 : 0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
