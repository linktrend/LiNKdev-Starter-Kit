## Batch Header: Revenue UI Enhancements (Billing)

- **Scope**: 1–2 hours. Add colored icons to revenue cards, add chart timeframe buttons, and include additional revenue KPIs below export section on billing revenue tab.
- **Inputs**:
  - `apps/web/src/app/[locale]/(console)/console/billing/page.tsx`
  - Icons from `lucide-react`
  - shadcn/ui components already used in the page (`Card`, `Button`, etc.)
- **Plan**:
  - Add icons to metric card titles: Total Revenue, Revenue by Plan, Churn Rate, Trial Conversion.
  - Add a small button group near the revenue chart title to toggle Monthly, Yearly, and other revenue metrics (UI state only for now).
  - Add an additional KPI grid beneath the "Export Report" area with metrics like MRR, ARR, ARPU, LTV, Active Subscriptions, Trial Subscriptions, Revenue Growth.
- **Risks & Assumptions**:
  - Assumes the Billing page is the correct target for the provided layout snippets (confirmed by existing code).
  - Assumes no backend wiring is needed; these are UI-only adjustments using existing mock data.
  - Keep Tailwind-only styling; avoid inline styles.
- **Script Additions**: None.
