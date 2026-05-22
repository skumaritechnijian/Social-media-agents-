// Post a tweet: `npm run post -- "your tweet text"`

import { launch } from "./browser.js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

async function postTweet(text: string) {
  if (text.length > 280) {
    console.warn(`Warning: Tweet is ${text.length} chars. X may reject if >280.`);
  }

  const { context, close } = await launch();
  const page = await context.newPage();

  try {
    await page.goto("https://x.com/home", {
      waitUntil: "domcontentloaded",
      timeout: 60_000
    });

    // Open the composer modal.
    const composeBtn = page.getByTestId("SideNav_NewTweet_Button");
    await composeBtn.waitFor({ state: "visible", timeout: 15_000 });
    await composeBtn.click();

    // Type into the contenteditable. Use type(), not fill().
    // It is a Draft.js editor, not a real input.
    const textarea = page.getByTestId("tweetTextarea_0");
    await textarea.waitFor({ state: "visible" });
    await textarea.click();
    await page.keyboard.type(text, { delay: 15 });

    // Click "Post" - the button in the open modal.
    const postBtn = page.getByRole("button", { name: /^Post$/ }).last();
    await postBtn.click();

    // Wait for the modal to close as confirmation.
    await page.waitForSelector('[data-testid="tweetTextarea_0"]', {
      state: "detached",
      timeout: 10_000
    });

    console.log("Tweet posted.");
  } catch (err) {
    console.error(`Original error: ${(err as Error)?.message ?? err}`);
    if ((err as Error)?.stack) console.error((err as Error).stack);
    const path = `auth/error-${Date.now()}.png`;
    try {
      await page.screenshot({ path, fullPage: true });
      console.error(`Screenshot: ${path}`);
    } catch (screenshotErr) {
      console.error(`Could not capture screenshot (page closed): ${(screenshotErr as Error)?.message ?? screenshotErr}`);
    }
    throw err;
  } finally {
    await close();
  }
}

const argv = process.argv.slice(2);
const fileIdx = argv.indexOf("--file");
const text =
  fileIdx !== -1
    ? (() => {
        const filePath = argv[fileIdx + 1];
        if (!filePath) throw new Error("Missing path after --file");
        const absolutePath = resolve(filePath);
        if (!existsSync(absolutePath)) throw new Error(`File not found: ${absolutePath}`);
        return readFileSync(absolutePath, "utf8").trim();
      })()
    : argv.join(" ");
if (!text) {
  console.error('Usage: npm run post -- "your tweet text"');
  console.error('   or: npm run post -- --file ./tweet.txt');
  process.exit(1);
}

postTweet(text).catch((err) => {
  console.error("UNCAUGHT:", err?.message ?? err);
  if (err?.stack) console.error(err.stack);
  process.exit(1);
});
