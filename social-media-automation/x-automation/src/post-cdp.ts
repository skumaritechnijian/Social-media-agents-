import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const CDP_URL = process.env.CHROME_CDP_URL ?? "http://127.0.0.1:9222";

function parseArgs(argv: string[]) {
  const fileIdx = argv.indexOf("--file");
  if (fileIdx !== -1) {
    const filePath = argv[fileIdx + 1];
    if (!filePath) throw new Error("Missing path after --file");
    return readFileSync(resolve(filePath), "utf8").trim();
  }
  return argv.join(" ").trim();
}

async function main() {
  const text = parseArgs(process.argv.slice(2));
  if (!text) throw new Error('Usage: tsx src/post-cdp.ts --file "../path/post.txt"');
  if (text.length > 280) {
    console.warn(`Tweet is ${text.length} chars. X may reject if >280.`);
  }

  const browser = await chromium.connectOverCDP(CDP_URL);
  const context = browser.contexts()[0] ?? (await browser.newContext());
  const page = context.pages().find((candidate) => /x\.com|twitter\.com/.test(candidate.url()))
    ?? (await context.newPage());

  await page.goto("https://x.com/home", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(3000);

  const pageText = await page.locator("body").innerText({ timeout: 10_000 }).catch(() => "");
  if (/Sign in to X|Log in|Sign in/i.test(pageText) && !/What.?s happening/i.test(pageText)) {
    console.log("X appears to need login in the visible Chrome window. Log in, then rerun this command.");
    await browser.close();
    process.exit(2);
  }

  const composer = page.getByTestId("tweetTextarea_0").first();
  if (!(await composer.isVisible({ timeout: 10_000 }).catch(() => false))) {
    const newPost = page.getByTestId("SideNav_NewTweet_Button").first();
    await newPost.click({ timeout: 10_000 }).catch(async () => {
      await page.getByRole("button", { name: /^Post$/i }).first().click({ timeout: 10_000 });
    });
  }

  await composer.waitFor({ state: "visible", timeout: 30_000 });
  await composer.click();
  await page.keyboard.type(text, { delay: 10 });

  const postButton = page.getByRole("button", { name: /^Post$/ }).last();
  await postButton.click();
  await page.waitForTimeout(5000);

  console.log("X/Twitter post action completed.");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
