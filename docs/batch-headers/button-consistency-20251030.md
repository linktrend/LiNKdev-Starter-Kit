## Batch Header: Button Consistency (Add Feature vs Create Plan)

- Scope: Align "Add Feature" and "Create Plan" buttons to the centralized design (shared Button variant/size) in apps/web. Target: ≤1–2 hours.
- Inputs: `apps/web/src/**`, `packages/ui/src/**`, Tailwind + shadcn/ui config, existing Button component usage.
- Plan:
  - Find occurrences of the two buttons and inspect their implementations.
  - Standardize both to the shared `Button` component with the same `variant` and `size`.
  - Ensure Tailwind classes are not diverging; remove local overrides unless necessary.
  - Verify UI locally; run lint and tests.
- Risks & Assumptions:
  - Assumes a shared Button (shadcn/ui or packages/ui) exists and is the canonical source.
  - Button text might appear in multiple pages; we will update primary console locations.
  - If variant naming differs, we’ll pick existing canonical variant (likely `default` or `primary`).
- Script Additions: None.


