-- =====================================================
-- Usage Tracking Enhancement Migration
-- Migration: 20251215000003__usage_tracking.sql
-- 
-- Purpose: Add API usage tracking and daily usage summary tables
--          for comprehensive usage analytics and monitoring
-- =====================================================

-- =====================================================
-- SECTION 1: API USAGE TABLE
-- =====================================================

-- Create api_usage table for tracking individual API calls
CREATE TABLE IF NOT EXISTS public.api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint text NOT NULL,
  method text NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  status_code integer NOT NULL,
  response_time_ms integer NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for api_usage
CREATE INDEX IF NOT EXISTS idx_api_usage_org_created ON public.api_usage(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint_created ON public.api_usage(endpoint, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_org_endpoint_created ON public.api_usage(org_id, endpoint, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_created ON public.api_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_status ON public.api_usage(status_code);

-- Enable RLS on api_usage
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Organization members can read their org's API usage
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'api_usage' 
    AND policyname = 'api_usage_select_org_members'
  ) THEN
    CREATE POLICY "api_usage_select_org_members" ON public.api_usage
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE org_id = api_usage.org_id AND user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- RLS Policy: Server can insert API usage (service role)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'api_usage' 
    AND policyname = 'api_usage_insert_server'
  ) THEN
    CREATE POLICY "api_usage_insert_server" ON public.api_usage
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- =====================================================
-- SECTION 2: DAILY USAGE SUMMARY TABLE
-- =====================================================

-- Create daily_usage_summary table for pre-aggregated metrics
CREATE TABLE IF NOT EXISTS public.daily_usage_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  date date NOT NULL,
  api_calls integer DEFAULT 0,
  active_users integer DEFAULT 0,
  storage_bytes bigint DEFAULT 0,
  records_created integer DEFAULT 0,
  automations_run integer DEFAULT 0,
  schedules_executed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(org_id, date)
);

-- Create indexes for daily_usage_summary
CREATE INDEX IF NOT EXISTS idx_daily_usage_org_date ON public.daily_usage_summary(org_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_usage_date ON public.daily_usage_summary(date DESC);

-- Enable RLS on daily_usage_summary
ALTER TABLE public.daily_usage_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Organization members can read their org's usage summary
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'daily_usage_summary' 
    AND policyname = 'daily_usage_select_org_members'
  ) THEN
    CREATE POLICY "daily_usage_select_org_members" ON public.daily_usage_summary
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE org_id = daily_usage_summary.org_id AND user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- RLS Policy: Server can insert/update usage summary
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'daily_usage_summary' 
    AND policyname = 'daily_usage_upsert_server'
  ) THEN
    CREATE POLICY "daily_usage_upsert_server" ON public.daily_usage_summary
      FOR ALL WITH CHECK (true);
  END IF;
END $$;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_daily_usage_summary_updated_at ON public.daily_usage_summary;
CREATE TRIGGER update_daily_usage_summary_updated_at 
  BEFORE UPDATE ON public.daily_usage_summary 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SECTION 3: ENHANCED INDEXES FOR EXISTING TABLES
-- =====================================================

-- Add composite indexes to audit_logs for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_user_created ON public.audit_logs(org_id, actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_created ON public.audit_logs(entity_type, entity_id, created_at DESC);

-- Add composite indexes to usage_events for aggregation queries
CREATE INDEX IF NOT EXISTS idx_usage_events_org_type_created ON public.usage_events(org_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_user_org_created ON public.usage_events(user_id, org_id, created_at DESC);

-- =====================================================
-- SECTION 4: DATABASE FUNCTIONS
-- =====================================================

-- 4.1 Aggregate Daily Usage Function
CREATE OR REPLACE FUNCTION public.aggregate_daily_usage(
  p_target_date date DEFAULT CURRENT_DATE - INTERVAL '1 day'
)
RETURNS void AS $$
DECLARE
  v_start_ts timestamptz;
  v_end_ts timestamptz;
BEGIN
  -- Calculate timestamp range for the target date
  v_start_ts := p_target_date::timestamptz;
  v_end_ts := (p_target_date + INTERVAL '1 day')::timestamptz;
  
  -- Aggregate usage data for each organization
  INSERT INTO public.daily_usage_summary (
    org_id,
    date,
    api_calls,
    active_users,
    storage_bytes,
    records_created,
    automations_run,
    schedules_executed,
    created_at,
    updated_at
  )
  SELECT 
    org_id,
    p_target_date,
    -- Count API calls from api_usage table
    COALESCE((
      SELECT COUNT(*) 
      FROM public.api_usage 
      WHERE api_usage.org_id = orgs.id 
      AND created_at >= v_start_ts 
      AND created_at < v_end_ts
    ), 0) as api_calls,
    -- Count active users from usage_events
    COALESCE((
      SELECT COUNT(DISTINCT user_id)
      FROM public.usage_events
      WHERE usage_events.org_id = orgs.id
      AND event_type = 'user_active'
      AND created_at >= v_start_ts
      AND created_at < v_end_ts
    ), 0) as active_users,
    -- Sum storage from usage_events
    COALESCE((
      SELECT SUM(quantity)
      FROM public.usage_events
      WHERE usage_events.org_id = orgs.id
      AND event_type = 'storage_used'
      AND created_at >= v_start_ts
      AND created_at < v_end_ts
    ), 0) as storage_bytes,
    -- Count records created
    COALESCE((
      SELECT SUM(quantity)
      FROM public.usage_events
      WHERE usage_events.org_id = orgs.id
      AND event_type = 'record_created'
      AND created_at >= v_start_ts
      AND created_at < v_end_ts
    ), 0) as records_created,
    -- Count automations run
    COALESCE((
      SELECT SUM(quantity)
      FROM public.usage_events
      WHERE usage_events.org_id = orgs.id
      AND event_type = 'automation_run'
      AND created_at >= v_start_ts
      AND created_at < v_end_ts
    ), 0) as automations_run,
    -- Count schedules executed
    COALESCE((
      SELECT SUM(quantity)
      FROM public.usage_events
      WHERE usage_events.org_id = orgs.id
      AND event_type = 'schedule_executed'
      AND created_at >= v_start_ts
      AND created_at < v_end_ts
    ), 0) as schedules_executed,
    now(),
    now()
  FROM public.organizations orgs
  WHERE EXISTS (
    SELECT 1 FROM public.usage_events
    WHERE usage_events.org_id = orgs.id
    AND created_at >= v_start_ts
    AND created_at < v_end_ts
  )
  ON CONFLICT (org_id, date)
  DO UPDATE SET
    api_calls = EXCLUDED.api_calls,
    active_users = EXCLUDED.active_users,
    storage_bytes = EXCLUDED.storage_bytes,
    records_created = EXCLUDED.records_created,
    automations_run = EXCLUDED.automations_run,
    schedules_executed = EXCLUDED.schedules_executed,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.2 Get API Usage Stats Function
CREATE OR REPLACE FUNCTION public.get_api_usage_stats(
  p_org_id uuid,
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  endpoint text,
  method text,
  call_count bigint,
  avg_response_time numeric,
  error_count bigint,
  error_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    api_usage.endpoint,
    api_usage.method,
    COUNT(*) as call_count,
    ROUND(AVG(api_usage.response_time_ms)::numeric, 2) as avg_response_time,
    COUNT(*) FILTER (WHERE api_usage.status_code >= 400) as error_count,
    ROUND(
      (COUNT(*) FILTER (WHERE api_usage.status_code >= 400)::numeric / 
       NULLIF(COUNT(*)::numeric, 0) * 100), 
      2
    ) as error_rate
  FROM public.api_usage
  WHERE api_usage.org_id = p_org_id
    AND api_usage.created_at >= p_start_date
    AND api_usage.created_at <= p_end_date
  GROUP BY api_usage.endpoint, api_usage.method
  ORDER BY call_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.3 Get Active Users Count Function
CREATE OR REPLACE FUNCTION public.get_active_users_count(
  p_org_id uuid,
  p_period text DEFAULT 'day',
  p_reference_date timestamptz DEFAULT now()
)
RETURNS TABLE (
  period_type text,
  active_users bigint,
  period_start timestamptz,
  period_end timestamptz
) AS $$
DECLARE
  v_start_ts timestamptz;
  v_end_ts timestamptz;
BEGIN
  -- Calculate period boundaries
  CASE p_period
    WHEN 'day' THEN
      v_start_ts := date_trunc('day', p_reference_date);
      v_end_ts := v_start_ts + INTERVAL '1 day';
    WHEN 'week' THEN
      v_start_ts := date_trunc('week', p_reference_date);
      v_end_ts := v_start_ts + INTERVAL '1 week';
    WHEN 'month' THEN
      v_start_ts := date_trunc('month', p_reference_date);
      v_end_ts := v_start_ts + INTERVAL '1 month';
    ELSE
      v_start_ts := date_trunc('day', p_reference_date);
      v_end_ts := v_start_ts + INTERVAL '1 day';
  END CASE;

  RETURN QUERY
  SELECT 
    p_period as period_type,
    COUNT(DISTINCT user_id) as active_users,
    v_start_ts as period_start,
    v_end_ts as period_end
  FROM public.usage_events
  WHERE org_id = p_org_id
    AND event_type = 'user_active'
    AND created_at >= v_start_ts
    AND created_at < v_end_ts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.4 Get Storage Usage Function
CREATE OR REPLACE FUNCTION public.get_storage_usage(
  p_org_id uuid
)
RETURNS TABLE (
  total_bytes bigint,
  file_count bigint,
  last_updated timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(quantity), 0)::bigint as total_bytes,
    COUNT(*)::bigint as file_count,
    MAX(created_at) as last_updated
  FROM public.usage_events
  WHERE org_id = p_org_id
    AND event_type = 'storage_used';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 5: HELPER VIEWS
-- =====================================================

-- Create view for recent API usage (last 30 days)
CREATE OR REPLACE VIEW public.recent_api_usage AS
SELECT 
  org_id,
  endpoint,
  method,
  COUNT(*) as call_count,
  AVG(response_time_ms) as avg_response_time,
  COUNT(*) FILTER (WHERE status_code >= 400) as error_count
FROM public.api_usage
WHERE created_at >= now() - INTERVAL '30 days'
GROUP BY org_id, endpoint, method;

-- =====================================================
-- SECTION 6: GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions for service role
GRANT SELECT, INSERT ON public.api_usage TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.daily_usage_summary TO service_role;
GRANT EXECUTE ON FUNCTION public.aggregate_daily_usage TO service_role;
GRANT EXECUTE ON FUNCTION public.get_api_usage_stats TO service_role;
GRANT EXECUTE ON FUNCTION public.get_active_users_count TO service_role;
GRANT EXECUTE ON FUNCTION public.get_storage_usage TO service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary:
-- - Created api_usage table for tracking individual API calls
-- - Created daily_usage_summary table for pre-aggregated metrics
-- - Added composite indexes to audit_logs and usage_events
-- - Created aggregate_daily_usage() function for scheduled aggregation
-- - Created get_api_usage_stats() function for API usage analytics
-- - Created get_active_users_count() function for DAU/MAU/WAU metrics
-- - Created get_storage_usage() function for storage consumption
-- - Created recent_api_usage view for quick access to recent data
-- - Configured RLS policies for security
-- - Granted necessary permissions to service role
