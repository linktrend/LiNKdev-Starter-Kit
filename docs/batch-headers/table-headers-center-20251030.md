## Batch Header

- **Scope**: Center the "Status" and "Actions" table header text across console tables.
- **Inputs**: `apps/web/src/app/[locale]/(console)/console/config/page.tsx`, `apps/web/src/components/console/DevelopmentTasksSection.tsx`, `apps/web/src/components/records/RecordTable.tsx`, `apps/web/src/components/scheduling/ReminderTable.tsx`
- **Plan**:
  - Update `TableHead` for "Status" and "Actions" to use `text-center`.
  - Preserve responsive visibility classes (e.g., `hidden md:table-cell`).
  - Keep widths where present; only adjust alignment.
- **Risks & Assumptions**:
  - Assumes only header text alignment needs change; body cells remain as-is.
  - Assumes shadcn/ui `TableHead` supports Tailwind `text-center` override.
- **Script Additions**: None.


