## Batch Header

- **Scope**: 1–2 hour target. Reduce KPI number typography in billing revenue/analytics bottom grid to better fit content.
- **Inputs**:
  - File: `apps/web/src/app/[locale]/(console)/console/billing/page.tsx`
  - Context: Bottom grid with MRR, ARR, ARPU, LTV, Active Subs, Trial Subs.
- **Plan**:
  - Locate the metrics grid in the billing page.
  - Reduce number text size using Tailwind (from `text-xl` to `text-base md:text-lg`).
  - Keep labels and layout unchanged.
  - Run lint/type checks.
- **Risks & Assumptions**:
  - Assumption: Only the bottom revenue/analytics metrics need adjustment (not reports page).
  - Minimal UX risk; responsive sizes keep readability.
- **Script Additions**: None.
