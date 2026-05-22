// Passive Quora login. Opens browser; user signs in at their own pace; closes
// window to save the session.
//
// Usage:
//   npm run login

import { launch } from './browser.js';

async function main() {
  const { context, close } = await launch();
  const page = context.pages()[0] ?? (await context.newPage());

  console.log('');
  console.log('--------------------------------------------------');
  console.log('  Sign in to Quora (use seomarketing.technijian@gmail.com).');
  console.log('  Complete 2FA/CAPTCHA if asked.');
  console.log('  When you are on your Quora home feed, CLOSE the window.');
  console.log('  Session will persist to auth/quora-patchright-profile.');
  console.log('--------------------------------------------------');
  console.log('');

  await page.goto('https://www.quora.com/', { waitUntil: 'domcontentloaded' });

  await new Promise<void>((resolve) => {
    context.on('close', () => resolve());
  });

  console.log('Browser closed. Session saved.');
  await close().catch(() => undefined);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
