# W1-T1 Database Schema Briefing

## Files changed
- `apps/web/supabase/migrations/20251215000000__performance_indexes.sql` — adds targeted performance indexes.
- `apps/web/schema.sql` — refreshed indexes and comprehensive RLS summary to match migrations.
- `apps/web/scripts/seed-dev-data.sql` — idempotent dev seed data (5 users, 3 orgs, events, audit logs).
- `apps/web/docs/DATABASE_SCHEMA.md` — schema overview, ER diagram, index/RLS notes.

## Indexes added (migration)
- Audit logs: `idx_audit_logs_org_actor_created`, `idx_audit_logs_actor_created`.
- Usage events: `idx_usage_events_org_event_created`, `idx_usage_events_org_created`.
- Users: `idx_users_email_lower`, `idx_users_username_lower`, `idx_users_account_type_created`.
- Organization members: `idx_org_members_user_role`.

## RLS verification
- Confirmed policies in migrations now reflected in schema snapshot:
  - `users`: self read/update.
  - `organizations`: owner insert/update/select; personal-org select; member select.
  - `organization_members`: member select; owners/admins add/update/remove; self-delete.
  - `invites`: owners/admins manage, members view.
  - `billing_customers`, `org_subscriptions`, `processed_events`: server-only writes, member read for billing/subscriptions.
  - `usage_events`: insert/select only when `auth.uid()` matches `user_id`.
  - `usage_aggregations`: select when owner of row or member of scoped org.
  - `products`, `prices`, `plan_features`: public read.
  - `audit_logs`: org members read; server insert; updates/deletes blocked (immutable).

## Seed script status
- `apps/web/scripts/seed-dev-data.sql` is idempotent, uses fixed UUIDs/password hashes, and sets up orgs/members/subscriptions plus sample usage events and audit logs.
- Not executed here; run via Supabase SQL editor or `supabase db seed` in a dev environment (requires elevated role to insert into `auth.users`).

## Outstanding/notes
- Supabase CLI was not run (per instruction); recommended validation: `supabase db status` and `supabase db diff --linked` after applying migrations.
- No data was modified; migration is index-only.
