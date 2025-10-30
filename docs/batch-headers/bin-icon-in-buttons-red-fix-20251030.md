- Scope: ≤30 minutes (tiny UI consistency fix)
- Inputs: `apps/web/src/styles/globals.css`, existing bin icon rule
- Plan:
  - Remove the exclusion that prevents trash/bin icons inside `button` elements from inheriting the global red color.
  - Keep using Tailwind tokens via the utilities layer for consistency with the Styling Rule.
- Risks & Assumptions:
  - Assumes all trash/bin icons use lucide and match current selectors.
  - Some contexts might have variant-specific colors; this change will make trash icons red everywhere, including in buttons.
- Script Additions: None.

