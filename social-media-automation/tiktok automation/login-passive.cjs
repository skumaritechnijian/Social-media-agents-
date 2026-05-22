// Passive TikTok login. Opens patchright Chromium; user signs in to TikTok at
// their own pace; closes window to save session.
//
// Usage:
//   npm run login
//   (or: node login-passive.cjs)

const fs = require("fs");
const path = require("path");
const { chromium } = require("patchright");

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

  const page = context.pages()[0] || (await context.newPage());

  console.log("");
  console.log("--------------------------------------------------");
  console.log("  Sign in to TikTok (use the Technijian account).");
  console.log("  Complete CAPTCHA/2FA if asked.");
  console.log("  When you can see your TikTok feed, CLOSE the window.");
  console.log("  Session will persist to " + userDataDir);
  console.log("--------------------------------------------------");
  console.log("");

  await page.goto("https://www.tiktok.com/login", { waitUntil: "domcontentloaded" });

  await new Promise((resolve) => {
    context.on("close", () => resolve());
  });

  console.log("Browser closed. Session saved.");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
