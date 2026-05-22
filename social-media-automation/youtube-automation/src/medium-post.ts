// Post a single Markdown article to Medium.
//
// Usage:
//   npm run md:post -- ./Medium/my-article.md
//   npm run md:post -- ./Medium/my-article.md --tags "tech,seo,ai"
//   npm run md:post -- ./Medium/my-article.md --draft
//
// Title detection order:
//   1. Frontmatter:  --- title: "..." ---
//   2. First H1:     # My Title
//   3. Filename:     my-title.md -> "My Title"

import { launch } from './medium-browser.js';
import { readFileSync, existsSync } from 'node:fs';
import { basename, extname } from 'node:path';
import matter from 'gray-matter';
import type { Page } from 'playwright';

interface ParsedArticle {
  title: string;
  body: string;
  tags: string[];
}

function parseArticle(filePath: string, cliTags: string[]): ParsedArticle {
  const raw = readFileSync(filePath, 'utf8');
  const { data: frontmatter, content } = matter(raw);

  let title = '';
  let body = content;
  const tags: string[] = [];

  if (typeof frontmatter.title === 'string' && frontmatter.title.trim()) {
    title = frontmatter.title.trim();
  }

  if (Array.isArray(frontmatter.tags)) {
    tags.push(...frontmatter.tags.map((tag) => String(tag).trim()).filter(Boolean));
  } else if (typeof frontmatter.tags === 'string') {
    tags.push(...frontmatter.tags.split(',').map((tag) => tag.trim()).filter(Boolean));
  }

  tags.push(...cliTags);

  if (!title) {
    const h1Match = body.match(/^#\s+(.+?)\s*$/m);
    if (h1Match) {
      title = h1Match[1].trim();
      body = body.replace(h1Match[0], '').replace(/^\n+/, '');
    }
  }

  if (!title) {
    const name = basename(filePath, extname(filePath));
    title = name
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return {
    title,
    body: body.trim(),
    tags: [...new Set(tags)].slice(0, 5)
  };
}

async function waitForEditor(page: Page) {
  const titleEl = page
    .locator('h3[data-testid="editorTitleParagraph"], h3[data-testid="storyTitle"], h3[contenteditable="true"]')
    .first();
  const timeoutMs = 10 * 60 * 1000;
  const start = Date.now();
  let promptedForVerification = false;

  while (Date.now() - start < timeoutMs) {
    if (await titleEl.isVisible({ timeout: 2_000 }).catch(() => false)) {
      return titleEl;
    }

    const pageText = await page.locator('body').innerText({ timeout: 2_000 }).catch(() => '');
    if (
      !promptedForVerification &&
      /security verification|verify you are human|not a bot/i.test(pageText)
    ) {
      console.log('Medium is asking for human verification. Complete it in Chrome to continue.');
      promptedForVerification = true;
    }

    await page.waitForTimeout(5_000);
  }

  throw new Error('Timed out waiting for Medium editor.');
}

async function post(filePath: string, draftOnly: boolean, cliTags: string[]) {
  if (!existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

  if (extname(filePath).toLowerCase() !== '.md') {
    console.warn(`Warning: Expected .md file, got ${extname(filePath)}. Continuing anyway.`);
  }

  const article = parseArticle(filePath, cliTags);

  console.log(`\nTitle: ${article.title}`);
  console.log(`Body: ${article.body.length} chars`);
  console.log(`Tags: ${article.tags.length ? article.tags.join(', ') : '(none)'}`);
  console.log(`Mode: ${draftOnly ? 'DRAFT' : 'PUBLISH'}\n`);

  const { context, close } = await launch();
  const page = await context.newPage();

  try {
    await page.goto('https://medium.com/new-story', { waitUntil: 'domcontentloaded' });

    const titleEl = await waitForEditor(page);
    await titleEl.click();
    await page.keyboard.type(article.title, { delay: 8 });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);

    const blocks = article.body.split(/\n\n+/);
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i].trim();
      if (!block) continue;

      const lines = block.split('\n');
      for (let j = 0; j < lines.length; j++) {
        await page.keyboard.type(lines[j], { delay: 4 });
        if (j < lines.length - 1) {
          await page.keyboard.press('Shift+Enter');
        }
      }

      if (i < blocks.length - 1) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(80);
      }
    }

    console.log('Typed article, waiting for autosave...');
    await page.waitForTimeout(3000);

    if (draftOnly) {
      console.log('Saved as draft.');
      console.log('Review at: https://medium.com/me/stories/drafts');
      await close();
      return;
    }

    await page.getByRole('button', { name: /^Publish$/i }).first().click();

    // Wait for the publish dialog to settle (Medium animates it in).
    await page.waitForTimeout(2500);

    // Tag input is intentionally NOT auto-filled. Medium's 2026 UI doesn't accept
    // Enter as a tag separator, and trying to type all 5 tags concatenates them
    // into one invalid 25+ char string and blocks publish. Tags are added manually
    // in Story Settings after publish.
    if (article.tags.length > 0) {
      console.log(`Skipping tag input (Medium UI requires manual entry). Tags to add later: ${article.tags.join(', ')}`);
    }

    // Uncheck "Paywall this story" if it's checked by default (we want free-to-read SEO content).
    try {
      const paywall = page.getByLabel(/Paywall this story/i).first();
      if (await paywall.isVisible({ timeout: 2000 }).catch(() => false)) {
        const checked = await paywall.isChecked().catch(() => false);
        if (checked) {
          await paywall.click({ trial: false });
          console.log('Unchecked Paywall this story.');
        }
      }
    } catch {}

    // The final publish button is named "Publish" (Medium 2026 UI) — was "Publish now" historically.
    // Use .last() because the editor's Publish button is also still on the page behind the dialog.
    const finalPublish = page.getByRole('button', { name: /^(Publish|Publish now)$/i }).last();
    await finalPublish.click();
    await page.waitForURL(/medium\.com\/.+\/[a-f0-9]{8,}/, { timeout: 60_000 });

    console.log('Published.');
    console.log(`URL: ${page.url()}`);
  } catch (err) {
    console.error('Publish flow failed:', err);
    const path = `auth/medium-error-${Date.now()}.png`;
    try {
      if (!page.isClosed()) {
        await page.screenshot({ path, fullPage: true });
        console.error(`Failed. Screenshot: ${path}`);
      }
    } catch (screenshotErr) {
      console.error('Could not capture failure screenshot:', screenshotErr);
    }
    throw err;
  } finally {
    await close();
  }
}

const argv = process.argv.slice(2);
const draftOnly = argv.includes('--draft');
const tagsIdx = argv.indexOf('--tags');
const tagsValue = tagsIdx !== -1 ? argv[tagsIdx + 1] : undefined;
const cliTags =
  tagsValue
    ? tagsValue.split(',').map((tag) => tag.trim()).filter(Boolean)
    : [];
const filePath = argv.find((arg) => !arg.startsWith('--') && arg !== tagsValue);

if (!filePath) {
  console.error('Usage:');
  console.error('  npm run md:post -- ./Medium/my-article.md');
  console.error('  npm run md:post -- ./Medium/my-article.md --tags "tech,seo,ai"');
  console.error('  npm run md:post -- ./Medium/my-article.md --draft');
  process.exit(1);
}

post(filePath, draftOnly, cliTags).catch((err) => {
  console.error(err);
  process.exit(1);
});
