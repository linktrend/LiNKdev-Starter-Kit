Scope: 1–2 hour target

Inputs:
- apps/web/src/app/[locale]/(console)/console/config/application/deployment/page.tsx
- apps/web/src/components/ui/badge.tsx
- apps/web/src/components/ui/badge.presets.ts

Plan:
- Use existing badge presets to standardize success/failed styling.
- Remove status icons from deployment history badges.
- Capitalize status labels to "Success" and "Failed".
- Ensure Failed badge uses same sizing as Success by relying on shared Badge base classes.
- Run lint/type-check.

Risks & Assumptions:
- Assumption: "Success"/"Failed" should be capitalized without quotes.
- Assumption: Application tab refers to application/deployment page.tsx.
- Risk: There may be another duplicated deployment table elsewhere; out of scope per request.

Script Additions:
- None


