### Scope
- Standardize all web app checkboxes to 16px rounded boxes using Tailwind classes matching: `w-4 h-4 rounded border-2 flex items-center justify-center bg-white border-gray-300`.
- Apply to shared UI Checkbox component and replace direct native inputs in key screens to ensure consistency.

### Inputs
- `apps/web/src/components/ui/checkbox.tsx`
- `apps/web/src/app/[locale]/(auth_forms)/onboarding/page.tsx`
- `apps/web/src/components/settings/AddPaymentMethodModal.tsx`
- Reference style from request: `w-4 h-4 rounded border-2 flex items-center justify-center bg-white border-gray-300`

### Plan
- Update shared `Checkbox` component classes to match requested visual style and states (checked/disabled/focus).
- Replace native `<input type="checkbox">` in onboarding and add-payment modal with shared `Checkbox` to centralize styling.
- Keep existing custom checkbox in `ImportExportModal` as it already matches the requested style (minimize diff).
- Run lints and type-checks; adjust props (`onCheckedChange`) accordingly.

### Risks & Assumptions
- Assumption: Web uses shadcn/ui Checkbox (Radix) and this is the canonical component.
- Risk: Any places using native inputs without shared component may remain; will address iteratively in future batches if discovered.
- Assumption: Dark mode does not require alternate colors beyond the provided light-style spec.

### Script Additions
- None.
