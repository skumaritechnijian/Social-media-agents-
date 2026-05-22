// Shared launcher. Persistent profile so Google trusts the device
// between runs. Fresh fingerprints can trigger "verify it's you"
// flows constantly.

import { chromium, type BrowserContext } from "playwright";
import { existsSync, mkdirSync } from "node:fs";

export const USER_DATA_DIR = "auth/yt-user-data";

export async function launch(): Promise<{
  context: BrowserContext;
  close: () => Promise<void>;
}> {
  if (!existsSync("auth")) mkdirSync("auth", { recursive: true });

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false, // Google flags headless aggressively - keep visible
    viewport: { width: 1366, height: 900 },
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    locale: "en-US",
    acceptDownloads: true
  });

  return {
    context,
    close: () => context.close()
  };
}
