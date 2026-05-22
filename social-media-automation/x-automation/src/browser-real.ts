import { chromium, type BrowserContext } from "playwright";
import { existsSync, mkdirSync } from "node:fs";

export const USER_DATA_DIR = "auth/x-real-chrome-profile";

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
  ].filter(Boolean) as string[];

  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error("Chrome not found. Set CHROME_PATH to chrome.exe.");
  }
  return found;
}

export async function launchRealChrome(): Promise<{
  context: BrowserContext;
  close: () => Promise<void>;
}> {
  if (!existsSync("auth")) mkdirSync("auth", { recursive: true });
  if (!existsSync(USER_DATA_DIR)) mkdirSync(USER_DATA_DIR, { recursive: true });

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    executablePath: chromePath(),
    headless: false,
    viewport: null,
    locale: "en-US",
    args: [
      "--start-maximized",
      "--disable-blink-features=AutomationControlled",
      "--no-first-run"
    ]
  });

  return {
    context,
    close: () => context.close()
  };
}
