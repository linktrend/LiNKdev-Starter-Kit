-- =====================================================
-- Error Tracking Migration (W4-T3)
-- Migration: 20251215000004__error_tracking.sql
--
-- Goal: Reuse audit_logs for error tracking with grouping, resolution,
--       and rich context while keeping non-error audit rows immutable.
-- =====================================================

-- =====================================================
-- SECTION 1: EXTEND audit_logs FOR ERROR RECORDS
-- =====================================================

-- Add error-focused columns (idempotent)
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS severity text CHECK (severity IN ('critical','error','warning','info')) DEFAULT 'error',
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS stack_trace text,
  ADD COLUMN IF NOT EXISTS component_stack text,
  ADD COLUMN IF NOT EXISTS page_url text,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS grouping_hash text,
  ADD COLUMN IF NOT EXISTS occurrence_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS first_seen timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_seen timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS resolved boolean NOT NULL DEFAULT false;

-- =====================================================
-- SECTION 2: INDEXES FOR ERROR QUERIES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_grouping_hash ON public.audit_logs(grouping_hash);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_grouping ON public.audit_logs(org_id, grouping_hash);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_severity_created ON public.audit_logs(org_id, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_resolved_created ON public.audit_logs(org_id, resolved, created_at DESC);

-- =====================================================
-- SECTION 3: UPDATE IMMUTABILITY TRIGGERS TO ALLOW ERROR UPDATES
-- =====================================================

-- Replace trigger function to allow updates/deletes for error rows only
CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS TRIGGER AS $$
DECLARE
  v_entity_type text := COALESCE(NEW.entity_type, OLD.entity_type);
BEGIN
  -- Allow modifications for error rows (entity_type = 'error')
  IF v_entity_type = 'error' THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Audit logs are immutable - updates and deletes are not allowed';
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers with updated function
DROP TRIGGER IF EXISTS prevent_audit_log_update ON public.audit_logs;
DROP TRIGGER IF EXISTS prevent_audit_log_delete ON public.audit_logs;

CREATE TRIGGER prevent_audit_log_update
  BEFORE UPDATE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_log_modification();

CREATE TRIGGER prevent_audit_log_delete
  BEFORE DELETE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_log_modification();

-- =====================================================
-- SECTION 4: RLS POLICIES FOR ERROR MUTATIONS
-- =====================================================

-- Remove legacy immutable policies so error rows can be updated/deleted under guard
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'No updates allowed'
  ) THEN
    DROP POLICY "No updates allowed" ON public.audit_logs;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'No deletes allowed'
  ) THEN
    DROP POLICY "No deletes allowed" ON public.audit_logs;
  END IF;
END $$;

-- Allow service role to update error rows (e.g., mark resolved, bump counts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'audit_logs_update_errors_service'
  ) THEN
    CREATE POLICY "audit_logs_update_errors_service" ON public.audit_logs
      FOR UPDATE USING (
        auth.role() = 'service_role' AND entity_type = 'error'
      ) WITH CHECK (
        auth.role() = 'service_role' AND entity_type = 'error'
      );
  END IF;
END $$;

-- Allow service role to delete error rows (privacy/GDPR cleanup)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'audit_logs_delete_errors_service'
  ) THEN
    CREATE POLICY "audit_logs_delete_errors_service" ON public.audit_logs
      FOR DELETE USING (
        auth.role() = 'service_role' AND entity_type = 'error'
      );
  END IF;
END $$;

-- Keep existing read/insert policies unchanged; service role bypasses RLS for maintenance tasks.

-- =====================================================
-- SECTION 5: DATA BACKFILL SAFEGUARDS
-- =====================================================

-- Ensure existing rows have non-null counters/timestamps
UPDATE public.audit_logs
SET occurrence_count = COALESCE(occurrence_count, 1),
    first_seen = COALESCE(first_seen, created_at),
    last_seen = COALESCE(last_seen, created_at),
    resolved = COALESCE(resolved, false)
WHERE occurrence_count IS NULL
   OR first_seen IS NULL
   OR last_seen IS NULL
   OR resolved IS NULL;
