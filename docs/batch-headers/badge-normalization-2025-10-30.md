## Batch Header: Badge normalization and presets

- Scope: 1–2 hours to standardize Badge base styles, add presets, and normalize key console pages (Errors, Security, Feature Flags). Broader normalization will continue in follow-up batches if needed.
- Inputs:
  - File `apps/web/src/components/ui/badge.tsx`
  - Pages using badges under `apps/web/src/app/[locale]/(console)/console/*`
  - Component `apps/web/src/components/console/ConsoleFlagsPage.tsx`
  - Spec provided in task message (global badge rules, mappings)
- Plan:
  - Update base `Badge` to `font-normal` and ensure sm sizing (px-2.5 py-0.5 text-xs).
  - Create `apps/web/src/components/ui/badge.presets.ts` with `getBadgeClasses` and `getGeneratingBadge` per mapping.
  - Refactor badge usage on key pages (`console/errors`, `console/security`, `ConsoleFlagsPage`) to use presets, remove bold, remove icons inside badges, standardize size.
  - Run type-check and lint; adjust as needed.
- Risks & Assumptions:
  - Assumption: Only "Generating" badges may include an icon; other badges should be text-only.
  - Risk: Some existing visual cues may differ from the new spec; we’ll prioritize the spec and leave inline comments where exceptions are noticed.
  - Assumption: Using Blue soft for generic tags unless outline is explicitly preferred.
- Script Additions: None.

