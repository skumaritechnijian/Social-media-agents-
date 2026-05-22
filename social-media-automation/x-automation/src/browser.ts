// Shared launcher: opens a patchright Chromium (anti-bot patched) with a
// persistent profile so X remembers us between runs (cookies, fingerprint, etc.).
// We switched from bundled playwright to patchright because X's Akamai-based
// bot detection invalidated playwright sessions within minutes of login.

import { chromium as patchedChromium } from "patchright";
import { chromium, type BrowserContext } from "playwright";
import { existsSync, mkdirSync } from "node:fs";

// Fresh profile dir for the patchright runtime — the old auth/x-user-data was
// poisoned by Linux-UA login attempts that X already flagged.
export const USER_DATA_DIR = "auth/x-patchright-profile";

export async function launch(): Promise<{
  context: BrowserContext;
  close: () => Promise<void>;
}> {
  if (!existsSync("auth")) mkdirSync("auth", { recursive: true });

  const context = await patchedChromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false, // visible window - X detects headless aggressively
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    locale: "en-US"
  });

  return {
    context: context as unknown as BrowserContext,
    close: () => context.close()
  };
}
