-- =====================================================
-- CONSOLIDATED SCHEMA SNAPSHOT
-- Last Updated: 2025-11-20
-- Source: Consolidated from migrations (up to 20251113000000)
-- 
-- NOTE: This file is for reference only. The actual database state 
-- is managed via Supabase migrations in supabase/migrations/.
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS citext;

-- =====================================================
-- 1. ENUMS & TYPES
-- =====================================================

-- Billing & Subscription Types
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');
CREATE TYPE pricing_type AS ENUM ('one_time', 'recurring');
CREATE TYPE pricing_plan_interval AS ENUM ('day', 'week', 'month', 'year');

-- =====================================================
-- 2. CORE AUTH & USERS
-- =====================================================

CREATE TABLE public.users (
    -- Base Fields
    id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
    full_name text,
    avatar_url text,
    billing_address jsonb,
    payment_method jsonb,
    
    -- Extended Profile Fields (from 20251113)
    username text,
    display_name text,
    personal_title text,
    first_name text,
    middle_name text,
    last_name text,
    
    -- Contact Info
    email text,
    phone_country_code text,
    phone_number text,
    
    -- Address Fields (Personal)
    personal_apt_suite text,
    personal_street_address_1 text,
    personal_street_address_2 text,
    personal_city text,
    personal_state text,
    personal_postal_code text,
    personal_country text DEFAULT 'United States',
    
    -- About & Metadata
    bio text,
    education jsonb DEFAULT '[]'::jsonb,
    work_experience jsonb DEFAULT '[]'::jsonb,
    
    -- Business Info
    business_position text,
    business_company text,
    business_apt_suite text,
    business_street_address_1 text,
    business_street_address_2 text,
    business_city text,
    business_state text,
    business_postal_code text,
    business_country text DEFAULT 'United States',
    
    -- System Fields
    account_type text DEFAULT 'user' CHECK (account_type IN ('super_admin', 'admin', 'user')),
    profile_completed boolean DEFAULT false,
    onboarding_completed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. ORGANIZATIONS & TEAMS
-- =====================================================

CREATE TABLE public.organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    
    -- Enhanced Fields
    is_personal boolean DEFAULT false,
    org_type text DEFAULT 'personal' CHECK (org_type IN ('personal', 'business', 'family', 'education', 'other')),
    slug text UNIQUE,
    description text,
    avatar_url text,
    settings jsonb DEFAULT '{}'::jsonb,
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.organization_members (
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    role text NOT NULL CHECK (role IN ('owner','admin','editor','viewer')),
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (org_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- View for backwards compatibility if needed
CREATE OR REPLACE VIEW team_members AS
    SELECT om.user_id, om.org_id as team_id, om.role
    FROM organization_members om;

-- =====================================================
-- 4. INVITES
-- =====================================================

CREATE TABLE public.invites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email citext NOT NULL,
    role text NOT NULL CHECK (role IN ('admin','editor','viewer')),
    token text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','expired')),
    created_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz DEFAULT (now() + interval '7 days'),
    
    -- Enhanced Fields
    invite_type text DEFAULT 'email' CHECK (invite_type IN ('email', 'link')),
    expires_single_use boolean DEFAULT true,
    
    UNIQUE(org_id, email)
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. BILLING & SUBSCRIPTIONS (Unified Org-Based)
-- =====================================================

CREATE TABLE public.billing_customers (
    org_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    stripe_customer_id text UNIQUE,
    billing_email text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.org_subscriptions (
    org_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan_name text NOT NULL DEFAULT 'free' CHECK (plan_name IN ('free', 'pro', 'business', 'enterprise')),
    status text NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'trialing', 'canceled', 'past_due', 'unpaid', 
        'incomplete', 'incomplete_expired', 'paused'
    )),
    billing_interval text DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'annual')),
    seats integer DEFAULT 1,
    stripe_price_id text,
    current_period_start timestamptz DEFAULT now(),
    current_period_end timestamptz DEFAULT now(),
    trial_end timestamptz,
    stripe_sub_id text UNIQUE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.org_subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. FEATURES & LIMITS
-- =====================================================

CREATE TABLE public.plan_features (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name text NOT NULL CHECK (plan_name IN ('free', 'pro', 'business', 'enterprise')),
    feature_key text NOT NULL,
    feature_value jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(plan_name, feature_key)
);

ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. USAGE METERING
-- =====================================================

CREATE TABLE public.usage_events (
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

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.usage_aggregations (
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

ALTER TABLE public.usage_aggregations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. PRODUCTS & PRICES (Public Catalog)
-- =====================================================

CREATE TABLE public.products (
    id text PRIMARY KEY,
    active boolean,
    name text,
    description text,
    image text,
    metadata jsonb
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.prices (
    id text PRIMARY KEY,
    product_id text REFERENCES products, 
    active boolean,
    description text,
    unit_amount bigint,
    currency text CHECK (char_length(currency) = 3),
    type pricing_type,
    interval pricing_plan_interval,
    interval_count integer,
    trial_period_days integer,
    metadata jsonb
);

ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. WEBHOOK PROCESSING
-- =====================================================

CREATE TABLE public.processed_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id text UNIQUE NOT NULL,
    event_type text NOT NULL,
    processed_at timestamptz DEFAULT now(),
    org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    metadata jsonb DEFAULT '{}'
);

ALTER TABLE public.processed_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. INDEXES
-- =====================================================

-- Users
CREATE UNIQUE INDEX idx_users_username ON public.users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_email_lower ON public.users(lower(email));
CREATE INDEX idx_users_account_type ON public.users(account_type);
CREATE INDEX idx_users_account_type_created ON public.users(account_type, created_at DESC);
CREATE INDEX idx_users_onboarding_completed ON public.users(onboarding_completed);
CREATE INDEX idx_users_created_at ON public.users(created_at);
CREATE INDEX idx_users_username_lower ON public.users(lower(username)) WHERE username IS NOT NULL;

-- Organizations
CREATE UNIQUE INDEX idx_organizations_slug ON public.organizations(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_organizations_is_personal ON public.organizations(is_personal);
CREATE INDEX idx_organizations_org_type ON public.organizations(org_type);

-- Organization Members
CREATE INDEX idx_organization_members_org_id ON public.organization_members(org_id);
CREATE INDEX idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_org_members_user_role ON public.organization_members(user_id, role);

-- Invites
CREATE INDEX idx_invites_org_id ON public.invites(org_id);
CREATE INDEX idx_invites_email ON public.invites(email);
CREATE INDEX idx_invites_token ON public.invites(token);
CREATE INDEX idx_invites_status ON public.invites(status);
CREATE INDEX idx_invites_invite_type ON public.invites(invite_type);

-- Billing
CREATE INDEX idx_billing_customers_stripe_id ON public.billing_customers(stripe_customer_id);
CREATE INDEX idx_org_subscriptions_plan_name ON public.org_subscriptions(plan_name);
CREATE INDEX idx_org_subscriptions_status ON public.org_subscriptions(status);
CREATE INDEX idx_org_subscriptions_stripe_sub_id ON public.org_subscriptions(stripe_sub_id);

-- Plan Features
CREATE INDEX idx_plan_features_plan_name ON public.plan_features(plan_name);
CREATE INDEX idx_plan_features_feature_key ON public.plan_features(feature_key);

-- Usage
CREATE INDEX idx_usage_events_user_id ON public.usage_events(user_id);
CREATE INDEX idx_usage_events_org_id ON public.usage_events(org_id);
CREATE INDEX idx_usage_events_type ON public.usage_events(event_type);
CREATE INDEX idx_usage_events_created_at ON public.usage_events(created_at);
CREATE INDEX idx_usage_events_user_type_date ON public.usage_events(user_id, event_type, created_at);
CREATE INDEX idx_usage_events_org_created ON public.usage_events(org_id, created_at DESC);
CREATE INDEX idx_usage_events_org_event_created ON public.usage_events(org_id, event_type, created_at DESC);
CREATE INDEX idx_usage_agg_user_period ON public.usage_aggregations(user_id, period_type, period_start);
CREATE INDEX idx_usage_agg_org_period ON public.usage_aggregations(org_id, period_type, period_start);
CREATE INDEX idx_usage_agg_metric_type ON public.usage_aggregations(metric_type);

-- Processed Events
CREATE INDEX idx_processed_events_event_id ON public.processed_events(event_id);
CREATE INDEX idx_processed_events_org_id ON public.processed_events(org_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_org_id ON public.audit_logs(org_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_org_created ON public.audit_logs(org_id, created_at DESC);
CREATE INDEX idx_audit_logs_org_actor_created ON public.audit_logs(org_id, actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor_created ON public.audit_logs(actor_id, created_at DESC);

-- =====================================================
-- 11. RLS POLICIES (Comprehensive Summary)
-- =====================================================

-- Users: View/Update own data
CREATE POLICY "Can view own user data." ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Can update own user data." ON public.users FOR UPDATE USING (auth.uid() = id);

-- Organizations: Owners and members
CREATE POLICY "orgs_owner_select" ON public.organizations FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "orgs_owner_update" ON public.organizations FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "orgs_owner_insert" ON public.organizations FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "orgs_personal_select" ON public.organizations FOR SELECT USING (is_personal = true AND owner_id = auth.uid());
CREATE POLICY "orgs_members_select" ON public.organizations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE org_id = organizations.id AND user_id = auth.uid())
);
CREATE POLICY "orgs_member_select" ON public.organizations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE org_id = organizations.id AND user_id = auth.uid())
);
CREATE POLICY "orgs_member_update" ON public.organizations FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Organization Members: membership management
CREATE POLICY "members_select" ON public.organization_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.organization_members m WHERE m.org_id = public.organization_members.org_id AND m.user_id = auth.uid())
);
CREATE POLICY "members_manage_self" ON public.organization_members FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "members_add" ON public.organization_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.organization_members WHERE org_id = public.organization_members.org_id AND user_id = auth.uid() AND role IN ('owner','admin'))
) AND role IN ('owner','admin','editor','viewer');
CREATE POLICY "members_update_role" ON public.organization_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE org_id = public.organization_members.org_id AND user_id = auth.uid() AND role IN ('owner','admin'))
) WITH CHECK (role IN ('owner','admin','editor','viewer'));
CREATE POLICY "members_remove" ON public.organization_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE org_id = public.organization_members.org_id AND user_id = auth.uid() AND role IN ('owner','admin'))
);

-- Invites: owners/admins manage invites for their org
CREATE POLICY invites_select ON public.invites FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE org_id = public.invites.org_id AND user_id = auth.uid())
);
CREATE POLICY invites_insert ON public.invites FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.organization_members WHERE org_id = public.invites.org_id AND user_id = auth.uid() AND role IN ('owner','admin'))
);
CREATE POLICY invites_update ON public.invites FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE org_id = public.invites.org_id AND user_id = auth.uid() AND role IN ('owner','admin'))
);
CREATE POLICY invites_delete ON public.invites FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE org_id = public.invites.org_id AND user_id = auth.uid() AND role IN ('owner','admin'))
);

-- Billing: members read, server manages
CREATE POLICY "Organization members can view billing customer" ON public.billing_customers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE organization_members.org_id = billing_customers.org_id AND organization_members.user_id = auth.uid())
);
CREATE POLICY "Server can manage billing customers" ON public.billing_customers FOR ALL USING (false);

CREATE POLICY "Organization members can view subscription" ON public.org_subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE organization_members.org_id = org_subscriptions.org_id AND organization_members.user_id = auth.uid())
);
CREATE POLICY "Server can manage subscriptions" ON public.org_subscriptions FOR ALL USING (false);

CREATE POLICY "Server can manage processed events" ON public.processed_events FOR ALL USING (false);

-- Usage metering
CREATE POLICY "usage_events_insert_own" ON public.usage_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "usage_events_select_own" ON public.usage_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "usage_agg_select_own" ON public.usage_aggregations FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.organization_members WHERE org_id = public.usage_aggregations.org_id AND user_id = auth.uid())
);

-- Products/Pricing/Features: public read
CREATE POLICY "Allow public read-only access." ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access." ON public.prices FOR SELECT USING (true);
CREATE POLICY "plan_features_select_policy" ON public.plan_features FOR SELECT USING (true);

-- Audit Logs: org-scoped read, server write only
CREATE POLICY "Organization members can read audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE organization_members.org_id = audit_logs.org_id AND organization_members.user_id = auth.uid())
);
CREATE POLICY "Server can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "No updates allowed" ON public.audit_logs FOR UPDATE USING (false);
CREATE POLICY "No deletes allowed" ON public.audit_logs FOR DELETE USING (false);

-- =====================================================
-- 12. KEY FUNCTIONS & TRIGGERS
-- =====================================================

-- handle_new_user: Creates User + Personal Org + Free Sub
-- check_feature_access: Checks entitlement against plan
-- check_username_available: Checks uniqueness
-- aggregate_usage: Rolls up events
-- complete_onboarding: Marks profile complete
