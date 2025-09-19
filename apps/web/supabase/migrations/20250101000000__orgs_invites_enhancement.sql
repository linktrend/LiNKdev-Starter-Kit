-- Organizations & Invitations Enhancement
-- Adds invites table and enhanced policies for full org management

-- Create invites table
CREATE TABLE IF NOT EXISTS public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email citext NOT NULL,
  role text NOT NULL CHECK (role IN ('admin','editor','viewer')),
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','expired')),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  UNIQUE(org_id, email)
);

-- Enable RLS on invites
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Invites policies
CREATE POLICY invites_select ON invites FOR SELECT USING (
  -- Members can see invites for their org
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = invites.org_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY invites_insert ON invites FOR INSERT WITH CHECK (
  -- Only owners/admins can create invites
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = invites.org_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY invites_update ON invites FOR UPDATE USING (
  -- Only owners/admins can update invites
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = invites.org_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY invites_delete ON invites FOR DELETE USING (
  -- Only owners/admins can delete invites
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = invites.org_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

-- Enhanced organization_members policies
-- Add policy for updating member roles (owners/admins only)
CREATE POLICY members_update_role ON organization_members FOR UPDATE USING (
  -- Only owners/admins can update roles
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = organization_members.org_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
) WITH CHECK (
  -- Ensure the role is valid
  role IN ('owner', 'admin', 'editor', 'viewer')
);

-- Add policy for removing members (owners/admins only)
CREATE POLICY members_remove ON organization_members FOR DELETE USING (
  -- Only owners/admins can remove members
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = organization_members.org_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

-- Add policy for adding members (owners/admins only)
CREATE POLICY members_add ON organization_members FOR INSERT WITH CHECK (
  -- Only owners/admins can add members
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = organization_members.org_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
) AND role IN ('owner', 'admin', 'editor', 'viewer');

-- Enhanced organizations policies
-- Allow members to select organizations they belong to
CREATE POLICY orgs_member_select ON organizations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = organizations.id 
    AND user_id = auth.uid()
  )
);

-- Allow members to update organization details (owners only)
CREATE POLICY orgs_member_update ON organizations FOR UPDATE USING (
  auth.uid() = owner_id
) WITH CHECK (
  auth.uid() = owner_id
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_org_id ON invites(org_id);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);

-- Create function to clean up expired invites
CREATE OR REPLACE FUNCTION cleanup_expired_invites()
RETURNS void AS $$
BEGIN
  UPDATE invites 
  SET status = 'expired' 
  WHERE status = 'pending' 
  AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create function to generate invite token
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS text AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;
