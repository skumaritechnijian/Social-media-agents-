# Technijian.in Google SEO Automation Implementation

## Architecture

Use three layers:

1. Skill: `10_Automation/skills/technijian-in-google-seo/SKILL.md`
2. Agents: `10_Automation/agents/*.agent.md`
3. Harness: `clients/Technijian_Internal/google-harness`

The skill gives Codex the operating rules. The agents define repeatable role prompts. The harness turns dashboard/article inputs into Google and publishing operation plans.

## Google Platform Coverage

| Platform | Purpose | Initial Mode |
|---|---|---|
| Google Sheets | Editorial calendar, SEO tasks, landing pages, news queue | Dry-run plan |
| Google Drive | Briefs, drafts, images, reports, approval artifacts | Dry-run plan |
| Google Calendar | Writer deadlines, review reminders, publish windows | Dry-run plan |
| Google Search Console | Query/page tracking, URL inspection after publish | Dry-run plan |
| GA4 | Engagement and conversion reporting | Adapter pending |
| Google Business Profile | Local posts, reviews, Q&A, service updates | Dry-run plan |
| Looker Studio | Combined SEO dashboard | Dry-run plan |
| WordPress | Draft, schedule, publish blogs | Dry-run plan |

## Commands

Run from `clients/Technijian_Internal/google-harness`:

```powershell
npm run dashboard -- --dashboard ..\..\TECH\technijian.in\Technijian_IN_180Day_Content_Plan_2026_Dashboard.csv --site technijian.in --dry-run
npm run schedule -- --dry-run
```

For an individual article:

```powershell
npm run plan -- --source <article.md> --site technijian.in --dry-run
npm run publish -- --dry-run
```

## Next Build Step

Implement live adapters after credentials are available:

1. Create a Google Cloud project.
2. Enable Sheets API, Drive API, Calendar API, Search Console API, Analytics Data API, and Business Profile APIs as needed.
3. Store credentials outside the repository.
4. Add adapter modules under `clients/Technijian_Internal/google-harness/src/adapters`.
5. Keep dry-run as the default and require explicit approval for live operations.

