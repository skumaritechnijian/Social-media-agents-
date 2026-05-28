const fs = require("fs");
const path = require("path");
const { chromium } = require("patchright");

const preferredEmail = "sarojktechnijian@gmail.com";
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
  page.setDefaultTimeout(120000);

  console.log(`Opening TikTok Google login for ${preferredEmail}`);
  await page.goto("https://www.tiktok.com/login", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.getByText(/continue with google/i).click();

  const googlePage = await Promise.race([
    context.waitForEvent("page", { timeout: 30000 }).catch(() => null),
    page.waitForTimeout(5000).then(() => null)
  ]);
  const active = googlePage || page;
  await active.bringToFront().catch(() => {});

  const accountChoice = active.getByText(preferredEmail, { exact: false });
  if (await accountChoice.count().catch(() => 0)) {
    await accountChoice.first().click();
  } else {
    const emailInput = active.locator('input[type="email"], input[name="identifier"]').first();
    if (await emailInput.count().catch(() => 0)) {
      await emailInput.fill(preferredEmail);
      await active.getByRole("button", { name: /^next$/i }).click();
    }
  }

  console.log("");
  console.log("If Google/TikTok asks for password, CAPTCHA, 2FA, or account confirmation, complete it in the browser.");
  console.log("When TikTok is logged in or Studio opens, close the browser window to save the session.");
  console.log("");

  const deadline = Date.now() + 15 * 60 * 1000;
  while (Date.now() < deadline) {
    const pages = context.pages();
    const urls = pages.map((p) => p.url()).join("\n");
    if (/tiktok\.com\/(foryou|@|tiktokstudio|upload|creator-center|settings|profile)/i.test(urls)) {
      console.log("TikTok login appears complete. You can close the browser to save the session.");
    }
    await page.waitForTimeout(5000).catch(() => {});
  }

  console.log("Login helper timed out; close the browser after completing verification.");
})().catch(async (err) => {
  console.error(err);
  process.exitCode = 1;
});
