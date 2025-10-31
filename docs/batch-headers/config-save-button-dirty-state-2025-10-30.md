## Batch Header: Config Save Button Dirty-State (2025-10-30)

- **Scope**: Enable/disable "Save Changes" button on application config screens based on unsaved changes; wire Reset to revert to initial values. Target: ~1 hour.
- **Inputs**:
  - `apps/web/src/app/[locale]/(console)/console/config/application/settings/page.tsx`
  - `apps/web/src/app/[locale]/(console)/console/config/application/deployment/page.tsx`
  - Repo conventions: Tailwind, shadcn/ui, React (App Router)
- **Plan**:
  - Capture initial config in a ref per page.
  - Compute `isDirty` via deep compare of current vs initial state (JSON.stringify acceptable for flat primitives used here).
  - Disable "Save Changes" button when `!isDirty`.
  - Implement "Reset" to set state back to initial.
  - Run lint and type-check for `apps/web`.
- **Risks & Assumptions**:
  - Assumption: Current pages use local state only; no server mutations involved.
  - Risk: Future nested objects would need a sturdier deep-equal; current structures are flat.
  - Assumption: Tailwind and shadcn/ui buttons accept `disabled` prop.
- **Script Additions**: None.
