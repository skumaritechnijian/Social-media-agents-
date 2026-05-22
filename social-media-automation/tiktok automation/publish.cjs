const fs = require("fs");
const path = require("path");
const os = require("os");
const { chromium } = require("patchright");

const videoPath = process.argv[2];
const captionPath = process.argv[3];
if (!videoPath || !captionPath) {
  console.error("Usage: node publish.cjs <videoPath> <captionFile>");
  process.exit(1);
}

const caption = fs.readFileSync(captionPath, "utf8").trim();
// Default to a local profile dir; allow override via TIKTOK_USER_DATA_DIR env var.
// Previous hardcoded path pointed to another user's machine.
const userDataDir = process.env.TIKTOK_USER_DATA_DIR
  || path.join(__dirname, "auth", "tiktok-patchright-profile");

(async () => {
  if (!fs.existsSync(path.dirname(userDataDir))) {
    fs.mkdirSync(path.dirname(userDataDir), { recursive: true });
  }
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    locale: "en-US"
  });

  const page = await context.newPage();

  try {
    await page.goto("https://www.tiktok.com/tiktokstudio/upload", {
      waitUntil: "domcontentloaded",
      timeout: 120000
    });
    await page.waitForTimeout(5000);

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: "attached", timeout: 120000 });
    await fileInput.setInputFiles(videoPath);

    await page.waitForTimeout(8000);

    const editor = page.locator('[contenteditable="true"]').first();
    await editor.waitFor({ state: "visible", timeout: 120000 });
    await editor.click();
    await page.keyboard.press("Control+A").catch(() => {});
    await page.keyboard.press("Backspace").catch(() => {});
    await page.keyboard.type(caption, { delay: 8 });

    const postButton = page.getByRole("button", { name: /post|publish/i }).first();
    await postButton.waitFor({ state: "visible", timeout: 120000 });
    await postButton.click();

    await page.waitForTimeout(10000);
    console.log("Publish flow triggered. Verify final status in the browser.");
  } catch (err) {
    console.error(err);
    await page.screenshot({
      path: path.join(__dirname, "tiktok-publish-error.png"),
      fullPage: true
    }).catch(() => {});
    process.exitCode = 1;
  }
})();

