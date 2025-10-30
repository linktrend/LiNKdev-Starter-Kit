Scope: 1-2 hour target
Inputs: apps/web/src/components/audit/AuditTable.tsx, apps/web/src/components/scheduling/ReminderTable.tsx, apps/web/src/app/[locale]/(console)/console/config/page.tsx, apps/web/src/app/[locale]/(console)/console/errors/page.tsx, apps/web/src/app/[locale]/(console)/console/security/page.tsx
Plan:
- Add shared date-time formatter using date-fns: dd/MM/yyyy HH:mm:ss
- Replace ad-hoc toLocaleString/split date+time in table cells with the formatter
- Standardize table cell classes to: p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell w-[160px]
- Keep content single-line without icons for date/time columns
Risks & Assumptions:
- Some columns might intentionally be date-only; only change those rendering date+time in tables
- Visual changes reduce icons/stacked lines; assumed acceptable per request
Script Additions: none
