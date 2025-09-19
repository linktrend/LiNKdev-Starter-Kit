-- Billing & Entitlements Module - Organization Scoped
-- Adds organization-scoped billing tables alongside existing user-scoped tables

-- Create billing_customers table for org-level Stripe customer mapping
CREATE TABLE IF NOT EXISTS public.billing_customers (
  org_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on billing_customers
ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for billing_customers
-- Organization members can view their org's customer data
CREATE POLICY "Organization members can view billing customer" ON public.billing_customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE organization_members.org_id = billing_customers.org_id 
      AND organization_members.user_id = auth.uid()
    )
  );

-- Only server-side operations can insert/update customer data
CREATE POLICY "Server can manage billing customers" ON public.billing_customers
  FOR ALL USING (false); -- This will be bypassed by service role

-- Create org_subscriptions table for organization-level subscriptions
CREATE TABLE IF NOT EXISTS public.org_subscriptions (
  org_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'trialing', 'canceled', 'past_due', 'unpaid', 
    'incomplete', 'incomplete_expired', 'paused'
  )),
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT now(),
  trial_end timestamptz,
  stripe_sub_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on org_subscriptions
ALTER TABLE public.org_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for org_subscriptions
-- Organization members can view their org's subscription
CREATE POLICY "Organization members can view subscription" ON public.org_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE organization_members.org_id = org_subscriptions.org_id 
      AND organization_members.user_id = auth.uid()
    )
  );

-- Only server-side operations can manage subscriptions
CREATE POLICY "Server can manage subscriptions" ON public.org_subscriptions
  FOR ALL USING (false); -- This will be bypassed by service role

-- Create processed_events table for webhook idempotency
CREATE TABLE IF NOT EXISTS public.processed_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed_at timestamptz DEFAULT now(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS on processed_events
ALTER TABLE public.processed_events ENABLE ROW LEVEL SECURITY;

-- Only server-side operations can manage processed events
CREATE POLICY "Server can manage processed events" ON public.processed_events
  FOR ALL USING (false); -- This will be bypassed by service role

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_billing_customers_stripe_customer_id 
  ON public.billing_customers(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_org_subscriptions_plan 
  ON public.org_subscriptions(plan);

CREATE INDEX IF NOT EXISTS idx_org_subscriptions_status 
  ON public.org_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_processed_events_event_id 
  ON public.processed_events(event_id);

CREATE INDEX IF NOT EXISTS idx_processed_events_org_id 
  ON public.processed_events(org_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_billing_customers_updated_at 
  BEFORE UPDATE ON public.billing_customers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_subscriptions_updated_at 
  BEFORE UPDATE ON public.org_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
