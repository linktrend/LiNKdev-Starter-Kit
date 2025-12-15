# W1-T2 Types Sync

- Regenerated `apps/web/src/types/database.types.ts` directly from `apps/web/schema.sql` (no Supabase CLI). Captures current tables/enums, check-constraint unions (roles, plan/status enums, usage events), and foreign key relationships.
- Synced `packages/types/src/*` to the refreshed schema:
  - `db.ts` now re-exports the generated Database/Json and helpers from `apps/web`.
  - `user.ts`, `org.ts`, `billing.ts`, `usage.ts`, `audit.ts`, and `attachments.ts` now align to Supabase tables (users, organizations/members/invites, org_subscriptions/billing_customers, usage_events/usage_aggregations) and add JSDoc for complex shapes.
  - Org roles now match DB constraints (`owner|admin|editor|viewer`); usage event enums match DB checks; subscription status/plan/billing interval enums mirror DB checks.
- Added CI drift guard: `scripts/check-type-drift.ts` parses `apps/web/schema.sql`, regenerates `database.types.ts` plus `packages/types/src/db.ts`, and exits non-zero on drift. Usage:
  - Check: `pnpm exec tsx scripts/check-type-drift.ts`
  - Regenerate: `pnpm exec tsx scripts/check-type-drift.ts --write`
- Added `tsx` as a workspace dev dependency so the drift check runs via `pnpm exec tsx ...`.

Notes / Follow-ups
- Schema snapshot does not contain an `audit_logs` table; audit domain types remain manual to match existing app usage—verify schema if audit logging should be DB-backed.
- Legacy role value `member` is no longer valid per DB constraints; update any runtime logic still relying on it to use `admin`/`editor`/`viewer` as appropriate.
- Storage/attachment types remain for application use even though no `attachments` table exists in the current schema snapshot.
