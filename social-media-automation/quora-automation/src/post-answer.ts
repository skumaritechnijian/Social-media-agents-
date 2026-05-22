// Post a Quora answer. Either:
//   1. Provide a direct question URL (--url https://www.quora.com/...)
//   2. Provide a search query and the script finds the first matching question
//
// Answer text comes from a file (--text path/to/answer.txt).
//
// Usage:
//   npm run answer -- --search "How to plan IT disaster recovery Newport Beach" --text ./answer.txt
//   npm run answer -- --url https://www.quora.com/How-do-... --text ./answer.txt

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { launch } from './browser.js';

interface Args {
  url?: string;
  search?: string;
  textPath: string;
}

function parseArgs(argv: string[]): Args {
  let url: string | undefined;
  let search: string | undefined;
  let textPath: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--url') { url = v; i += 1; }
    else if (k === '--search') { search = v; i += 1; }
    else if (k === '--text') { textPath = v; i += 1; }
  }

  if ((!url && !search) || !textPath) {
    console.error('Usage:');
    console.error('  npm run answer -- --search "<query>" --text <answer.txt>');
    console.error('  npm run answer -- --url <question-url> --text <answer.txt>');
    process.exit(1);
  }

  return { url, search, textPath: textPath! };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const absText = resolve(args.textPath);
  if (!existsSync(absText)) throw new Error(`Answer text file not found: ${absText}`);
  const answerText = readFileSync(absText, 'utf8').trim();
  if (!answerText) throw new Error('Answer text file is empty.');

  console.log(`Answer: ${answerText.length} chars`);

  const { context, close } = await launch();
  const page = await context.newPage();

  try {
    if (args.url) {
      console.log(`Navigating to question: ${args.url}`);
      await page.goto(args.url, { waitUntil: 'domcontentloaded' });
    } else if (args.search) {
      const searchUrl = `https://www.quora.com/search?q=${encodeURIComponent(args.search)}&type=question`;
      console.log(`Searching: ${args.search}`);
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      // Click the first question result link
      const firstQ = page.locator('a[href*="/"][href*="?ch="], a.q-box[href*="quora.com"]').first();
      const qVisible = await firstQ.isVisible({ timeout: 8000 }).catch(() => false);
      if (!qVisible) {
        throw new Error(`No question found for search "${args.search}". Provide --url instead.`);
      }
      await firstQ.click();
      await page.waitForLoadState('domcontentloaded');
    }

    await page.waitForTimeout(3500);
    console.log(`On page: ${page.url()}`);
    console.log(`Title:   ${await page.title()}`);

    // Click "Answer" button to open the answer editor.
    const answerBtn = page.getByRole('button', { name: /^Answer$/i }).first();
    const visible = await answerBtn.isVisible({ timeout: 10000 }).catch(() => false);
    if (!visible) {
      throw new Error('Could not find "Answer" button. You may already have an answer for this question, or the page structure changed.');
    }
    await answerBtn.click();
    await page.waitForTimeout(2500);

    // Find the editor (contenteditable) and type/paste the answer.
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.waitFor({ state: 'visible', timeout: 15000 });
    await editor.click();
    await page.keyboard.type(answerText, { delay: 8 });

    console.log('Answer typed. Waiting for autosave...');
    await page.waitForTimeout(3000);

    // Click the submit button. Quora calls it "Post" or "Submit".
    const submit = page.getByRole('button', { name: /^(Post|Submit|Done)$/i }).last();
    const submitVisible = await submit.isVisible({ timeout: 8000 }).catch(() => false);
    if (!submitVisible) {
      console.warn('Submit button not auto-detected; answer was typed but NOT submitted.');
      console.warn(`Review and submit manually at: ${page.url()}`);
    } else {
      await submit.click();
      await page.waitForTimeout(5000);
      console.log('Answer submitted.');
      console.log(`URL: ${page.url()}`);
    }
  } catch (err) {
    console.error(`Original error: ${(err as Error)?.message ?? err}`);
    if ((err as Error)?.stack) console.error((err as Error).stack);
    const path = `auth/quora-error-${Date.now()}.png`;
    try {
      await page.screenshot({ path, fullPage: true });
      console.error(`Screenshot: ${path}`);
    } catch (e) {
      console.error('Could not capture screenshot.');
    }
    throw err;
  } finally {
    await close().catch(() => undefined);
  }
}

main().catch(() => process.exit(1));
