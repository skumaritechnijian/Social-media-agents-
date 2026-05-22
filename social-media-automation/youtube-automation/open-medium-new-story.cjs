const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

chromium.use(StealthPlugin());

(async () => {
  // Connect to your ALREADY OPEN Chrome — no new window
  const browser = await chromium.connectOverCDP('http://localhost:9222');

  const context = browser.contexts()[0];
  const page = await context.newPage();

  await page.goto('https://medium.com/new-story', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  console.log('Opened Medium new-story in your existing Chrome');

  // DO NOT call browser.close() — keeps your Chrome running
})();
