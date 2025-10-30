Scope: Overhaul Reports > Analytics tab to show product/app analytics (mock data), including six sections (Product Usage, Growth & Retention, Feature Usage, Funnels, Performance, Revenue KPIs), time range selector, filters, and CSV export. Target: apps/web/src/app/[locale]/(console)/console/reports/page.tsx. Keep other tabs unchanged.

Inputs:
- File: `apps/web/src/app/[locale]/(console)/console/reports/page.tsx`
- Existing shadcn/ui primitives (Card, Tabs, Table, Select, Button, Badge)
- Design constraints from task brief

Plan:
- Preserve parent Tabs; replace only `TabsContent value="analytics"` content.
- Define realistic mock generators for 90 days; slice based on selected range (7d–365d).
- Add time range Select and simple filters (plan, org segment) at top of Analytics tab.
- Implement six sections as Cards with KPI tiles, a mock chart (SVG/div) and a table where applicable.
- Add lightweight CSV export per section (client-side string build + download).
- Ensure responsive layout: stacked KPIs on mobile, horizontal scroll for wide tables.
- Match spacing classes and use icons/badges per spec.
- Typecheck and lint.

Risks & Assumptions:
- Assumption: shadcn/ui components and lucide icons already available (as seen in file).
- Charts will be mock visuals (no external chart lib) to avoid new deps.
- File size risk; keep helper presentational bits inline to minimize new files.
- No backend; all data client-side, recalculated on time range changes.

Script Additions: None

