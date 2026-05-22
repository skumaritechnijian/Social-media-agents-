import { chromium as patchedChromium } from 'patchright';
import { chromium, type BrowserContext } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';

// Dedicated browser profile for Medium automation. Uses patchright's patched
// Chromium so Cloudflare's bot detection doesn't flag the browser. Independent
// of the user's real Chrome.
export const USER_DATA_DIR = 'auth/medium-patchright-profile';

export async function launch(): Promise<{
  context: BrowserContext;
  close: () => Promise<void>;
}> {
  if (!existsSync('auth')) mkdirSync('auth', { recursive: true });

  if (process.env.MEDIUM_CDP_URL) {
    const browser = await chromium.connectOverCDP(process.env.MEDIUM_CDP_URL, { timeout: 120_000 });
    const context = browser.contexts()[0] ?? (await browser.newContext());
    return { context, close: async () => undefined };
  }

  const context = await patchedChromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    viewport: { width: 1366, height: 900 },
    locale: 'en-US',
  });

  return { context: context as unknown as BrowserContext, close: () => context.close() };
}
