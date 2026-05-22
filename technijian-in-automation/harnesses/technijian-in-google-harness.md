# Technijian.in Google Harness

Use the shared harness at:

`clients/Technijian_Internal/google-harness`

## Dry-Run Dashboard Plan

Run from `clients/Technijian_Internal/google-harness`:

```powershell
npm run dashboard -- --dashboard ..\..\TECH\technijian.in\Technijian_IN_180Day_Content_Plan_2026_Dashboard.csv --site technijian.in --dry-run
```

This creates `runs/latest.plan.json` with:

- Weekly schedule rows
- Persona matrix
- India geography strategy
- 26-week team output summary
- Planned Google Sheets, Drive, Calendar, Search Console, Business Profile, and Looker Studio operations

## Dry-Run Schedule Plan

```powershell
npm run schedule -- --dry-run
```

This creates `runs/latest.result.json` showing the Google operations that would run.

## Dry-Run Article Plan

```powershell
npm run plan -- --source <article.md> --site technijian.in --dry-run
npm run publish -- --dry-run
```

Use this for individual blog drafts before WordPress publishing.

## Live Automation Adapters To Add

Add adapters only after credentials and approval gates are ready:

- `src/adapters/google-sheets.js`
- `src/adapters/google-drive.js`
- `src/adapters/google-calendar.js`
- `src/adapters/search-console.js`
- `src/adapters/ga4.js`
- `src/adapters/business-profile.js`
- `src/adapters/looker-studio.js`
- `src/adapters/wordpress.js`

Each adapter should support dry-run and live mode, log every operation, and require explicit approval for publish/indexing actions.

