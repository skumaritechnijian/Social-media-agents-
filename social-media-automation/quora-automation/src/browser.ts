// Patchright-based Chromium launcher for Quora automation. Persistent profile
// keeps cookies/session between runs. Patchright handles Cloudflare-style
// bot fingerprinting; Quora uses Cloudflare and aggressive heuristics.

import { chromium as patchedChromium } from 'patchright';
import { chromium, type BrowserContext } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';

export const USER_DATA_DIR = 'auth/quora-patchright-profile';

export async function launch(): Promise<{
  context: BrowserContext;
  close: () => Promise<void>;
}> {
  if (!existsSync('auth')) mkdirSync('auth', { recursive: true });

  const context = await patchedChromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    viewport: { width: 1366, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'en-US'
  });

  return {
    context: context as unknown as BrowserContext,
    close: () => context.close()
  };
}
