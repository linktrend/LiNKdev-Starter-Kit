### Scope
- Ensure all tables rendering a user field show Display Name + Username instead of Name + Email. Target: UI-only rendering changes, 1–2 hours.

### Inputs
- Files scanned via semantic search in `apps/web/`:
  - `apps/web/src/components/org/MemberRow.tsx`
  - `apps/web/src/app/[locale]/(console)/console/security/page.tsx`
  - `apps/web/src/app/[locale]/org/[orgId]/team/page.tsx`
  - `apps/web/src/components/audit/AuditTable.tsx` (reviewed; actor rendering, not email)
  - Supporting types/utilities in `apps/web/src/server/queries/user.ts`, `apps/web/src/types/*`

### Plan
- Add a small helper `getUserDisplay` to derive `displayName` and `username` with sensible fallbacks.
- Update UI components/tables that currently render `name + email` to use `displayName + username`.
- Keep Tailwind-only styling; no CSS changes.
- Run lint/typecheck and fix local issues.

### Risks & Assumptions
- Assumption: `displayName` maps to `user.user_metadata.full_name` or `users.full_name` when present.
- Assumption: `username` may not be persisted; fallback to best-available value. Proposed fallback order: explicit `user.user_metadata.username` → `user.username` → local prop `username` if present → derive from email prefix (masked if required later).
- Risk: Some mocked/demo pages show hardcoded email strings; we will update those for consistency.
- No data model changes; UI-only.

### Script Additions
- None.
