## Batch Header: Align "Completed" badges with "Active" styling

- Scope: 1–2 hours to align visual style of "Completed" badges with existing "Active" badge style across console and dashboard pages.
- Inputs: Referenced files `apps/web/src/app/[locale]/(console)/console/config/page.tsx`, `apps/web/src/app/[locale]/(console)/console/billing/page.tsx` (source of Active style), `apps/web/src/app/[locale]/(dashboard)/dashboard/module2/page.tsx`, `apps/web/src/app/[locale]/(dashboard)/dashboard/module3/page.tsx`, `apps/web/src/components/ui/badge.tsx`.
- Plan:
  - Identify all occurrences rendering a "Completed" badge.
  - Standardize them to use the same Tailwind classes as the Billing "Active" badge: outline with green border/background/text.
  - Keep changes minimal and localized; do not refactor the badge component.
  - Verify visually by running the web app and checking affected pages.
- Risks & Assumptions:
  - Assumes desired reference style is the one used in Billing `getStatusBadge('active')`.
  - Some contexts may also include icons; we will preserve icons and only adjust classes.
  - No global CSS changes; only Tailwind class adjustments.
- Script Additions: None.


