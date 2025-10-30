## Batch Header: Status/Actions columns alignment and width tweaks

- **Scope**: 1–2 hours to standardize `Status` and `Actions` column header alignment and minimal widths across tables.
- **Inputs**:
  - Codebase tables in `apps/web/src/**`
  - Existing CSS/Tailwind utilities and table components
  - User request specifying alignment and width constraints for headers and cells
- **Plan**:
  - Locate tables with `Status` badges and `Actions` icon cells.
  - For `Status`: center header above badge; narrow column to minimal width fitting badge.
  - For `Actions`: center header above right-aligned icon cell; narrow column to minimal width.
  - Apply Tailwind classes only; avoid inline styles.
  - Update all occurrences across app.
  - Verify UI quickly and run lint/typecheck.
- **Risks & Assumptions**:
  - Assumes badge cells use inline-flex badges; width can be governed via `w-0` + `whitespace-nowrap` or `w-px` with `min-w-max` strategies.
  - Assumes no table layout regressions in mobile; preserve `hidden md:table-cell` where present.
  - Some tables may use shared table components requiring careful overrides.
- **Script Additions**: None.


