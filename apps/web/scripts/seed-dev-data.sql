-- ==========================================================
-- Seed Dev Data (Idempotent)
-- Generates 5 users (1 owner/super-admin, 2 admins, 2 standard),
-- 3 organizations with memberships, sample usage events, and audit logs.
-- Safe to re-run; uses fixed IDs and ON CONFLICT safeguards.
-- ==========================================================

BEGIN;

-- Ensure pgcrypto for gen_random_uuid/crypt in local dev
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------
-- 1) Seed auth.users (platform identities) and public.users profile data
-- ----------------------------------------------------------
WITH seed_users AS (
  SELECT *
  FROM (VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'owner@ltm.dev',   'Olivia Owner',   'olivia.owner',   'super_admin', 'OwnerPassword123!'),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'admin1@ltm.dev',  'Adam Admin',     'adam.admin',     'admin',       'Admin1Password123!'),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'admin2@ltm.dev',  'Ava Admin',      'ava.admin',      'admin',       'Admin2Password123!'),
    ('44444444-4444-4444-4444-444444444444'::uuid, 'user1@ltm.dev',   'Sam Standard',   'sam.standard',   'user',        'User1Password123!'),
    ('55555555-5555-5555-5555-555555555555'::uuid, 'user2@ltm.dev',   'Sydney Standard','sydney.standard','user',        'User2Password123!')
  ) AS t(id, email, full_name, username, account_type, raw_password)
),
insert_auth AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, confirmation_token
  )
  SELECT
    '00000000-0000-0000-0000-000000000000',
    id,
    'authenticated',
    'authenticated',
    email,
    crypt(raw_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', full_name, 'seed', true),
    ''
  FROM seed_users
  ON CONFLICT (id) DO NOTHING
  RETURNING id
),
upsert_users AS (
  INSERT INTO public.users (
    id, email, full_name, username, account_type,
    onboarding_completed, profile_completed, created_at, updated_at
  )
  SELECT
    id, email, full_name, username, account_type,
    true, true, now(), now()
  FROM seed_users
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    username = COALESCE(public.users.username, EXCLUDED.username),
    account_type = EXCLUDED.account_type,
    onboarding_completed = true,
    profile_completed = true,
    updated_at = now()
  RETURNING id
)
SELECT 1;

-- ----------------------------------------------------------
-- 2) Seed organizations and memberships
-- ----------------------------------------------------------
WITH seed_orgs AS (
  SELECT *
  FROM (VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Productivity Labs', 'owner@ltm.dev',  false, 'business', 'productivity-labs', 'Collaborative automation workspace'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Analytics Hub',     'admin1@ltm.dev', false, 'business', 'analytics-hub',     'Data insights and reporting'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'Ops Studio',        'admin2@ltm.dev', false, 'business', 'ops-studio',        'Operational runbooks and automation')
  ) AS t(id, name, owner_email, is_personal, org_type, slug, description)
),
resolved_orgs AS (
  SELECT
    t.id,
    t.name,
    u.id AS owner_id,
    t.is_personal,
    t.org_type,
    t.slug,
    t.description
  FROM seed_orgs t
  JOIN public.users u ON u.email = t.owner_email
),
upsert_orgs AS (
  INSERT INTO public.organizations (id, name, owner_id, is_personal, org_type, slug, description, created_at, updated_at)
  SELECT id, name, owner_id, is_personal, org_type, slug, description, now(), now()
  FROM resolved_orgs
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    owner_id = EXCLUDED.owner_id,
    is_personal = EXCLUDED.is_personal,
    org_type = EXCLUDED.org_type,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id, name
),
seed_memberships AS (
  SELECT * FROM (VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'owner@ltm.dev',   'owner'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin1@ltm.dev',  'admin'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin2@ltm.dev',  'admin'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'user1@ltm.dev',   'editor'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'user2@ltm.dev',   'viewer'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'admin1@ltm.dev',  'owner'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'admin2@ltm.dev',  'admin'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'user1@ltm.dev',   'editor'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'user2@ltm.dev',   'viewer'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'admin2@ltm.dev',  'owner'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'admin1@ltm.dev',  'admin'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'user1@ltm.dev',   'admin'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'user2@ltm.dev',   'viewer')
  ) AS t(org_id, member_email, role)
),
resolved_memberships AS (
  SELECT
    sm.org_id,
    u.id AS user_id,
    sm.role
  FROM seed_memberships sm
  JOIN public.users u ON u.email = sm.member_email
)
INSERT INTO public.organization_members (org_id, user_id, role, created_at)
SELECT org_id, user_id, role, now()
FROM resolved_memberships
ON CONFLICT (org_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  created_at = LEAST(public.organization_members.created_at, EXCLUDED.created_at);

-- ----------------------------------------------------------
-- 3) Seed subscriptions (sample plans) for seeded orgs
-- ----------------------------------------------------------
INSERT INTO public.org_subscriptions (
  org_id, plan_name, status, billing_interval, seats,
  current_period_start, current_period_end, created_at, updated_at
)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'pro',       'active', 'monthly', 10, now() - interval '10 days', now() + interval '20 days', now(), now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'business',  'active', 'annual',  25, now() - interval '15 days', now() + interval '350 days', now(), now()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'free',      'active', 'monthly', 5,  now() - interval '5 days',  now() + interval '25 days',  now(), now())
ON CONFLICT (org_id) DO UPDATE SET
  plan_name = EXCLUDED.plan_name,
  status = EXCLUDED.status,
  billing_interval = EXCLUDED.billing_interval,
  seats = EXCLUDED.seats,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  updated_at = now();

-- ----------------------------------------------------------
-- 4) Sample usage events
-- ----------------------------------------------------------
INSERT INTO public.usage_events (id, user_id, org_id, event_type, event_data, quantity, created_at)
VALUES
  ('90000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'api_call',         '{"path":"/records"}', 3, now() - interval '2 days'),
  ('90000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'automation_run',   '{"flow":"daily-sync"}', 1, now() - interval '1 day'),
  ('90000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'record_created',   '{"entity":"report"}', 5, now() - interval '3 days'),
  ('90000000-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ai_tokens_used',   '{"model":"gpt-4.1"}', 1200, now() - interval '12 hours'),
  ('90000000-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'schedule_executed','{"schedule":"nightly-backup"}', 1, now() - interval '6 hours'),
  ('90000000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'user_active',      '{"device":"web"}', 1, now() - interval '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------
-- 5) Sample audit logs
-- ----------------------------------------------------------
INSERT INTO public.audit_logs (id, org_id, actor_id, action, entity_type, entity_id, metadata, created_at)
VALUES
  ('80000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'invite_sent',      'user',    'admin1@ltm.dev', '{"role":"admin"}', now() - interval '2 days'),
  ('80000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'settings_updated', 'org',     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"field":"billing_interval","value":"monthly"}', now() - interval '18 hours'),
  ('80000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'record_created',   'report',  'Q3-analytics', '{"status":"draft"}', now() - interval '1 day'),
  ('80000000-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'permissions_change','member', 'user1@ltm.dev', '{"role_from":"viewer","role_to":"editor"}', now() - interval '6 hours'),
  ('80000000-0000-0000-0000-000000000005', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', 'schedule_executed','job',     'nightly-backup', '{"result":"success"}', now() - interval '2 hours')
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Verification helpers (optional)
-- SELECT * FROM public.users WHERE email LIKE '%@ltm.dev';
-- SELECT org_id, user_id, role FROM public.organization_members WHERE org_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','cccccccc-cccc-cccc-cccc-cccccccccccc');
-- SELECT action, actor_id, created_at FROM public.audit_logs ORDER BY created_at DESC LIMIT 10;
