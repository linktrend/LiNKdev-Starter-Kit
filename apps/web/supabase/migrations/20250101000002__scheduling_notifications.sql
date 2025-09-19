-- Scheduling & Notifications Module
-- Provides flexible reminder and notification system with event outbox

-- Create reminders table for one-off and recurring reminders
CREATE TABLE IF NOT EXISTS public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  record_id uuid REFERENCES records(id) ON DELETE SET NULL,
  title text NOT NULL,
  notes text,
  due_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'completed', 'snoozed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  snoozed_until timestamptz,
  completed_at timestamptz,
  sent_at timestamptz
);

-- Create schedules table for recurring schedule definitions
CREATE TABLE IF NOT EXISTS public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  cron text, -- Cron expression for recurring schedules
  rule jsonb, -- JSON rule for complex scheduling (e.g., "every weekday at 9am")
  active boolean DEFAULT true,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications_outbox table for event delivery
CREATE TABLE IF NOT EXISTS public.notifications_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  attempt_count integer DEFAULT 0,
  error text,
  next_retry_at timestamptz
);

-- Enable RLS on all tables
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_outbox ENABLE ROW LEVEL SECURITY;

-- Reminders RLS Policies
CREATE POLICY reminders_select ON reminders FOR SELECT USING (
  -- Users can see reminders for their org
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = reminders.org_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY reminders_insert ON reminders FOR INSERT WITH CHECK (
  -- Users can create reminders for their org
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = reminders.org_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY reminders_update ON reminders FOR UPDATE USING (
  -- Users can update reminders for their org
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = reminders.org_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY reminders_delete ON reminders FOR DELETE USING (
  -- Users can delete reminders for their org
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = reminders.org_id 
    AND user_id = auth.uid()
  )
);

-- Schedules RLS Policies
CREATE POLICY schedules_select ON schedules FOR SELECT USING (
  -- Users can see schedules for their org
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = schedules.org_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY schedules_insert ON schedules FOR INSERT WITH CHECK (
  -- Users can create schedules for their org
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = schedules.org_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY schedules_update ON schedules FOR UPDATE USING (
  -- Users can update schedules for their org
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = schedules.org_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY schedules_delete ON schedules FOR DELETE USING (
  -- Users can delete schedules for their org
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = schedules.org_id 
    AND user_id = auth.uid()
  )
);

-- Notifications Outbox RLS Policies (read-only for users, write-only for system)
CREATE POLICY notifications_outbox_select ON notifications_outbox FOR SELECT USING (
  -- Users can see outbox entries for their org
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = notifications_outbox.org_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY notifications_outbox_insert ON notifications_outbox FOR INSERT WITH CHECK (
  -- System can insert outbox entries for any org
  true
);

CREATE POLICY notifications_outbox_update ON notifications_outbox FOR UPDATE USING (
  -- System can update outbox entries
  true
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reminders_org_due ON reminders(org_id, due_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reminders_org_created ON reminders(org_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_record ON reminders(record_id) WHERE record_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_schedules_org_active ON schedules(org_id, active);
CREATE INDEX IF NOT EXISTS idx_schedules_org_created ON schedules(org_id, created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_outbox_org_created ON notifications_outbox(org_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_outbox_delivered ON notifications_outbox(delivered_at) WHERE delivered_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_outbox_retry ON notifications_outbox(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_reminders_updated_at 
  BEFORE UPDATE ON reminders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at 
  BEFORE UPDATE ON schedules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create reminders from schedules
CREATE OR REPLACE FUNCTION create_reminders_from_schedules()
RETURNS void AS $$
DECLARE
  schedule_record RECORD;
  next_due timestamptz;
BEGIN
  -- For each active schedule, create reminders based on cron/rule
  FOR schedule_record IN 
    SELECT * FROM schedules WHERE active = true
  LOOP
    -- Simple implementation: create daily reminders at 9 AM
    -- In production, this would parse cron expressions or rule JSON
    next_due := date_trunc('day', now()) + interval '1 day' + interval '9 hours';
    
    -- Only create if no pending reminder exists for today
    IF NOT EXISTS (
      SELECT 1 FROM reminders 
      WHERE org_id = schedule_record.org_id 
      AND due_at::date = next_due::date
      AND status = 'pending'
    ) THEN
      INSERT INTO reminders (org_id, title, due_at, created_by)
      VALUES (
        schedule_record.org_id,
        'Scheduled reminder from ' || schedule_record.name,
        next_due,
        schedule_record.created_by
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to emit notification events
CREATE OR REPLACE FUNCTION emit_notification_event(
  p_org_id uuid,
  p_event text,
  p_payload jsonb
)
RETURNS uuid AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO notifications_outbox (org_id, event, payload)
  VALUES (p_org_id, p_event, p_payload)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql;
