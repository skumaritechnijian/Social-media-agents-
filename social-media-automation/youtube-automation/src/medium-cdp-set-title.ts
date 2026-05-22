const CDP_URL = process.env.MEDIUM_CDP_URL ?? 'http://127.0.0.1:9222';
const POST_ID = process.env.MEDIUM_POST_ID ?? '36b8f1530aea';
const TITLE =
  process.env.MEDIUM_TITLE ??
  'Technical Debt Is Costing OC Startups More Than They Realize: A 2026 Reckoning';

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

async function waitFor(ws: WebSocket, expression: string, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await command(ws, 'Runtime.evaluate', {
      returnByValue: true,
      expression,
    });
    if (result.result.value) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Timed out waiting for ${expression}`);
}

async function main() {
  const target = (await fetch(`${CDP_URL}/json/new?${encodeURIComponent(`https://medium.com/p/${POST_ID}/edit`)}`, {
    method: 'PUT',
  }).then((res) => res.json())) as Target;

  const ws = await openSocket(target.webSocketDebuggerUrl);
  try {
    await command(ws, 'Runtime.enable');
    await command(ws, 'Page.enable');
    await command(ws, 'Page.bringToFront');

    await waitFor(ws, `!!document.querySelector('[contenteditable="true"][role="textbox"], h3[contenteditable="true"]')`);

    await command(ws, 'Runtime.evaluate', {
      awaitPromise: true,
      expression: `
        (async () => {
          const title = document.querySelector('h3[data-testid="editorTitleParagraph"], h3[data-testid="storyTitle"], h3[contenteditable="true"]');
          const editor = title || document.querySelector('[contenteditable="true"][role="textbox"]');
          if (!editor) throw new Error('Editable element not found');
          editor.focus();
          const range = document.createRange();
          if (title) {
            range.selectNodeContents(title);
          } else {
            const firstGraf = editor.querySelector('.graf') || editor.firstChild || editor;
            if (firstGraf.firstChild) range.setStart(firstGraf.firstChild, 0);
            else range.setStart(firstGraf, 0);
            range.collapse(true);
          }
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        })()
      `,
    });

    await command(ws, 'Input.insertText', { text: TITLE });
    await command(ws, 'Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Enter',
      code: 'Enter',
      windowsVirtualKeyCode: 13,
      nativeVirtualKeyCode: 13,
    });
    await command(ws, 'Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'Enter',
      code: 'Enter',
      windowsVirtualKeyCode: 13,
      nativeVirtualKeyCode: 13,
    });
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await command(ws, 'Runtime.evaluate', {
      awaitPromise: true,
      expression: `
        (async () => {
          const textOf = (node) => (node.innerText || node.textContent || '').trim();
          const save = Array.from(document.querySelectorAll('button')).find((button) => textOf(button) === 'Save and publish');
          save?.click();
          await new Promise((resolve) => setTimeout(resolve, 8000));
        })()
      `,
    });

    const result = await command(ws, 'Runtime.evaluate', {
      returnByValue: true,
      expression: `({
        url: location.href,
        documentTitle: document.title,
        editorTitle: (document.querySelector('h3[data-testid="editorTitleParagraph"], h3[data-testid="storyTitle"], h3[contenteditable="true"], [contenteditable="true"][role="textbox"]')?.innerText || '').trim().slice(0, 200),
        bodyStart: document.body.innerText.slice(0, 800)
      })`,
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
