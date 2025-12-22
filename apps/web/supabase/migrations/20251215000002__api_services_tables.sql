-- API Services Tables Migration
-- Creates tables for notifications, user settings, org settings, and team invites
-- Part of W3-T2: API Package - Implement Missing Services

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
-- In-app notifications for users (distinct from notifications_outbox for events)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY notifications_select ON notifications FOR SELECT USING (
  -- Users can only see their own notifications
  auth.uid() = user_id
);

CREATE POLICY notifications_update ON notifications FOR UPDATE USING (
  -- Users can only update their own notifications
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY notifications_delete ON notifications FOR DELETE USING (
  -- Users can only delete their own notifications
  auth.uid() = user_id
);

CREATE POLICY notifications_insert ON notifications FOR INSERT WITH CHECK (
  -- System can create notifications for users in their orgs
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = notifications.org_id 
    AND user_id = notifications.user_id
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org_user_read ON notifications(org_id, user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- USER SETTINGS TABLE
-- ============================================================================
-- User-level preferences and settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  email_notifications jsonb DEFAULT '{"marketing": true, "features": true, "security": true, "updates": true}'::jsonb,
  push_notifications jsonb DEFAULT '{"enabled": false, "browser": false, "mobile": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY user_settings_select ON user_settings FOR SELECT USING (
  -- Users can only see their own settings
  auth.uid() = user_id
);

CREATE POLICY user_settings_insert ON user_settings FOR INSERT WITH CHECK (
  -- Users can only create their own settings
  auth.uid() = user_id
);

CREATE POLICY user_settings_update ON user_settings FOR UPDATE USING (
  -- Users can only update their own settings
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY user_settings_delete ON user_settings FOR DELETE USING (
  -- Users can only delete their own settings
  auth.uid() = user_id
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- ============================================================================
-- ORG SETTINGS TABLE
-- ============================================================================
-- Organization-level settings and configuration
CREATE TABLE IF NOT EXISTS public.org_settings (
  org_id uuid PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE org_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for org_settings
CREATE POLICY org_settings_select ON org_settings FOR SELECT USING (
  -- Members can view org settings
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = org_settings.org_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY org_settings_insert ON org_settings FOR INSERT WITH CHECK (
  -- Only owners can create org settings
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = org_settings.org_id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

CREATE POLICY org_settings_update ON org_settings FOR UPDATE USING (
  -- Only owners can update org settings
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = org_settings.org_id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = org_settings.org_id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

CREATE POLICY org_settings_delete ON org_settings FOR DELETE USING (
  -- Only owners can delete org settings
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = org_settings.org_id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_org_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER org_settings_updated_at
  BEFORE UPDATE ON org_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_org_settings_updated_at();

-- ============================================================================
-- TEAM INVITES TABLE
-- ============================================================================
-- Team invitation system (separate from existing invites table for clarity)
CREATE TABLE IF NOT EXISTS public.team_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email citext NOT NULL,
  role text NOT NULL CHECK (role IN ('member', 'viewer')),
  token text NOT NULL UNIQUE,
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(org_id, email)
);

-- Enable RLS
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_invites
CREATE POLICY team_invites_select ON team_invites FOR SELECT USING (
  -- Members can see invites for their org
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = team_invites.org_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY team_invites_insert ON team_invites FOR INSERT WITH CHECK (
  -- Only owners/members can create invites
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = team_invites.org_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'member')
  )
);

CREATE POLICY team_invites_update ON team_invites FOR UPDATE USING (
  -- Only owners/members can update invites
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = team_invites.org_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'member')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = team_invites.org_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'member')
  )
);

CREATE POLICY team_invites_delete ON team_invites FOR DELETE USING (
  -- Only owners/members can delete invites
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = team_invites.org_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'member')
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_invites_org_id ON team_invites(org_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON team_invites(email);
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON team_invites(token);
CREATE INDEX IF NOT EXISTS idx_team_invites_org_status ON team_invites(org_id, status);
CREATE INDEX IF NOT EXISTS idx_team_invites_expires_at ON team_invites(expires_at) WHERE status = 'pending';

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to clean up expired team invites
CREATE OR REPLACE FUNCTION cleanup_expired_team_invites()
RETURNS void AS $$
BEGIN
  UPDATE team_invites 
  SET status = 'expired' 
  WHERE status = 'pending' 
  AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Function to generate secure invite token
CREATE OR REPLACE FUNCTION generate_team_invite_token()
RETURNS text AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE notifications IS 'In-app notifications for users (distinct from notifications_outbox for event delivery)';
COMMENT ON TABLE user_settings IS 'User-level preferences including theme, language, timezone, and notification preferences';
COMMENT ON TABLE org_settings IS 'Organization-level settings stored as JSONB for flexibility';
COMMENT ON TABLE team_invites IS 'Team invitation system with token-based acceptance and expiration';

COMMENT ON COLUMN notifications.type IS 'Notification type: info, success, warning, or error';
COMMENT ON COLUMN notifications.metadata IS 'Additional notification data stored as JSONB';
COMMENT ON COLUMN user_settings.email_notifications IS 'Email notification preferences by category';
COMMENT ON COLUMN user_settings.push_notifications IS 'Push notification preferences for browser and mobile';
COMMENT ON COLUMN org_settings.settings IS 'Flexible JSONB storage for organization configuration';
COMMENT ON COLUMN team_invites.token IS 'Secure token for invite acceptance (32 bytes, hex encoded)';
COMMENT ON COLUMN team_invites.expires_at IS 'Invitation expiration timestamp (default 7 days from creation)';
