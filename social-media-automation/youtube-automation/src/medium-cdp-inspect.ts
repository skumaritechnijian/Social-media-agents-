const CDP_URL = process.env.MEDIUM_CDP_URL ?? 'http://127.0.0.1:9222';
const POST_ID = process.env.MEDIUM_POST_ID ?? '927322a0ea0e';

type Target = {
  type: string;
  url: string;
  webSocketDebuggerUrl: string;
};

async function openSocket(url: string) {
  return new Promise<WebSocket>((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.addEventListener('open', () => resolve(ws));
    ws.addEventListener('error', () => reject(new Error('WebSocket connection failed')));
  });
}

let nextId = 1;
async function command(ws: WebSocket, method: string, params: Record<string, unknown> = {}) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params }));

  return new Promise<any>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), 30_000);
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

async function main() {
  const targets = (await fetch(`${CDP_URL}/json/list`).then((res) => res.json())) as Target[];
  const target = targets.find((item) => item.type === 'page' && item.url.includes(POST_ID));
  if (!target) throw new Error(`Could not find Medium tab for ${POST_ID}`);

  const ws = await openSocket(target.webSocketDebuggerUrl);
  try {
    await command(ws, 'Runtime.enable');
    await command(ws, 'Page.bringToFront');
    if (process.env.MEDIUM_OPEN_MORE === '1') {
      await command(ws, 'Runtime.evaluate', {
        awaitPromise: true,
        expression: `
          (async () => {
            document.querySelector('[data-testid="publishSuccessCloseButton"]')?.click();
            await new Promise((resolve) => setTimeout(resolve, 500));
            document.querySelector('[data-testid="headerStoryOptionsButton"]')?.click();
            await new Promise((resolve) => setTimeout(resolve, 1000));
          })()
        `,
      });
    }
    if (process.env.MEDIUM_CLICK_DELETE === '1') {
      await command(ws, 'Runtime.evaluate', {
        awaitPromise: true,
        expression: `
          (async () => {
            const textOf = (node) => (node.innerText || node.textContent || '').trim();
            document.querySelector('[data-testid="publishSuccessCloseButton"]')?.click();
            Array.from(document.querySelectorAll('button')).find((button) => textOf(button) === 'Okay, got it')?.click();
            await new Promise((resolve) => setTimeout(resolve, 500));
            document.querySelector('[data-testid="headerStoryOptionsButton"]')?.click();
            await new Promise((resolve) => setTimeout(resolve, 500));
            const deleteButton = Array.from(document.querySelectorAll('button'))
              .find((button) => textOf(button) === 'Delete story');
            deleteButton?.click();
            await new Promise((resolve) => setTimeout(resolve, 1000));
          })()
        `,
      });
    }
    if (process.env.MEDIUM_SETTINGS === '1') {
      await command(ws, 'Page.navigate', { url: `https://medium.com/p/${POST_ID}/settings` });
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    if (process.env.MEDIUM_NAV_URL) {
      await command(ws, 'Page.navigate', { url: process.env.MEDIUM_NAV_URL });
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    if (process.env.MEDIUM_SETTINGS_DELETE === '1') {
      await command(ws, 'Page.navigate', { url: `https://medium.com/p/${POST_ID}/settings` });
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await command(ws, 'Runtime.evaluate', {
        awaitPromise: true,
        expression: `
          (async () => {
            const textOf = (node) => (node.innerText || node.textContent || '').trim();
            const deleteButton = Array.from(document.querySelectorAll('button'))
              .find((button) => textOf(button) === 'Delete story');
            deleteButton?.scrollIntoView({ block: 'center' });
            deleteButton?.click();
            await new Promise((resolve) => setTimeout(resolve, 1500));
          })()
        `,
      });
    }
    if (process.env.MEDIUM_CONFIRM_DELETE === '1') {
      await command(ws, 'Runtime.evaluate', {
        awaitPromise: true,
        expression: `
          (async () => {
            document.querySelector('[data-testid="deleteStoryModalConfirmButton"]')?.click();
            await new Promise((resolve) => setTimeout(resolve, 5000));
          })()
        `,
      });
    }
    if (process.env.MEDIUM_SUMMARY === '1') {
      const summary = await command(ws, 'Runtime.evaluate', {
        returnByValue: true,
        expression: `
          (() => ({
            url: location.href,
            title: document.title,
            headings: Array.from(document.querySelectorAll('h1,h2,h3'))
              .map((el) => ({
                tag: el.tagName,
                text: (el.innerText || el.textContent || '').trim(),
              }))
              .filter((item) => item.text)
              .slice(0, 12),
            firstBlocks: Array.from(document.querySelectorAll('article p, article h1, article h2, article h3'))
              .map((el) => ({
                tag: el.tagName,
                text: (el.innerText || el.textContent || '').trim(),
              }))
              .filter((item) => item.text)
              .slice(0, 12),
          }))()
        `,
      });
      console.log(JSON.stringify(summary.result.value, null, 2));
      return;
    }
    const result = await command(ws, 'Runtime.evaluate', {
      returnByValue: true,
      expression: `
        (() => {
          const describe = (el) => ({
            tag: el.tagName,
            text: (el.innerText || el.textContent || '').trim().slice(0, 120),
            value: el.value || '',
            placeholder: el.getAttribute('placeholder'),
            name: el.getAttribute('name'),
            id: el.getAttribute('id'),
            html: (el.innerHTML || '').slice(0, 500),
            aria: el.getAttribute('aria-label'),
            title: el.getAttribute('title'),
            href: el.href || null,
            role: el.getAttribute('role'),
            testid: el.getAttribute('data-testid'),
          });
          return {
            url: location.href,
            title: document.title,
            editables: Array.from(document.querySelectorAll('[contenteditable="true"], textarea, input')).map(describe),
            buttons: Array.from(document.querySelectorAll('button')).map(describe),
            links: Array.from(document.querySelectorAll('a')).map(describe).filter((x) => x.text || x.aria || x.href),
          };
        })()
      `,
    });
    console.log(JSON.stringify(result.result.value, null, 2));
  } finally {
    ws.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
