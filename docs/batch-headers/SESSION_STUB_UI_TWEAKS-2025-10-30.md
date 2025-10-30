## Scope
- Tweak sessions table in Security & Access screen (session stub) to align typography and layout.

## Inputs
- File: `apps/web/src/app/[locale]/(console)/console/security/page.tsx`
- Existing helpers: `getUserDisplay`, `formatDateDDMMYYYY`, `formatTimeHHMMSS`

## Plan
- Make IP column font consistent (remove monospaced styling).
- Ensure first column shows user display name + username (smaller, muted second line).
- Split User Agent into two lines: main UA, parenthetical details on smaller, muted second line.
- Render Created and Last Activity as date (text-sm) on first line and time (text-xs, muted) on second line.

## Risks & Assumptions
- Assume `getUserDisplay` secondary value corresponds to username/handle.
- User agent strings contain parentheses; if not, show entire UA on first line only.
- Keep Tailwind-only styling; avoid CSS changes.

## Script Additions
- None.
