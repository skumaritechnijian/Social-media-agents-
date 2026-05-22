import { launch } from './medium-browser.js';

const title = process.argv.slice(2).join(' ').trim();

if (!title) {
  console.error('Usage: tsx src/medium-publish-draft-by-title.ts "Story title"');
  process.exit(1);
}

async function main() {
  const { context, close } = await launch();
  const page = await context.newPage();

  try {
    await page.goto('https://medium.com/me/stories/drafts', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);

    const draftLink = page.getByText(title, { exact: true }).first();
    await draftLink.waitFor({ state: 'visible', timeout: 60_000 });
    await draftLink.click();

    await page.waitForLoadState('domcontentloaded', { timeout: 30_000 }).catch(() => undefined);
    await page.waitForTimeout(3000);

    await page.getByRole('button', { name: /^Publish$/i }).first().click();
    await page.waitForTimeout(2500);

    await page.evaluate(() => {
      const boxes = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
      const paywall = boxes.find((box) => {
        const text = box.parentElement?.innerText ?? '';
        return /Paywall this story/i.test(text);
      }) ?? boxes[0];
      if (paywall?.checked) paywall.click();
    });

    const finalPublish = page.locator('button').filter({ hasText: /^Publish$/ }).last();
    await finalPublish.waitFor({ state: 'visible', timeout: 60_000 });
    await finalPublish.click({ force: true });
    await page.waitForTimeout(15000);

    console.log(`Current URL: ${page.url()}`);
    const body = await page.locator('body').innerText({ timeout: 10_000 }).catch(() => '');
    console.log(body.slice(0, 1200));
  } catch (err) {
    const path = `auth/medium-draft-publish-error-${Date.now()}.png`;
    await page.screenshot({ path, fullPage: true }).catch(() => undefined);
    console.error(`Failed. Screenshot: ${path}`);
    throw err;
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
