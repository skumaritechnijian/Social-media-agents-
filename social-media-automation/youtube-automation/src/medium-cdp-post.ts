import { readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import matter from 'gray-matter';

const CDP_URL = process.env.MEDIUM_CDP_URL ?? 'http://127.0.0.1:9222';

type Target = {
  type: string;
  url: string;
  webSocketDebuggerUrl: string;
};

type Article = {
  title: string;
  body: string;
  tags: string[];
};

function parseArticle(filePath: string, cliTags: string[]): Article {
  const raw = readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  let body = content.trim();
  let title = typeof data.title === 'string' ? data.title.trim() : '';

  if (!title) {
    const match = body.match(/^#\s+(.+?)\s*$/m);
    if (match) {
      title = match[1].trim();
      body = body.replace(match[0], '').replace(/^\n+/, '').trim();
    }
  }

  if (!title) {
    title = basename(filePath, extname(filePath)).replace(/[-_]+/g, ' ');
  }

  const tags = [...new Set(cliTags)].slice(0, 5);
  return { title, body, tags };
}

async function openSocket(url: string) {
  return new Promise<WebSocket>((resolve, reject) => {
    const ws = new WebSocket(url);
    const timeout = setTimeout(() => reject(new Error('Timed out opening websocket')), 30_000);
    ws.addEventListener('open', () => {
      clearTimeout(timeout);
      resolve(ws);
    });
    ws.addEventListener('error', () => {
      clearTimeout(timeout);
      reject(new Error('WebSocket connection failed'));
    });
  });
}

let nextId = 1;
async function command(ws: WebSocket, method: string, params: Record<string, unknown> = {}) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params }));

  return new Promise<any>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), 45_000);
    function onMessage(event: MessageEvent) {
      const message = JSON.parse(String(event.data));
      if (message.id !== id) return;
      clearTimeout(timeout);
      ws.removeEventListener('message', onMessage);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    }
    ws.addEventListener('message', onMessage);
  });
}

async function waitFor(
  ws: WebSocket,
  expression: string,
  timeoutMs = 120_000,
  intervalMs = 1000
) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await command(ws, 'Runtime.evaluate', {
      returnByValue: true,
      expression,
    });
    if (result.result.value) return result.result.value;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Timed out waiting for expression: ${expression}`);
}

async function key(ws: WebSocket, keyValue: string, code: string, modifiers = 0) {
  await command(ws, 'Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: keyValue,
    code,
    windowsVirtualKeyCode: keyValue === 'Enter' ? 13 : 0,
    nativeVirtualKeyCode: keyValue === 'Enter' ? 13 : 0,
    modifiers,
  });
  await command(ws, 'Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: keyValue,
    code,
    windowsVirtualKeyCode: keyValue === 'Enter' ? 13 : 0,
    nativeVirtualKeyCode: keyValue === 'Enter' ? 13 : 0,
    modifiers,
  });
}

async function insertText(ws: WebSocket, text: string) {
  // Input.insertText handles punctuation and long prose more reliably than
  // synthesizing one key event per character.
  await command(ws, 'Input.insertText', { text });
}

async function main() {
  const argv = process.argv.slice(2);
  const tagsIdx = argv.indexOf('--tags');
  const tags =
    tagsIdx !== -1 && argv[tagsIdx + 1]
      ? argv[tagsIdx + 1].split(',').map((tag) => tag.trim()).filter(Boolean)
      : [];
  const filePath = argv.find((arg, index) => !arg.startsWith('--') && index !== tagsIdx + 1);
  if (!filePath) throw new Error('Usage: tsx src/medium-cdp-post.ts article.md --tags "a,b,c"');

  const article = parseArticle(filePath, tags);
  console.log(`Title: ${article.title}`);
  console.log(`Body: ${article.body.length} chars`);
  console.log(`Tags: ${article.tags.join(', ') || '(none)'}`);

  const target = (await fetch(`${CDP_URL}/json/new?${encodeURIComponent('https://medium.com/new-story')}`, {
    method: 'PUT',
  }).then((res) => res.json())) as Target;
  const ws = await openSocket(target.webSocketDebuggerUrl);

  try {
    await command(ws, 'Runtime.enable');
    await command(ws, 'Page.enable');
    await command(ws, 'Page.bringToFront');

    await waitFor(
      ws,
      `!!document.querySelector('h3[data-testid="editorTitleParagraph"], h3[data-testid="storyTitle"], h3[contenteditable="true"]')`
    );

    await command(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const title = document.querySelector('h3[data-testid="editorTitleParagraph"], h3[data-testid="storyTitle"], h3[contenteditable="true"]');
          title?.focus();
        })()
      `,
    });
    await insertText(ws, article.title);
    await key(ws, 'Enter', 'Enter');
    await new Promise((resolve) => setTimeout(resolve, 500));

    const blocks = article.body.split(/\n\n+/).map((block) => block.trim()).filter(Boolean);
    for (const [index, block] of blocks.entries()) {
      const lines = block.split('\n');
      for (const [lineIndex, line] of lines.entries()) {
        await insertText(ws, line);
        if (lineIndex < lines.length - 1) await key(ws, 'Enter', 'Enter', 8);
      }
      if (index < blocks.length - 1) {
        await key(ws, 'Enter', 'Enter');
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
    }

    console.log('Typed article, waiting for autosave...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await command(ws, 'Runtime.evaluate', {
      awaitPromise: true,
      expression: `
        (async () => {
          const textOf = (node) => (node.innerText || node.textContent || '').trim();
          const publish = Array.from(document.querySelectorAll('button'))
            .find((button) => /^Publish$/.test(textOf(button)));
          if (!publish) throw new Error('Editor Publish button not found');
          publish.click();
          await new Promise((resolve) => setTimeout(resolve, 4000));
        })()
      `,
    });

    await waitFor(
      ws,
      `location.href.includes('/submission') && !!Array.from(document.querySelectorAll('button')).find((button) => /^Publish$/.test((button.innerText || button.textContent || '').trim()))`,
      120_000
    );

    await command(ws, 'Runtime.evaluate', {
      awaitPromise: true,
      expression: `
        (async () => {
          const textOf = (node) => (node.innerText || node.textContent || '').trim();
          const boxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
          if (boxes[0]?.checked) boxes[0].click();

          const input = document.querySelector('input[placeholder*="topic" i], input[placeholder*="tag" i]');
          if (input) {
            for (const tag of ${JSON.stringify(article.tags)}) {
              input.focus();
              input.value = tag;
              input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: tag }));
              input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', code: 'Enter' }));
              input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter', code: 'Enter' }));
              await new Promise((resolve) => setTimeout(resolve, 250));
            }
          }

          const publish = Array.from(document.querySelectorAll('button'))
            .find((button) => /^Publish$/.test(textOf(button)));
          if (!publish) throw new Error('Final Publish button not found');
          publish.click();
          await new Promise((resolve) => setTimeout(resolve, 15000));
          return { url: location.href, text: document.body.innerText.slice(0, 1000) };
        })()
      `,
    });

    const done = await command(ws, 'Runtime.evaluate', {
      returnByValue: true,
      expression: `({ url: location.href, title: document.title, text: document.body.innerText.slice(0, 1200) })`,
    });
    console.log(JSON.stringify(done.result.value, null, 2));
  } finally {
    ws.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
