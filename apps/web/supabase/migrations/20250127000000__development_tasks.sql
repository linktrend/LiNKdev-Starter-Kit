-- Development Tasks Module
-- Task management for development work items with optional Notion sync

-- Create enum types for status and priority
CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'review', 'done', 'blocked');
CREATE TYPE task_priority AS ENUM ('low', 'normal', 'high', 'urgent');

-- Create development_tasks table
CREATE TABLE IF NOT EXISTS public.development_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'normal',
  assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notion_page_id text,
  notion_database_id text,
  metadata jsonb DEFAULT '{}',
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_development_tasks_org_id ON development_tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_development_tasks_status ON development_tasks(status);
CREATE INDEX IF NOT EXISTS idx_development_tasks_priority ON development_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_development_tasks_assignee_id ON development_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_development_tasks_created_by ON development_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_development_tasks_due_date ON development_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_development_tasks_created_at ON development_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_development_tasks_updated_at ON development_tasks(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_development_tasks_notion_page_id ON development_tasks(notion_page_id) WHERE notion_page_id IS NOT NULL;

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_development_tasks_org_status ON development_tasks(org_id, status);
CREATE INDEX IF NOT EXISTS idx_development_tasks_org_assignee ON development_tasks(org_id, assignee_id);
CREATE INDEX IF NOT EXISTS idx_development_tasks_org_priority ON development_tasks(org_id, priority);
CREATE INDEX IF NOT EXISTS idx_development_tasks_org_due_date ON development_tasks(org_id, due_date) WHERE due_date IS NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_development_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_development_tasks_timestamp
  BEFORE UPDATE ON development_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_development_tasks_updated_at();

-- Enable RLS
ALTER TABLE development_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Organization members can read tasks for their organization
CREATE POLICY "Organization members can read development tasks" ON development_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.org_id = development_tasks.org_id 
      AND organization_members.user_id = auth.uid()
    )
  );

-- Organization members can insert tasks
CREATE POLICY "Organization members can create development tasks" ON development_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.org_id = development_tasks.org_id 
      AND organization_members.user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Organization members can update tasks
CREATE POLICY "Organization members can update development tasks" ON development_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.org_id = development_tasks.org_id 
      AND organization_members.user_id = auth.uid()
    )
  );

-- Organization members can delete tasks
CREATE POLICY "Organization members can delete development tasks" ON development_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.org_id = development_tasks.org_id 
      AND organization_members.user_id = auth.uid()
    )
  );

-- Rollback instructions:
-- To rollback this migration:
-- 1. DROP TRIGGER IF EXISTS update_development_tasks_timestamp ON development_tasks;
-- 2. DROP FUNCTION IF EXISTS update_development_tasks_updated_at();
-- 3. DROP POLICY IF EXISTS "Organization members can delete development tasks" ON development_tasks;
-- 4. DROP POLICY IF EXISTS "Organization members can update development tasks" ON development_tasks;
-- 5. DROP POLICY IF EXISTS "Organization members can create development tasks" ON development_tasks;
-- 6. DROP POLICY IF EXISTS "Organization members can read development tasks" ON development_tasks;
-- 7. ALTER TABLE development_tasks DISABLE ROW LEVEL SECURITY;
-- 8. DROP INDEX IF EXISTS idx_development_tasks_org_due_date;
-- 9. DROP INDEX IF EXISTS idx_development_tasks_org_priority;
-- 10. DROP INDEX IF EXISTS idx_development_tasks_org_assignee;
-- 11. DROP INDEX IF EXISTS idx_development_tasks_org_status;
-- 12. DROP INDEX IF EXISTS idx_development_tasks_notion_page_id;
-- 13. DROP INDEX IF EXISTS idx_development_tasks_updated_at;
-- 14. DROP INDEX IF EXISTS idx_development_tasks_created_at;
-- 15. DROP INDEX IF EXISTS idx_development_tasks_due_date;
-- 16. DROP INDEX IF EXISTS idx_development_tasks_created_by;
-- 17. DROP INDEX IF EXISTS idx_development_tasks_assignee_id;
-- 18. DROP INDEX IF EXISTS idx_development_tasks_priority;
-- 19. DROP INDEX IF EXISTS idx_development_tasks_status;
-- 20. DROP INDEX IF EXISTS idx_development_tasks_org_id;
-- 21. DROP TABLE IF EXISTS development_tasks;
-- 22. DROP TYPE IF EXISTS task_priority;
-- 23. DROP TYPE IF EXISTS task_status;

