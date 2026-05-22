// Fetch a public WordPress post by URL or slug. Writes JSON + HTML to disk so
// the SEO copy adapter (Claude subagent) can read it without re-fetching.
//
// Usage:
//   npm run fetch-wp -- --url https://tartanofredlands.com/some-slug/
//   npm run fetch-wp -- --site https://tartanofredlands.com --slug some-slug
//
// Output: ../posts/<slug>/source/{post.json, content.html, content.txt}

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

const HERE = dirname(fileURLToPath(import.meta.url));
const POSTS_ROOT = resolve(HERE, '..', 'posts');

interface Args {
  site: string;
  slug: string;
  outDir: string;
}

function parseArgs(argv: string[]): Args {
  let url: string | undefined;
  let site: string | undefined;
  let slug: string | undefined;
  let outDir: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--url') { url = v; i += 1; }
    else if (k === '--site') { site = v; i += 1; }
    else if (k === '--slug') { slug = v; i += 1; }
    else if (k === '--out') { outDir = v; i += 1; }
  }

  if (url) {
    const u = new URL(url);
    site = `${u.protocol}//${u.host}`;
    slug = u.pathname.replace(/^\/+|\/+$/g, '').split('/').pop() ?? '';
  }

  if (!site || !slug) {
    console.error('Usage: npm run fetch-wp -- --url <post-url>   OR   --site <site> --slug <slug>');
    process.exit(1);
  }

  return {
    site: site.replace(/\/+$/, ''),
    slug,
    outDir: outDir ?? resolve(POSTS_ROOT, slug, 'source')
  };
}

async function main() {
  const { site, slug, outDir } = parseArgs(process.argv.slice(2));

  const apiUrl = `${site}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`WP fetch failed: ${res.status} ${res.statusText}`);
  const posts = (await res.json()) as Array<Record<string, unknown>>;
  if (posts.length === 0) throw new Error(`No post found for slug "${slug}" at ${site}`);

  const post = posts[0];
  const html = String((post.content as { rendered?: string })?.rendered ?? '');
  const title = String((post.title as { rendered?: string })?.rendered ?? slug);
  const excerpt = String((post.excerpt as { rendered?: string })?.rendered ?? '');
  const link = String(post.link ?? `${site}/${slug}/`);

  const root = parse(html);
  const text = root.text.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'post.json'), JSON.stringify({
    id: post.id, slug, title, link, excerpt, date: post.date, modified: post.modified
  }, null, 2), 'utf8');
  writeFileSync(resolve(outDir, 'content.html'), html, 'utf8');
  writeFileSync(resolve(outDir, 'content.txt'), text, 'utf8');

  console.log(JSON.stringify({
    ok: true, slug, title, link,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    outDir
  }, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
