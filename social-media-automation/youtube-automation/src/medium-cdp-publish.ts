const CDP_URL = process.env.MEDIUM_CDP_URL ?? 'http://127.0.0.1:9222';
const POST_ID = process.env.MEDIUM_POST_ID ?? '927322a0ea0e';
const TAGS = (process.env.MEDIUM_TAGS ?? 'HIPAA,Healthcare IT,Cybersecurity,Compliance,Orange County')
  .split(',')
  .map((tag) => tag.trim())
  .filter(Boolean)
  .slice(0, 5);

type Target = {
  type: string;
  url: string;
  webSocketDebuggerUrl: string;
};

type CdpMessage = {
  id?: number;
  result?: unknown;
  error?: unknown;
};

async function command(ws: WebSocket, method: string, params: Record<string, unknown> = {}) {
  const id = command.nextId++;
  const payload = JSON.stringify({ id, method, params });

  return new Promise<CdpMessage>((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.removeEventListener('message', onMessage);
      reject(new Error(`Timed out waiting for ${method}`));
    }, 30_000);

    function onMessage(event: MessageEvent) {
      const message = JSON.parse(String(event.data)) as CdpMessage;
      if (message.id !== id) return;
      clearTimeout(timeout);
      ws.removeEventListener('message', onMessage);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message);
    }

    ws.addEventListener('message', onMessage);
    ws.send(payload);
  });
}

command.nextId = 1;

function openSocket(url: string) {
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

async function main() {
  const targets = (await fetch(`${CDP_URL}/json/list`).then((res) => res.json())) as Target[];
  const target = targets.find(
    (item) => item.type === 'page' && item.url.includes(`/p/${POST_ID}/submission`)
  );

  if (!target) {
    throw new Error(`Could not find Medium submission tab for ${POST_ID}`);
  }

  const ws = await openSocket(target.webSocketDebuggerUrl);

  try {
    await command(ws, 'Runtime.enable');
    await command(ws, 'Page.bringToFront');

    const clickResult = await command(ws, 'Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `
        (async () => {
          const textOf = (node) => (node.innerText || node.textContent || '').trim();
          const boxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
          const paywall = boxes[0];
          if (paywall?.checked) paywall.click();

          const input = document.querySelector('input[placeholder*="topic" i], input[placeholder*="tag" i]');
          if (input) {
            for (const tag of ${JSON.stringify(TAGS)}) {
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
          if (!publish) return { clicked: false, reason: 'Publish button not found', url: location.href, text: document.body.innerText.slice(0, 1000) };
          publish.click();
          await new Promise((resolve) => setTimeout(resolve, 15000));
          return { clicked: true, url: location.href, text: document.body.innerText.slice(0, 1000) };
        })()
      `,
    });

    console.log(JSON.stringify(clickResult.result, null, 2));
  } finally {
    ws.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
