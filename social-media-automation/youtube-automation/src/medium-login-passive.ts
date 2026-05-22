// Passive Medium login: opens the browser, lets you sign in at your own pace,
// saves the session when you close the window. No polling, no page-navigation
// interference with Google OAuth.
//
// Usage:
//   npx tsx src/medium-login-passive.ts

import { launch } from './medium-browser.js';

async function main() {
  const { context, close } = await launch();
  const page = context.pages()[0] ?? (await context.newPage());

  console.log('');
  console.log('--------------------------------------------------');
  console.log('  Chromium window is open. Sign in to Medium.');
  console.log('  Click "Sign in with Google" -> use:');
  console.log('     seomarketing.technijian@gmail.com');
  console.log('  When you see the Medium home/feed page, you are logged in.');
  console.log('  CLOSE THE WINDOW when done. The session will persist.');
  console.log('--------------------------------------------------');
  console.log('');

  await page.goto('https://medium.com/m/signin', { waitUntil: 'domcontentloaded' });

  await new Promise<void>((resolve) => {
    context.on('close', () => resolve());
  });

  console.log('Browser closed. Session saved to auth/medium-chromium-profile.');
  await close().catch(() => undefined);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
