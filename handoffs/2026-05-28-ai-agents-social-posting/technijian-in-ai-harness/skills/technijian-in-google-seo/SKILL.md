---
name: technijian-in-google-seo
description: Manage technijian.in SEO, Google-platform, content planning, reporting, publishing readiness, and QA workflows while keeping India-market work separate from Technijian.com.
---

# Technijian.in Google SEO

## Source Files

- Use `sdlc/clients/TECH/technijian.in/09_Content_Calendar/current-plan.md` as the local planning entry point.
- Use `sdlc/clients/TECH/technijian.in/10_Google_Harness/` for Google snapshot and operation context.
- Use `sdlc/clients/TECH/technijian.in/11_AI_Harness/agents/` for role-specific operating instructions.
- Use `sdlc/seo_team_skills.md` for assignment guidance.

## Market Rules

- Target India first.
- Keep all `.in` work separate from `technijian.com`.
- Do not reuse Orange County, Irvine, California, or USA positioning unless explicitly requested.
- Preserve local SEO opportunities around Panchkula, Chandigarh, Mohali, Tricity, managed IT, cybersecurity, cloud, VoIP, AI, DevOps, and review growth when supported by current plans or reports.

## Workflow

1. Confirm the site is `technijian.in`.
2. Read the current content calendar and relevant reporting artifacts.
3. Select the matching agent:
   - `technijian-in-orchestrator.agent.md`
   - `content-strategist.agent.md`
   - `google-platform-manager.agent.md`
   - `reporting-analyst.agent.md`
   - `seo-qa.agent.md`
4. Draft the plan, brief, report, or QA output.
5. Save outputs inside `sdlc/clients/TECH/technijian.in/`.
6. For live Google or WordPress work, produce a dry-run plan first.

## Google Platform Responsibilities

- Google Sheets: maintain blog queue, landing-page queue, SEO-task tracker, news queue, and weekly reporting tabs.
- Google Drive: store briefs, drafts, assets, screenshots, reports, and approval artifacts.
- Google Calendar: create editorial review and publish reminders by writer/persona.
- Google Search Console: track queries, pages, CTR, average position, indexing, and post-publish inspection tasks.
- GA4: track blog engagement, conversions, traffic channels, and landing-page behavior.
- Google Business Profile: track local posts, reviews, Q&A, services, and local trust signals.
- Looker Studio: combine GSC, GA4, GBP, and Sheets into weekly SEO dashboards.

## QA Gates

- Confirm site is `technijian.in`.
- Confirm internal links point to `https://technijian.in/`.
- Confirm metadata does not mention USA, Orange County, Irvine, or California unless explicitly relevant.
- Confirm title, meta description, primary keyword, FAQ, schema, CTA, and local modifier.
- Confirm post-publish GSC inspection task and reporting row are generated.

## Live Operation Rule

Do not call live Google, WordPress, or SEO APIs until credentials, adapters, and approval gates are implemented and the user has approved the live action.

