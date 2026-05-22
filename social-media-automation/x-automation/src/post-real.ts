// Post to X using real Chrome + persistent profile + X compose intent.
// Usage:
//   npm run post:real -- "tweet text"
//   npm run post:real -- --file ../shared/posts/post.txt

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { launchRealChrome } from "./browser-real.js";

function parseText(argv: string[]) {
  const fileIdx = argv.indexOf("--file");
  if (fileIdx !== -1) {
    const filePath = argv[fileIdx + 1];
    if (!filePath) throw new Error("Missing path after --file.");
    const absolute = resolve(filePath);
    if (!existsSync(absolute)) throw new Error(`File not found: ${absolute}`);
    return readFileSync(absolute, "utf8").trim();
  }
  return argv.join(" ").trim();
}

async function waitForLoginOrComposer(page: Awaited<ReturnType<Awaited<ReturnType<typeof launchRealChrome>>["context"]["newPage"]>>) {
  const started = Date.now();
  const timeoutMs = 10 * 60 * 1000;

  while (Date.now() - started < timeoutMs) {
    const postButton = await page.getByRole("button", { name: /^(Post|Tweet)$/i }).last()
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    const textArea = await page.getByTestId("tweetTextarea_0").first()
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    if (postButton || textArea) return;

    const body = await page.locator("body").innerText({ timeout: 1000 }).catch(() => "");
    if (/Log in|Sign in|phone, email, or username/i.test(body)) {
      console.log("X needs login in the visible Chrome window. Log in there; automation will continue.");
    }
    await page.waitForTimeout(3000);
  }

  throw new Error("Timed out waiting for X composer. Login may not be complete.");
}

async function main() {
  const text = parseText(process.argv.slice(2));
  if (!text) throw new Error('Usage: npm run post:real -- "tweet text"');
  if (text.length > 280) {
    throw new Error(`X post is ${text.length} characters; limit is 280.`);
  }

  const { context, close } = await launchRealChrome();
  const page = context.pages()[0] ?? (await context.newPage());
  const intentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;

  try {
    await page.goto(intentUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60_000
    });

    await waitForLoginOrComposer(page);

    const composer = page.getByTestId("tweetTextarea_0").first();
    if (await composer.isVisible({ timeout: 5000 }).catch(() => false)) {
      const current = await composer.innerText().catch(() => "");
      if (!current.includes(text.slice(0, 24))) {
        await composer.click();
        await page.keyboard.press("Control+A").catch(() => undefined);
        await page.keyboard.press("Backspace").catch(() => undefined);
        await page.keyboard.type(text, { delay: 8 });
      }
    }

    const postButton = page.getByRole("button", { name: /^(Post|Tweet)$/i }).last();
    await postButton.waitFor({ state: "visible", timeout: 30_000 });
    await postButton.click();
    await page.waitForTimeout(6000);

    await page.screenshot({ path: "auth/x-real-post-confirmation.png", fullPage: true }).catch(() => undefined);
    console.log("X post action completed.");
    console.log("Screenshot: auth/x-real-post-confirmation.png");
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
