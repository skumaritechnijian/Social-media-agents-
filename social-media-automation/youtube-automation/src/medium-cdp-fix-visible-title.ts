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

async function main() {
  const target = (await fetch(`${CDP_URL}/json/new?${encodeURIComponent(`https://medium.com/p/${POST_ID}/edit`)}`, {
    method: 'PUT',
  }).then((res) => res.json())) as Target;

  const ws = await openSocket(target.webSocketDebuggerUrl);
  try {
    await command(ws, 'Runtime.enable');
    await command(ws, 'Page.enable');
    await command(ws, 'Page.bringToFront');
    await new Promise((resolve) => setTimeout(resolve, 7000));

    const result = await command(ws, 'Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `
        (async () => {
          const titleText = ${JSON.stringify(TITLE)};
          const textOf = (node) => (node.innerText || node.textContent || '').trim();
          const editor = document.querySelector('[contenteditable="true"][role="textbox"]');
          if (!editor) throw new Error('Editor not found');

          let firstGraf = Array.from(editor.querySelectorAll('.graf'))
            .find((graf) => textOf(graf).includes(titleText.slice(0, 40)));
          if (!firstGraf) firstGraf = editor.querySelector('.graf') || editor;

          firstGraf.scrollIntoView({ block: 'center' });
          const range = document.createRange();
          range.selectNodeContents(firstGraf);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          firstGraf.focus?.();
          editor.focus();

          await new Promise((resolve) => setTimeout(resolve, 500));
          const bigger = Array.from(document.querySelectorAll('button'))
            .find((button) => button.querySelector('.svgIcon--tBigger'));
          if (!bigger) throw new Error('Heading button not found');
          bigger.click();
          await new Promise((resolve) => setTimeout(resolve, 500));
          bigger.click();
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const save = Array.from(document.querySelectorAll('button'))
            .find((button) => textOf(button) === 'Save and publish');
          if (!save) throw new Error('Save and publish button not found');
          save.click();
          await new Promise((resolve) => setTimeout(resolve, 9000));

          return {
            url: location.href,
            title: document.title,
            firstGrafTag: firstGraf.tagName,
            firstGrafClass: firstGraf.className,
            firstGrafText: textOf(firstGraf).slice(0, 200),
            bodyStart: document.body.innerText.slice(0, 500),
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
