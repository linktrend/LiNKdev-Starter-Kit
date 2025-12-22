-- =====================================================
-- Migration: 20251215000000__performance_indexes.sql
-- Purpose: Add targeted indexes for common query patterns:
--          - Audit logs filtered by user/org/timestamp
--          - Usage events filtered by org/event/time
--          - User lookups by email/username/account_type
--          - Organization member lookups by user/role
-- Notes: Non-destructive; uses IF NOT EXISTS safeguards.
-- =====================================================

-- Audit logs: org + actor + time, and actor + time
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_actor_created
  ON public.audit_logs (org_id, actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created
  ON public.audit_logs (actor_id, created_at DESC);

-- Usage events: org + event type + time, and org + time
CREATE INDEX IF NOT EXISTS idx_usage_events_org_event_created
  ON public.usage_events (org_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_usage_events_org_created
  ON public.usage_events (org_id, created_at DESC);

-- Users: case-insensitive email/username lookups and account_type ordering
CREATE INDEX IF NOT EXISTS idx_users_email_lower
  ON public.users (lower(email));

CREATE INDEX IF NOT EXISTS idx_users_username_lower
  ON public.users (lower(username))
  WHERE username IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_account_type_created
  ON public.users (account_type, created_at DESC);

-- Organization members: user-centric lookups with role filtering
CREATE INDEX IF NOT EXISTS idx_org_members_user_role
  ON public.organization_members (user_id, role);
