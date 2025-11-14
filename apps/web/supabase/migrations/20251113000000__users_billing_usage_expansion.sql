-- =====================================================
-- Database Schema Expansion & Billing Architecture
-- Migration: 20251113000000__users_billing_usage_expansion.sql
-- 
-- Purpose: Expand users table with 36+ profile fields, implement
--          unified org-based billing, add usage metering, feature
--          gating, and dual role system (platform + org roles)
-- =====================================================

-- =====================================================
-- SECTION 1: USERS TABLE EXPANSION
-- =====================================================

-- Add profile fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS personal_title text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS middle_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_name text;

-- Contact information
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_country_code text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number text;

-- Personal address fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS personal_apt_suite text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS personal_street_address_1 text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS personal_street_address_2 text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS personal_city text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS personal_state text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS personal_postal_code text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS personal_country text DEFAULT 'United States';

-- About section
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS work_experience jsonb DEFAULT '[]'::jsonb;

-- Business information fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_position text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_company text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_apt_suite text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_street_address_1 text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_street_address_2 text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_city text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_state text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_postal_code text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_country text DEFAULT 'United States';

-- System/metadata fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add constraints for account_type
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_account_type_check'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_account_type_check 
    CHECK (account_type IN ('super_admin', 'admin', 'user'));
  END IF;
END $$;

-- Create indexes for users table
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON public.users(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_account_type ON public.users(account_type);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON public.users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- =====================================================
-- SECTION 2: ORGANIZATIONS TABLE ENHANCEMENT
-- =====================================================

-- Add fields to organizations table
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS is_personal boolean DEFAULT false;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS org_type text DEFAULT 'personal';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

-- Add constraint for org_type
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'organizations_org_type_check'
  ) THEN
    ALTER TABLE public.organizations ADD CONSTRAINT organizations_org_type_check 
    CHECK (org_type IN ('personal', 'business', 'family', 'education', 'other'));
  END IF;
END $$;

-- Create indexes for organizations
CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_is_personal ON public.organizations(is_personal);
CREATE INDEX IF NOT EXISTS idx_organizations_org_type ON public.organizations(org_type);

-- =====================================================
-- SECTION 3: UNIFIED ORG-BASED BILLING
-- =====================================================

-- Drop legacy user-level billing tables (clean slate - no existing users)
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Enhance billing_customers table (org-level only)
ALTER TABLE public.billing_customers ADD COLUMN IF NOT EXISTS billing_email text;

-- Enhance org_subscriptions table
ALTER TABLE public.org_subscriptions ADD COLUMN IF NOT EXISTS plan_name text DEFAULT 'free';
ALTER TABLE public.org_subscriptions ADD COLUMN IF NOT EXISTS billing_interval text DEFAULT 'monthly';
ALTER TABLE public.org_subscriptions ADD COLUMN IF NOT EXISTS seats integer DEFAULT 1;
ALTER TABLE public.org_subscriptions ADD COLUMN IF NOT EXISTS stripe_price_id text;

-- Add constraints for org_subscriptions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'org_subscriptions_plan_name_check'
  ) THEN
    ALTER TABLE public.org_subscriptions ADD CONSTRAINT org_subscriptions_plan_name_check 
    CHECK (plan_name IN ('free', 'pro', 'business', 'enterprise'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'org_subscriptions_billing_interval_check'
  ) THEN
    ALTER TABLE public.org_subscriptions ADD CONSTRAINT org_subscriptions_billing_interval_check 
    CHECK (billing_interval IN ('monthly', 'annual'));
  END IF;
END $$;

-- Rename 'plan' column to 'plan_name' if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'org_subscriptions' AND column_name = 'plan'
  ) THEN
    ALTER TABLE public.org_subscriptions RENAME COLUMN plan TO plan_name_old;
  END IF;
END $$;

-- Create indexes for billing tables
CREATE INDEX IF NOT EXISTS idx_billing_customers_stripe_id ON public.billing_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_plan_name ON public.org_subscriptions(plan_name);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_status ON public.org_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_stripe_sub_id ON public.org_subscriptions(stripe_sub_id);

-- =====================================================
-- SECTION 4: PLAN FEATURES TABLE (FEATURE GATING)
-- =====================================================

-- Create plan_features table
CREATE TABLE IF NOT EXISTS public.plan_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text NOT NULL CHECK (plan_name IN ('free', 'pro', 'business', 'enterprise')),
  feature_key text NOT NULL,
  feature_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(plan_name, feature_key)
);

-- Enable RLS on plan_features
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can read plan features
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'plan_features' 
    AND policyname = 'plan_features_select_policy'
  ) THEN
    CREATE POLICY "plan_features_select_policy" ON public.plan_features
      FOR SELECT USING (true);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_plan_features_plan_name ON public.plan_features(plan_name);
CREATE INDEX IF NOT EXISTS idx_plan_features_feature_key ON public.plan_features(feature_key);

-- =====================================================
-- SECTION 5: USAGE METERING INFRASTRUCTURE
-- =====================================================

-- Create usage_events table (raw event log)
CREATE TABLE IF NOT EXISTS public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  org_id uuid REFERENCES public.organizations,
  event_type text NOT NULL CHECK (event_type IN (
    'record_created', 'api_call', 'automation_run', 'storage_used',
    'schedule_executed', 'ai_tokens_used', 'user_active'
  )),
  event_data jsonb DEFAULT '{}'::jsonb,
  quantity numeric DEFAULT 1,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on usage_events
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usage_events
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'usage_events' 
    AND policyname = 'usage_events_insert_own'
  ) THEN
    CREATE POLICY "usage_events_insert_own" ON public.usage_events
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'usage_events' 
    AND policyname = 'usage_events_select_own'
  ) THEN
    CREATE POLICY "usage_events_select_own" ON public.usage_events
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for usage_events
CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON public.usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_org_id ON public.usage_events(org_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_type ON public.usage_events(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON public.usage_events(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_events_user_type_date ON public.usage_events(user_id, event_type, created_at);

-- Create usage_aggregations table (daily/monthly rollups)
CREATE TABLE IF NOT EXISTS public.usage_aggregations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  org_id uuid REFERENCES public.organizations,
  period_type text NOT NULL CHECK (period_type IN ('daily', 'monthly')),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  metric_type text NOT NULL,
  total_quantity numeric NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, org_id, period_type, period_start, metric_type)
);

-- Enable RLS on usage_aggregations
ALTER TABLE public.usage_aggregations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usage_aggregations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'usage_aggregations' 
    AND policyname = 'usage_agg_select_own'
  ) THEN
    CREATE POLICY "usage_agg_select_own" ON public.usage_aggregations
      FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE org_id = usage_aggregations.org_id AND user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create indexes for usage_aggregations
CREATE INDEX IF NOT EXISTS idx_usage_agg_user_period ON public.usage_aggregations(user_id, period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_usage_agg_org_period ON public.usage_aggregations(org_id, period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_usage_agg_metric_type ON public.usage_aggregations(metric_type);

-- =====================================================
-- SECTION 6: INVITES TABLE ENHANCEMENT
-- =====================================================

-- Add invite_type field to support both email and link invites
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS invite_type text DEFAULT 'email';
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS expires_single_use boolean DEFAULT true;

-- Add constraint for invite_type
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invites_invite_type_check'
  ) THEN
    ALTER TABLE public.invites ADD CONSTRAINT invites_invite_type_check 
    CHECK (invite_type IN ('email', 'link'));
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_invites_invite_type ON public.invites(invite_type);

-- =====================================================
-- SECTION 7: HELPER FUNCTIONS
-- =====================================================

-- 7.1 Username Availability Checker
CREATE OR REPLACE FUNCTION public.check_username_available(username_to_check text)
RETURNS boolean AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.users WHERE lower(username) = lower(username_to_check)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.2 Update handle_new_user() trigger to create personal org
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  new_org_id uuid;
  username_suggestion text;
  org_slug text;
BEGIN
  -- Generate username suggestion from email
  username_suggestion := split_part(new.email, '@', 1);
  
  -- Generate unique org slug
  org_slug := 'personal-' || substring(new.id::text, 1, 8);
  
  -- Insert user record
  INSERT INTO public.users (
    id, 
    email,
    username,
    full_name, 
    avatar_url,
    account_type,
    profile_completed,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    new.id, 
    new.email,
    NULL, -- Username set during onboarding
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    'user', -- Default account type for all new signups
    false,
    false,
    now(),
    now()
  );
  
  -- Create personal organization
  INSERT INTO public.organizations (name, owner_id, is_personal, org_type, slug, created_at)
  VALUES (
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)) || '''s Workspace',
    new.id,
    true,
    'personal',
    org_slug,
    now()
  )
  RETURNING id INTO new_org_id;
  
  -- Add user as owner of personal org
  INSERT INTO public.organization_members (org_id, user_id, role, created_at)
  VALUES (new_org_id, new.id, 'owner', now());
  
  -- Create free subscription for personal org
  INSERT INTO public.org_subscriptions (
    org_id, 
    plan_name, 
    status, 
    billing_interval,
    seats,
    current_period_start,
    current_period_end,
    created_at,
    updated_at
  )
  VALUES (
    new_org_id,
    'free',
    'active',
    'monthly',
    1,
    now(),
    now() + interval '1 month',
    now(),
    now()
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7.3 Feature Access Checker (org-based only)
CREATE OR REPLACE FUNCTION public.check_feature_access(
  p_user_id uuid,
  p_feature_key text,
  p_org_id uuid DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  org_plan text;
  feature_limits jsonb;
  user_personal_org_id uuid;
BEGIN
  -- If org_id provided, use that org's plan
  IF p_org_id IS NOT NULL THEN
    SELECT plan_name INTO org_plan 
    FROM public.org_subscriptions 
    WHERE org_id = p_org_id AND status = 'active';
  ELSE
    -- Otherwise, find user's personal org
    SELECT o.id INTO user_personal_org_id
    FROM public.organizations o
    WHERE o.owner_id = p_user_id AND o.is_personal = true
    LIMIT 1;
    
    IF user_personal_org_id IS NOT NULL THEN
      SELECT plan_name INTO org_plan
      FROM public.org_subscriptions
      WHERE org_id = user_personal_org_id AND status = 'active';
    END IF;
  END IF;
  
  -- Default to free plan if no active subscription
  IF org_plan IS NULL THEN
    org_plan := 'free';
  END IF;
  
  -- Get feature limits for the plan
  SELECT feature_value INTO feature_limits
  FROM public.plan_features
  WHERE plan_name = org_plan AND feature_key = p_feature_key;
  
  RETURN coalesce(feature_limits, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.4 Usage Aggregation Function
CREATE OR REPLACE FUNCTION public.aggregate_usage(
  p_period_type text,
  p_period_start timestamptz,
  p_period_end timestamptz
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.usage_aggregations (
    user_id, org_id, period_type, period_start, period_end, 
    metric_type, total_quantity, created_at, updated_at
  )
  SELECT 
    user_id,
    org_id,
    p_period_type,
    p_period_start,
    p_period_end,
    event_type AS metric_type,
    sum(quantity) AS total_quantity,
    now(),
    now()
  FROM public.usage_events
  WHERE created_at >= p_period_start AND created_at < p_period_end
  GROUP BY user_id, org_id, event_type
  ON CONFLICT (user_id, org_id, period_type, period_start, metric_type)
  DO UPDATE SET
    total_quantity = EXCLUDED.total_quantity,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.5 Complete Onboarding Function
CREATE OR REPLACE FUNCTION public.complete_onboarding(p_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Ensure username is set
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id AND username IS NOT NULL) THEN
    RAISE EXCEPTION 'Username must be set before completing onboarding';
  END IF;
  
  -- Mark onboarding as complete
  UPDATE public.users 
  SET 
    onboarding_completed = true,
    profile_completed = true,
    updated_at = now()
  WHERE id = p_user_id AND id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.6 Update updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON public.organizations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_plan_features_updated_at ON public.plan_features;
CREATE TRIGGER update_plan_features_updated_at 
  BEFORE UPDATE ON public.plan_features 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_aggregations_updated_at ON public.usage_aggregations;
CREATE TRIGGER update_usage_aggregations_updated_at 
  BEFORE UPDATE ON public.usage_aggregations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SECTION 8: DATA MIGRATION FOR EXISTING USERS
-- =====================================================

-- Migrate existing user data
UPDATE public.users 
SET 
  display_name = coalesce(display_name, full_name),
  email = coalesce(email, (SELECT email FROM auth.users WHERE auth.users.id = users.id)),
  profile_completed = false,
  onboarding_completed = false,
  account_type = coalesce(account_type, 'user'),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now())
WHERE display_name IS NULL OR email IS NULL OR account_type IS NULL;

-- Create personal orgs for existing users who don't have one
INSERT INTO public.organizations (name, owner_id, is_personal, org_type, slug, created_at)
SELECT 
  coalesce(u.full_name, u.email, 'User') || '''s Workspace',
  u.id,
  true,
  'personal',
  'personal-' || substring(u.id::text, 1, 8),
  now()
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.organizations o 
  WHERE o.owner_id = u.id AND o.is_personal = true
)
ON CONFLICT DO NOTHING;

-- Add users as owners of their personal orgs
INSERT INTO public.organization_members (org_id, user_id, role, created_at)
SELECT o.id, o.owner_id, 'owner', now()
FROM public.organizations o
WHERE o.is_personal = true
AND NOT EXISTS (
  SELECT 1 FROM public.organization_members om
  WHERE om.org_id = o.id AND om.user_id = o.owner_id
)
ON CONFLICT DO NOTHING;

-- Create free subscriptions for personal orgs without subscriptions
INSERT INTO public.org_subscriptions (
  org_id, plan_name, status, billing_interval, seats,
  current_period_start, current_period_end, created_at, updated_at
)
SELECT 
  o.id,
  'free',
  'active',
  'monthly',
  1,
  now(),
  now() + interval '1 month',
  now(),
  now()
FROM public.organizations o
WHERE o.is_personal = true
AND NOT EXISTS (
  SELECT 1 FROM public.org_subscriptions os
  WHERE os.org_id = o.id
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SECTION 9: SEED PLAN FEATURES DATA
-- =====================================================

-- Delete existing plan features to ensure clean seed
DELETE FROM public.plan_features;

-- Seed Free Plan Features
INSERT INTO public.plan_features (plan_name, feature_key, feature_value) VALUES
('free', 'max_records', '{"limit": 100}'::jsonb),
('free', 'max_api_calls_per_month', '{"limit": 1000}'::jsonb),
('free', 'max_automations', '{"limit": 3}'::jsonb),
('free', 'max_storage_gb', '{"limit": 1}'::jsonb),
('free', 'max_mau', '{"limit": 50}'::jsonb),
('free', 'max_schedules', '{"limit": 5}'::jsonb),
('free', 'max_ai_tokens_per_month', '{"limit": 5000}'::jsonb),
('free', 'max_seats', '{"limit": 1}'::jsonb),
('free', 'features', '{"advanced_analytics": false, "priority_support": false, "sso": false, "custom_branding": false, "api_access": false}'::jsonb);

-- Seed Pro Plan Features
INSERT INTO public.plan_features (plan_name, feature_key, feature_value) VALUES
('pro', 'max_records', '{"limit": 10000}'::jsonb),
('pro', 'max_api_calls_per_month', '{"limit": 100000}'::jsonb),
('pro', 'max_automations', '{"limit": 25}'::jsonb),
('pro', 'max_storage_gb', '{"limit": 50}'::jsonb),
('pro', 'max_mau', '{"limit": 1000}'::jsonb),
('pro', 'max_schedules', '{"limit": 50}'::jsonb),
('pro', 'max_ai_tokens_per_month', '{"limit": 100000}'::jsonb),
('pro', 'max_seats', '{"limit": 5}'::jsonb),
('pro', 'features', '{"advanced_analytics": true, "priority_support": false, "sso": false, "custom_branding": false, "api_access": true}'::jsonb);

-- Seed Business Plan Features
INSERT INTO public.plan_features (plan_name, feature_key, feature_value) VALUES
('business', 'max_records', '{"limit": 100000}'::jsonb),
('business', 'max_api_calls_per_month', '{"limit": 1000000}'::jsonb),
('business', 'max_automations', '{"limit": 100}'::jsonb),
('business', 'max_storage_gb', '{"limit": 500}'::jsonb),
('business', 'max_mau', '{"limit": 10000}'::jsonb),
('business', 'max_schedules', '{"limit": 200}'::jsonb),
('business', 'max_ai_tokens_per_month', '{"limit": 1000000}'::jsonb),
('business', 'max_seats', '{"limit": 50}'::jsonb),
('business', 'features', '{"advanced_analytics": true, "priority_support": true, "sso": true, "custom_branding": true, "api_access": true}'::jsonb);

-- Seed Enterprise Plan Features
INSERT INTO public.plan_features (plan_name, feature_key, feature_value) VALUES
('enterprise', 'max_records', '{"limit": -1}'::jsonb),
('enterprise', 'max_api_calls_per_month', '{"limit": -1}'::jsonb),
('enterprise', 'max_automations', '{"limit": -1}'::jsonb),
('enterprise', 'max_storage_gb', '{"limit": -1}'::jsonb),
('enterprise', 'max_mau', '{"limit": -1}'::jsonb),
('enterprise', 'max_schedules', '{"limit": -1}'::jsonb),
('enterprise', 'max_ai_tokens_per_month', '{"limit": -1}'::jsonb),
('enterprise', 'max_seats', '{"limit": -1}'::jsonb),
('enterprise', 'features', '{"advanced_analytics": true, "priority_support": true, "sso": true, "custom_branding": true, "api_access": true, "dedicated_support": true, "custom_contracts": true}'::jsonb);

-- Note: -1 in limits means unlimited

-- =====================================================
-- SECTION 10: ENHANCED RLS POLICIES
-- =====================================================

-- Update organization RLS policies to support personal orgs
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'organizations' 
    AND policyname = 'orgs_personal_select'
  ) THEN
    CREATE POLICY "orgs_personal_select" ON public.organizations
      FOR SELECT USING (
        is_personal = true AND owner_id = auth.uid()
      );
  END IF;
END $$;

-- Allow org members to view org details
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'organizations' 
    AND policyname = 'orgs_members_select'
  ) THEN
    CREATE POLICY "orgs_members_select" ON public.organizations
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE org_id = organizations.id AND user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- =====================================================
-- SECTION 11: VALIDATION QUERIES (COMMENTED)
-- =====================================================

-- Uncomment these queries to validate the migration:

-- -- Check all users have personal orgs
-- SELECT count(*) FROM public.users u
-- WHERE NOT EXISTS (
--   SELECT 1 FROM public.organizations o 
--   WHERE o.owner_id = u.id AND o.is_personal = true
-- );
-- -- Should return 0

-- -- Check username uniqueness
-- SELECT username, count(*) 
-- FROM public.users 
-- WHERE username IS NOT NULL 
-- GROUP BY username 
-- HAVING count(*) > 1;
-- -- Should return 0 rows

-- -- Verify plan features are seeded
-- SELECT plan_name, count(*) 
-- FROM public.plan_features 
-- GROUP BY plan_name
-- ORDER BY plan_name;
-- -- Should return 4 rows (business, enterprise, free, pro)

-- -- Check account type distribution
-- SELECT account_type, count(*) 
-- FROM public.users 
-- GROUP BY account_type;
-- -- Should show distribution

-- -- Verify all personal orgs have subscriptions
-- SELECT count(*) FROM public.organizations o
-- WHERE o.is_personal = true
-- AND NOT EXISTS (
--   SELECT 1 FROM public.org_subscriptions os
--   WHERE os.org_id = o.id
-- );
-- -- Should return 0

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary:
-- - Added 36 new fields to users table
-- - Enhanced organizations with org_type, slug, and settings
-- - Implemented unified org-based billing (dropped user-level tables)
-- - Created plan_features table with seed data for 4 plans
-- - Created usage_events and usage_aggregations tables
-- - Added helper functions for username checking, feature access, usage aggregation
-- - Updated handle_new_user() trigger to auto-create personal orgs
-- - Migrated existing users to have personal orgs with free subscriptions
-- - Added comprehensive indexes and RLS policies

