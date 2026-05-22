// Passive X login: opens browser, lets you sign in at your own pace, saves
// session when you close the window. No polling that can crash the page.
//
// Usage:
//   npx tsx src/login-passive.ts

import { launch } from './browser.js';

async function main() {
  const { context, close } = await launch();
  const page = context.pages()[0] ?? (await context.newPage());

  console.log('');
  console.log('--------------------------------------------------');
  console.log('  Chromium window is open. Sign in to X (@technijian).');
  console.log('  Complete 2FA / CAPTCHA if asked.');
  console.log('  When you see your X home timeline, you are logged in.');
  console.log('  CLOSE THE WINDOW. Session will persist.');
  console.log('--------------------------------------------------');
  console.log('');

  await page.goto('https://x.com/login', { waitUntil: 'domcontentloaded' });

  await new Promise<void>((resolve) => {
    context.on('close', () => resolve());
  });

  console.log('Browser closed. Session saved to auth/x-user-data.');
  await close().catch(() => undefined);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
