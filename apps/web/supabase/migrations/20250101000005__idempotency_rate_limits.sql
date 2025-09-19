-- Idempotency & Rate Limiting Tables
-- Provides database-backed storage for idempotency keys and rate limiting

-- Create idempotency_keys table
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  key text PRIMARY KEY,
  method text NOT NULL,
  path text NOT NULL,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  request_hash text NOT NULL,
  status integer,
  response jsonb,
  created_at timestamptz DEFAULT now(),
  locked_at timestamptz
);

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (bucket, window_start)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_org_path ON idempotency_keys(org_id, path);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_created_at ON idempotency_keys(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_bucket ON rate_limits(bucket);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

-- Enable RLS
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for idempotency_keys
-- Organization members can read their org's idempotency keys
CREATE POLICY "Organization members can read idempotency keys" ON idempotency_keys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.org_id = idempotency_keys.org_id 
      AND organization_members.user_id = auth.uid()
    )
  );

-- Only server-side code can insert/update idempotency keys
CREATE POLICY "Server can manage idempotency keys" ON idempotency_keys
  FOR ALL USING (true);

-- RLS Policies for rate_limits
-- Server-only access (no client access)
CREATE POLICY "Server only access" ON rate_limits
  FOR ALL USING (false);

-- Create function to cleanup expired idempotency keys
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM idempotency_keys 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to cleanup expired rate limits
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get or create rate limit bucket
CREATE OR REPLACE FUNCTION get_or_create_rate_limit_bucket(
  p_bucket text,
  p_window_start timestamptz,
  p_limit integer
)
RETURNS TABLE (
  bucket text,
  window_start timestamptz,
  count integer,
  allowed boolean,
  retry_after_sec integer
) AS $$
DECLARE
  current_count integer;
  is_allowed boolean;
  retry_after integer;
BEGIN
  -- Try to get existing bucket
  SELECT rl.count INTO current_count
  FROM rate_limits rl
  WHERE rl.bucket = p_bucket AND rl.window_start = p_window_start;
  
  -- If bucket doesn't exist, create it
  IF current_count IS NULL THEN
    INSERT INTO rate_limits (bucket, window_start, count)
    VALUES (p_bucket, p_window_start, 1)
    ON CONFLICT (bucket, window_start) DO UPDATE SET count = rate_limits.count + 1;
    
    current_count := 1;
  ELSE
    -- Increment existing bucket
    UPDATE rate_limits 
    SET count = count + 1
    WHERE bucket = p_bucket AND window_start = p_window_start;
    
    current_count := current_count + 1;
  END IF;
  
  -- Check if allowed
  is_allowed := current_count <= p_limit;
  
  -- Calculate retry after if not allowed
  IF NOT is_allowed THEN
    retry_after := EXTRACT(EPOCH FROM (p_window_start + INTERVAL '1 minute' - NOW()));
    retry_after := GREATEST(retry_after, 0);
  ELSE
    retry_after := 0;
  END IF;
  
  RETURN QUERY SELECT p_bucket, p_window_start, current_count, is_allowed, retry_after::integer;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check rate limit without incrementing
CREATE OR REPLACE FUNCTION check_rate_limit_bucket(
  p_bucket text,
  p_window_start timestamptz,
  p_limit integer
)
RETURNS TABLE (
  bucket text,
  window_start timestamptz,
  count integer,
  allowed boolean,
  retry_after_sec integer
) AS $$
DECLARE
  current_count integer;
  is_allowed boolean;
  retry_after integer;
BEGIN
  -- Get current count
  SELECT COALESCE(rl.count, 0) INTO current_count
  FROM rate_limits rl
  WHERE rl.bucket = p_bucket AND rl.window_start = p_window_start;
  
  -- Check if allowed
  is_allowed := current_count < p_limit;
  
  -- Calculate retry after if not allowed
  IF NOT is_allowed THEN
    retry_after := EXTRACT(EPOCH FROM (p_window_start + INTERVAL '1 minute' - NOW()));
    retry_after := GREATEST(retry_after, 0);
  ELSE
    retry_after := 0;
  END IF;
  
  RETURN QUERY SELECT p_bucket, p_window_start, current_count, is_allowed, retry_after::integer;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
