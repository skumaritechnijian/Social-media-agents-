// Run ONCE: `npm run login`
// Opens Chrome, you log in by hand, session is saved on disk.

import { launch } from "./browser.js";

async function isVisible(locatorPromise: Promise<boolean>) {
  return locatorPromise.catch(() => false);
}

async function isLoggedIn(page: Awaited<ReturnType<Awaited<ReturnType<typeof launch>>["context"]["newPage"]>>) {
  const signals = [
    page.getByTestId("SideNav_NewTweet_Button").isVisible({ timeout: 1000 }),
    page.getByTestId("AppTabBar_Home_Link").isVisible({ timeout: 1000 }),
    page.getByTestId("SideNav_AccountSwitcher_Button").isVisible({ timeout: 1000 }),
    page.getByTestId("tweetTextarea_0").isVisible({ timeout: 1000 }),
    page.getByRole("link", { name: /^Home$/ }).isVisible({ timeout: 1000 })
  ];

  const results = await Promise.all(signals.map(isVisible));
  return results.some(Boolean) || page.url().includes("/home");
}

async function main() {
  const { context, close } = await launch();
  const page = context.pages()[0] ?? (await context.newPage());

  await page.goto("https://x.com/login", { waitUntil: "domcontentloaded" });

  console.log("\n----------------------------------------");
  console.log("  Log in manually in the browser.");
  console.log("  Complete 2FA / CAPTCHA if asked.");
  console.log("  Wait until you see your home timeline.");
  console.log("  This script will detect login automatically.");
  console.log("----------------------------------------\n");

  const timeoutMs = 5 * 60 * 1000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (await isLoggedIn(page)) {
      console.log('Login saved. You can now run: npm run post -- "your tweet"');
      await close();
      return;
    }

    await page.waitForTimeout(3000);
  }

  const screenshotPath = "auth/login-check-failed.png";
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.error(`Could not confirm login. Screenshot saved to: ${screenshotPath}`);
  console.error(`Current URL: ${page.url()}`);
  await close();
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
