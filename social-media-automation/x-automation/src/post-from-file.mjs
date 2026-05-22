import { chromium } from "playwright";
import { existsSync, mkdirSync, readFileSync } from "node:fs";

const USER_DATA_DIR = process.env.X_USER_DATA_DIR || "auth/x-user-data";

async function launch() {
  if (!existsSync("auth")) mkdirSync("auth", { recursive: true });

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    locale: "en-US"
  });

  return {
    context,
    close: () => context.close()
  };
}

async function postTweet(text) {
  if (text.length > 280) {
    console.warn(`Warning: Tweet is ${text.length} chars. X may reject if >280.`);
  }

  const { context, close } = await launch();
  const page = await context.newPage();

  try {
    await page.goto("https://x.com/home", { waitUntil: "domcontentloaded" });

    const composeBtn = page.getByTestId("SideNav_NewTweet_Button");
    await composeBtn.waitFor({ state: "visible", timeout: 15_000 });
    await composeBtn.click();

    const textarea = page.getByTestId("tweetTextarea_0");
    await textarea.waitFor({ state: "visible" });
    await textarea.click();
    await page.keyboard.type(text, { delay: 15 });

    const postBtn = page.getByRole("button", { name: /^Post$/ }).last();
    await postBtn.click();

    await page.waitForSelector('[data-testid="tweetTextarea_0"]', {
      state: "detached",
      timeout: 10_000
    });

    console.log("Tweet posted.");
  } catch (err) {
    const path = `auth/error-${Date.now()}.png`;
    await page.screenshot({ path, fullPage: true });
    console.error(`Failed. See screenshot: ${path}`);
    throw err;
  } finally {
    await close();
  }
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node src/post-from-file.mjs <path-to-post-text>");
  process.exit(1);
}

const text = readFileSync(filePath, "utf8").trim();
postTweet(text).catch((err) => {
  console.error(err);
  process.exit(1);
});
