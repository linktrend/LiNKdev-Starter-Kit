### Scope
- Implement UI/UX updates to Console Billing > Plans & Features tab.
- Target: status badge width/colors, center Actions header, seed 4 plans, Feature Library matrix with toggles and add-feature, per-plan feature lists.

### Inputs
- File: `apps/web/src/app/[locale]/(console)/console/billing/page.tsx`
- Existing components: `Table`, `Badge`, `Button`, `Dialog`, `Select`, `Switch`, `Input` from shadcn/ui.
- Mock data: `mockPlans`, `allFeatures` in the same file.

### Plan
- Normalize status badges to equal width (based on longest label) and color: Active=green, Inactive=red.
- Center the `Actions` column header in the Plans table.
- Replace mock plans with canonical 4 plans: Free, Basic, Pro, Enterprise. Keep inactive legacy if needed but ensure these 4 render.
- Redesign Feature Library as a matrix table: rows=features, columns=plans; cell=checkbox/toggle with consistent tooltips; add "Add Feature" flow.
- Show aggregated plan price rows (Monthly/Yearly/Trial) in comparison table.
- Append compact per-plan feature lists at bottom.
- Respect Tailwind-only styling; no inline styles except dynamic calculated if needed.
- Keep edits additive and minimal; no sweeping refactors.

### Risks & Assumptions
- Assumption: This is mock-only (no backend writes). Toggles mutate local state.
- Risk: Wide matrix on small screens; mitigate with horizontal scroll and sticky first column.
- Risk: Type drift; keep changes within the existing file.

### Script Additions
- None.
