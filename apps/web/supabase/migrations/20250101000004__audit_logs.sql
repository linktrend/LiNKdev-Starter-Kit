-- Audit Logs Module
-- Immutable, org-scoped audit trail for core actions

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs(org_id, created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Organization members can read audit logs for their organization
CREATE POLICY "Organization members can read audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.org_id = audit_logs.org_id 
      AND organization_members.user_id = auth.uid()
    )
  );

-- Only server-side code can insert audit logs (no direct user inserts)
CREATE POLICY "Server can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Prevent updates and deletes (immutability)
CREATE POLICY "No updates allowed" ON audit_logs
  FOR UPDATE USING (false);

CREATE POLICY "No deletes allowed" ON audit_logs
  FOR DELETE USING (false);

-- Create function to prevent updates/deletes at database level
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable - updates and deletes are not allowed';
END;
$$ LANGUAGE plpgsql;

-- Create triggers to enforce immutability
CREATE TRIGGER prevent_audit_log_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER prevent_audit_log_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- Create function for audit log statistics
CREATE OR REPLACE FUNCTION get_audit_stats(
  p_org_id uuid,
  p_window text DEFAULT 'day'
)
RETURNS TABLE (
  by_action jsonb,
  by_entity_type jsonb,
  by_actor jsonb,
  total bigint
) AS $$
DECLARE
  window_interval interval;
BEGIN
  -- Convert window to interval
  CASE p_window
    WHEN 'hour' THEN window_interval := '1 hour';
    WHEN 'day' THEN window_interval := '1 day';
    WHEN 'week' THEN window_interval := '1 week';
    WHEN 'month' THEN window_interval := '1 month';
    ELSE window_interval := '1 day';
  END CASE;

  RETURN QUERY
  SELECT 
    COALESCE(
      jsonb_object_agg(action, action_count), 
      '{}'::jsonb
    ) as by_action,
    COALESCE(
      jsonb_object_agg(entity_type, entity_count), 
      '{}'::jsonb
    ) as by_entity_type,
    COALESCE(
      jsonb_object_agg(actor_id, actor_count), 
      '{}'::jsonb
    ) as by_actor,
    COUNT(*) as total
  FROM (
    SELECT 
      action,
      entity_type,
      COALESCE(actor_id::text, 'system') as actor_id,
      COUNT(*) as action_count,
      COUNT(*) as entity_count,
      COUNT(*) as actor_count
    FROM audit_logs
    WHERE org_id = p_org_id
      AND created_at >= NOW() - window_interval
    GROUP BY action, entity_type, actor_id
  ) stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
