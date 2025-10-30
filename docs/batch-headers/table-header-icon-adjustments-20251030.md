### Scope
- 1–2 hour target: Table header alignment/format updates and bin icon color adjustments on reports table.

### Inputs
- Files:
  - `apps/web/src/app/[locale]/(console)/console/reports/page.tsx`
- Context:
  - Tailwind CSS usage across project
  - date-fns available for date formatting

### Plan
- Update reports table headers and cells:
  - Remove Status column (header and body)
  - Render Type as plain text (no Badge)
  - Center Actions column header and cells
  - Format Created date as `dd/MM/yyyy HH:mm:ss`
  - Make bin (Trash2) icon red in actions
- Keep changes additive and small; avoid wider refactors.

### Risks & Assumptions
- Assumption: Requested changes apply to the reports table in this batch; broader app-wide bin icon color standardization will be handled in follow-up.
- Risk: Centering Actions may require adjusting cell wrappers; ensure consistent alignment.

### Script Additions
- None
