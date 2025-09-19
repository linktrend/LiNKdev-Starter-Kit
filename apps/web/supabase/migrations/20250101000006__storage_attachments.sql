-- Storage Attachments Module
-- Provides secure file storage with RLS policies and attachment tracking

-- Create storage buckets (if they don't exist)
-- Note: Buckets are created via Supabase Dashboard or CLI, but we document them here
-- Required buckets:
-- - 'attachments' (private, for record attachments)
-- - 'public-assets' (public, for shared assets)
-- - 'user-uploads' (private, for user-specific files)

-- Create attachments table for tracking file metadata
CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid REFERENCES records(id) ON DELETE CASCADE,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  
  -- File metadata
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  mime_type text NOT NULL,
  
  -- Storage location
  bucket_name text NOT NULL,
  file_path text NOT NULL,
  public_url text,
  
  -- Image-specific metadata (nullable for non-image files)
  image_width integer,
  image_height integer,
  image_format text,
  
  -- Access control
  is_public boolean DEFAULT false,
  access_token text, -- For signed URLs
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- For temporary access
  
  -- Ensure either org_id or user_id is provided, but not both
  CONSTRAINT attachments_owner_check CHECK (
    (org_id IS NOT NULL AND user_id IS NULL) OR 
    (org_id IS NULL AND user_id IS NOT NULL)
  ),
  
  -- Ensure file_path is unique within bucket
  UNIQUE(bucket_name, file_path)
);

-- Enable RLS
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attachments_record_id ON attachments(record_id);
CREATE INDEX IF NOT EXISTS idx_attachments_org_id ON attachments(org_id);
CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_attachments_created_by ON attachments(created_by);
CREATE INDEX IF NOT EXISTS idx_attachments_bucket_path ON attachments(bucket_name, file_path);
CREATE INDEX IF NOT EXISTS idx_attachments_expires_at ON attachments(expires_at) WHERE expires_at IS NOT NULL;

-- RLS Policies for attachments
CREATE POLICY attachments_select ON attachments FOR SELECT USING (
  -- Users can see attachments they created or that belong to them/their org
  created_by = auth.uid() OR
  user_id = auth.uid() OR
  is_public = true OR
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = attachments.org_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY attachments_insert ON attachments FOR INSERT WITH CHECK (
  -- Users can create attachments for themselves or their org
  created_by = auth.uid() AND (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE org_id = attachments.org_id 
      AND user_id = auth.uid()
    )
  )
);

CREATE POLICY attachments_update ON attachments FOR UPDATE USING (
  -- Users can update attachments they created or that belong to them/their org
  created_by = auth.uid() OR
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = attachments.org_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY attachments_delete ON attachments FOR DELETE USING (
  -- Users can delete attachments they created or that belong to them/their org
  created_by = auth.uid() OR
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = attachments.org_id 
    AND user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_attachments_updated_at 
  BEFORE UPDATE ON attachments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate signed URLs (placeholder - actual implementation in API)
CREATE OR REPLACE FUNCTION generate_signed_url(
  bucket_name text,
  file_path text,
  expires_in_seconds integer DEFAULT 3600
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a placeholder function
  -- Actual signed URL generation happens in the API layer
  -- This function exists for documentation and potential future use
  RETURN NULL;
END;
$$;

-- Add comment explaining the migration
COMMENT ON TABLE attachments IS 'Tracks file attachments with metadata and access control';
COMMENT ON COLUMN attachments.bucket_name IS 'Supabase Storage bucket name';
COMMENT ON COLUMN attachments.file_path IS 'Path within the bucket';
COMMENT ON COLUMN attachments.public_url IS 'Public URL if file is public, otherwise null';
COMMENT ON COLUMN attachments.access_token IS 'Token for signed URL access';
COMMENT ON COLUMN attachments.expires_at IS 'When the access token expires (for temporary access)';

-- ROLLBACK NOTE:
-- To rollback this migration:
-- 1. DROP TABLE IF EXISTS public.attachments CASCADE;
-- 2. DROP FUNCTION IF EXISTS generate_signed_url(text, text, integer);
-- 3. This will remove all attachment metadata but NOT the actual files in storage
-- 4. Files in Supabase Storage buckets will remain and need manual cleanup if desired
