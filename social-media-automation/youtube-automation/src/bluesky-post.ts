import { readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';

interface BlueskySession {
  accessJwt: string;
  did: string;
}

function parseArgs(argv: string[]) {
  const filePath = argv[0];
  if (!filePath || filePath.startsWith('--')) {
    console.error('Usage: npm run bsky:post -- path/to/platform-posts.md');
    process.exit(1);
  }

  const imageIdx = argv.indexOf('--image');
  const imagePath = imageIdx !== -1 ? argv[imageIdx + 1] : undefined;
  const altIdx = argv.indexOf('--alt');
  const alt = altIdx !== -1 ? argv[altIdx + 1] : undefined;

  if (imageIdx !== -1 && !imagePath) {
    console.error('Missing image path after --image');
    process.exit(1);
  }

  return { filePath, imagePath, alt };
}

function extractBlueskyPost(markdown: string) {
  const match = markdown.match(/^## Bluesky\s+([\s\S]*?)(?=^##\s|$(?![\s\S]))/m);
  const text = (match?.[1] ?? markdown).trim();

  if (!text) {
    throw new Error('No Bluesky post text found.');
  }

  return text;
}

function buildFacets(text: string) {
  const facets = [];
  const urlPattern = /https?:\/\/[^\s]+/g;
  let match: RegExpExecArray | null;

  while ((match = urlPattern.exec(text)) !== null) {
    const uri = match[0];
    const prefix = text.slice(0, match.index);
    const byteStart = Buffer.byteLength(prefix, 'utf8');
    const byteEnd = byteStart + Buffer.byteLength(uri, 'utf8');

    facets.push({
      index: { byteStart, byteEnd },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri }]
    });
  }

  return facets;
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${body}`);
  }

  return JSON.parse(body) as T;
}

async function createSession(handle: string, appPassword: string): Promise<BlueskySession> {
  return requestJson<BlueskySession>('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      identifier: handle,
      password: appPassword
    })
  });
}

function mimeTypeFor(filePath: string) {
  const ext = extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  throw new Error(`Unsupported image extension: ${ext}`);
}

async function uploadImage(accessJwt: string, imagePath: string) {
  const absolutePath = resolve(imagePath);
  const bytes = readFileSync(absolutePath);

  if (bytes.byteLength > 1_000_000) {
    throw new Error(`Image is ${bytes.byteLength} bytes; Bluesky image uploads should be under 1MB.`);
  }

  return requestJson<{ blob: unknown }>('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessJwt}`,
      'content-type': mimeTypeFor(absolutePath)
    },
    body: bytes
  });
}

async function postToBluesky(text: string, imagePath?: string, alt?: string) {
  const handle = process.env.BSKY_HANDLE;
  const appPassword = process.env.BSKY_APP_PASSWORD;

  if (!handle || !appPassword) {
    throw new Error('Missing BSKY_HANDLE or BSKY_APP_PASSWORD environment variable.');
  }

  if (text.length > 300) {
    throw new Error(`Bluesky post is ${text.length} chars; limit is 300.`);
  }

  const session = await createSession(handle, appPassword);
  const uploadedImage = imagePath ? await uploadImage(session.accessJwt, imagePath) : undefined;
  const record = {
    text,
    facets: buildFacets(text),
    createdAt: new Date().toISOString(),
    ...(uploadedImage
      ? {
          embed: {
            $type: 'app.bsky.embed.images',
            images: [
              {
                alt: alt ?? 'HIPAA audit readiness checklist for Orange County healthcare practices',
                image: uploadedImage.blob
              }
            ]
          }
        }
      : {})
  };

  return requestJson('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${session.accessJwt}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record
    })
  });
}

const { filePath, imagePath, alt } = parseArgs(process.argv.slice(2));
const markdown = readFileSync(resolve(filePath), 'utf8');
const text = extractBlueskyPost(markdown);

console.log(`Posting to Bluesky (${text.length}/300 chars):\n`);
console.log(text);
if (imagePath) console.log(`\nImage: ${imagePath}`);
console.log('');

postToBluesky(text, imagePath, alt)
  .then((result) => {
    console.log('Bluesky post published.');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
