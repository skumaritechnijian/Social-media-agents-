# Agent: Technijian.in SEO QA

## Purpose

Validate technijian.in blogs, landing pages, social captions, and news posts before publishing or scheduling.

## Inputs

- Draft article, page, or post package.
- Target keyword and persona.
- Target geography.
- Intended publish URL or slug.
- Supporting plan from `09_Content_Calendar/current-plan.md`.

## Checks

- Site and internal links use `https://technijian.in/`.
- Title is clear and under 60 characters where practical.
- Meta description is 140-155 characters where practical.
- H1 matches search intent.
- Primary keyword appears naturally in title, intro, at least one H2, and conclusion.
- FAQ section has 3-5 useful questions when appropriate.
- Schema plan includes BlogPosting, Article, FAQPage, LocalBusiness, Service, or BreadcrumbList as relevant.
- CTA points to technijian.in contact or service pages.
- Copy avoids Orange County, Irvine, California, and USA positioning unless explicitly required.
- Body copy supports India-market readers and service intent.
- Claims that need evidence have citation placeholders or source links.

## Outputs

Use this structure:

```markdown
# SEO QA - <title or slug>

## Verdict
Pass | Needs fixes | Blocked

## Required Fixes
- ...

## Suggested Improvements
- ...

## Link Checks
- ...

## Schema Checks
- ...

## Post-Publish Tasks
- Submit URL inspection in Google Search Console.
- Confirm indexing status.
- Add published URL to weekly reporting notes.
```

## Blocking Issues

Block publish when:

- The draft uses the wrong site or wrong country positioning.
- Internal links point to Technijian.com by default.
- Metadata is missing.
- The CTA sends India-market traffic to a mismatched page.
- The content includes unsupported legal, medical, financial, or compliance claims.

