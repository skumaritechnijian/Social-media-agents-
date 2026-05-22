---
name: technijian-in-google-seo
description: Automate and manage technijian.in digital marketing, SEO, and blog posting workflows using the technijian.in 180-day dashboard CSV, Google Search Console, GA4, Google Business Profile, Google Sheets, Google Drive, Google Calendar, Looker Studio, and WordPress publishing harnesses. Use when Codex is asked to plan, draft, schedule, publish, QA, report, or optimize technijian.in blogs, landing pages, news posts, SEO tasks, or India-market digital marketing operations.
---

# Technijian.in Google SEO

## Source Files

- Use `clients/TECH/technijian.in/Technijian_IN_180Day_Content_Plan_2026_Dashboard.csv` as the source of truth.
- Use `clients/TECH/technijian.in/03_Content_Production/Technijian_IN_180_Day_Blog_Plan_2026.md` only as a supporting topic expansion draft.
- Keep all `.in` work separate from `technijian.com`. Do not reuse Orange County or USA positioning.

## Market Rules

- Target India first.
- Use persona/geography from the dashboard CSV:
  - Persona A: Compliance IT, healthcare/fintech, Mumbai/Pune.
  - Persona B: Software/SaaS, Bangalore/Pune.
  - Persona C: SEO/global marketing, Noida/NCR/Pune.
  - Persona D: AI/enterprise DX, Bangalore/Noida.
- Preserve local SEO opportunities from the `.in` SEO reports: Panchkula, Chandigarh, Mohali, Tricity, managed IT, cybersecurity, cloud, VoIP, AI, DevOps, and review growth.

## Workflow

1. Read the dashboard CSV.
2. Identify the day, persona, writer, page quota, SEO task, and news requirement.
3. Draft or schedule content using India-market language and service intent.
4. Build a dry-run harness plan before any live posting:
   `npm run dashboard -- --dashboard ..\..\TECH\technijian.in\Technijian_IN_180Day_Content_Plan_2026_Dashboard.csv --site technijian.in --dry-run`
5. For article-level posting, build a plan with:
   `npm run plan -- --source <article.md> --site technijian.in --dry-run`
6. Do not call live Google, WordPress, or SEO APIs until credentials, adapters, and approval gates are implemented.

## Google Platform Responsibilities

- Google Sheets: Maintain blog queue, landing-page queue, SEO-task tracker, news queue, and weekly reporting tabs.
- Google Drive: Store briefs, drafts, assets, screenshots, reports, and approval artifacts by week/persona.
- Google Calendar: Create editorial review and publish reminders by writer/persona.
- Google Search Console: Track queries, pages, CTR, average position, indexing, and post-publish inspection tasks.
- GA4: Track blog engagement, conversions, traffic channels, and landing-page behavior.
- Google Business Profile: Track local posts, reviews, Q&A, services, and local trust signals.
- Looker Studio: Combine GSC, GA4, GBP, and Sheets into weekly SEO dashboards.

## QA Gates

- Confirm site is `technijian.in`.
- Confirm internal links point to `https://technijian.in/`.
- Confirm metadata does not mention USA, Orange County, Irvine, or California unless explicitly relevant.
- Confirm title, meta description, primary keyword, FAQ, schema, CTA, and local modifier.
- Confirm post-publish GSC inspection task and reporting row are generated.

