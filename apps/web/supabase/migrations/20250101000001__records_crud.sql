-- Records (Generic Entities) + CRUD Module
-- Provides a flexible system for creating and managing arbitrary entities with custom fields

-- Create record_types table for defining entity schemas
CREATE TABLE IF NOT EXISTS public.record_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  config jsonb NOT NULL DEFAULT '{}',
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create records table for storing entity instances
CREATE TABLE IF NOT EXISTS public.records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id uuid NOT NULL REFERENCES record_types(id) ON DELETE CASCADE,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Ensure either org_id or user_id is provided, but not both
  CONSTRAINT records_owner_check CHECK (
    (org_id IS NOT NULL AND user_id IS NULL) OR 
    (org_id IS NULL AND user_id IS NOT NULL)
  )
);

-- Enable RLS on both tables
ALTER TABLE record_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- Record Types Policies
CREATE POLICY record_types_select ON record_types FOR SELECT USING (
  -- Users can see record types they created or that are public
  created_by = auth.uid() OR 
  (config->>'is_public')::boolean = true
);

CREATE POLICY record_types_insert ON record_types FOR INSERT WITH CHECK (
  -- Users can create record types
  created_by = auth.uid()
);

CREATE POLICY record_types_update ON record_types FOR UPDATE USING (
  -- Users can update their own record types
  created_by = auth.uid()
);

CREATE POLICY record_types_delete ON record_types FOR DELETE USING (
  -- Users can delete their own record types
  created_by = auth.uid()
);

-- Records Policies
CREATE POLICY records_select ON records FOR SELECT USING (
  -- Users can see records they created or that belong to their org
  created_by = auth.uid() OR
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = records.org_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY records_insert ON records FOR INSERT WITH CHECK (
  -- Users can create records for themselves or their org
  created_by = auth.uid() AND (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE org_id = records.org_id 
      AND user_id = auth.uid()
    )
  )
);

CREATE POLICY records_update ON records FOR UPDATE USING (
  -- Users can update records they created or that belong to them/their org
  created_by = auth.uid() OR
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = records.org_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY records_delete ON records FOR DELETE USING (
  -- Users can delete records they created or that belong to them/their org
  created_by = auth.uid() OR
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = records.org_id 
    AND user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_record_types_key ON record_types(key);
CREATE INDEX IF NOT EXISTS idx_record_types_created_by ON record_types(created_by);
CREATE INDEX IF NOT EXISTS idx_records_type_id ON records(type_id);
CREATE INDEX IF NOT EXISTS idx_records_org_id ON records(org_id);
CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_created_by ON records(created_by);
CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_record_types_updated_at 
  BEFORE UPDATE ON record_types 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_records_updated_at 
  BEFORE UPDATE ON records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
