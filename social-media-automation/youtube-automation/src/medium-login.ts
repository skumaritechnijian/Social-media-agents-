import { launch } from './medium-browser.js';

async function canOpenEditor(page: Awaited<ReturnType<Awaited<ReturnType<typeof launch>>['context']['newPage']>>) {
  await page.goto('https://medium.com/new-story', { waitUntil: 'domcontentloaded' });

  return page
    .locator('h3[data-testid="editorTitleParagraph"], h3[data-testid="storyTitle"], h3[contenteditable="true"]')
    .first()
    .isVisible({ timeout: 10_000 })
    .catch(() => false);
}

async function main() {
  const { context, close } = await launch();
  const page = context.pages()[0] ?? (await context.newPage());

  console.log('\n----------------------------------------------');
  console.log('  Checking Medium login.');
  console.log('  If the browser asks you to sign in, complete it there.');
  console.log('  This script will verify login automatically.');
  console.log('----------------------------------------------\n');

  const timeoutMs = 10 * 60 * 1000;
  const start = Date.now();

  await page.goto('https://medium.com/m/signin', { waitUntil: 'domcontentloaded' });

  while (Date.now() - start < timeoutMs) {
    if (await canOpenEditor(page)) {
      console.log('Medium login saved.');
      await close();
      return;
    }

    console.log('Waiting for Medium login to complete in the browser...');
    await page.waitForTimeout(10_000);
  }

  const screenshotPath = `auth/medium-login-check-failed-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.error(`Could not confirm Medium login. Screenshot saved to: ${screenshotPath}`);
  console.error(`Current URL: ${page.url()}`);
  await close();
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
