import { launch } from './medium-browser.js';

const SUBMISSION_URL =
  'https://medium.com/p/927322a0ea0e/submission?redirectUrl=https%3A%2F%2Fmedium.com%2Fp%2F927322a0ea0e%2Fedit&submitType=publishing-post&postPublishedType=initial';

async function main() {
  const { context, close } = await launch();
  const page = await context.newPage();

  try {
    await page.goto(SUBMISSION_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);
    await page.waitForTimeout(5_000);

    const bodyText = await page.locator('body').innerText({ timeout: 10_000 }).catch(() => '');
    if (/security verification|verify you are human|not a bot/i.test(bodyText)) {
      console.log('Medium is asking for human verification. Complete it in the opened Chrome window.');
      await page.waitForTimeout(10 * 60 * 1000);
    }

    await page.evaluate(() => {
      const boxes = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
      const paywall = boxes[0];
      if (paywall?.checked) paywall.click();
    });

    const publishButton = page.locator('button').filter({ hasText: /^Publish$/ }).last();
    await publishButton.waitFor({ state: 'visible', timeout: 30_000 });
    await publishButton.click({ force: true });
    await page.waitForTimeout(15_000);

    const afterText = await page.locator('body').innerText({ timeout: 10_000 }).catch(() => '');
    console.log(`Current URL: ${page.url()}`);

    if (/maximum of two stories in the past 24 hours/i.test(afterText)) {
      console.log('Medium still reports the 24-hour publishing limit. Try again later.');
      process.exitCode = 2;
      return;
    }

    if (/How to Prepare for a HIPAA Audit in 2026/i.test(afterText)) {
      console.log('HIPAA audit Medium article appears published or visible after publish.');
      return;
    }

    console.log(afterText.slice(0, 1500));
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
