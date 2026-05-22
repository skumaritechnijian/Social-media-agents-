// Run once when the X session expires:
//   npm run login:real

import { launchRealChrome } from "./browser-real.js";

async function hasComposer(page: Awaited<ReturnType<Awaited<ReturnType<typeof launchRealChrome>>["context"]["newPage"]>>) {
  const checks = [
    page.getByTestId("SideNav_NewTweet_Button").isVisible({ timeout: 1000 }),
    page.getByTestId("tweetTextarea_0").isVisible({ timeout: 1000 }),
    page.getByText("What's happening?").isVisible({ timeout: 1000 }),
    page.getByRole("button", { name: /^Post$/ }).isVisible({ timeout: 1000 })
  ];
  const results = await Promise.all(checks.map((check) => check.catch(() => false)));
  return results.some(Boolean);
}

async function main() {
  const { context, close } = await launchRealChrome();
  const page = context.pages()[0] ?? (await context.newPage());

  await page.goto("https://x.com/home", {
    waitUntil: "domcontentloaded",
    timeout: 60_000
  });

  console.log("");
  console.log("X login window opened.");
  console.log("Log in manually with the approved account and complete 2FA/CAPTCHA.");
  console.log("This script will wait until the home composer is visible, then save the session.");
  console.log("");

  const started = Date.now();
  const timeoutMs = 10 * 60 * 1000;

  while (Date.now() - started < timeoutMs) {
    if (await hasComposer(page)) {
      console.log("X login saved in auth/x-real-chrome-profile.");
      await close();
      return;
    }
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: "auth/x-real-login-timeout.png", fullPage: true }).catch(() => undefined);
  await close();
  throw new Error("Could not confirm X login within 10 minutes.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
