# Migration Testing & Verification Guide

**Migration:** `20251113000000__users_billing_usage_expansion.sql`  
**Date:** 2025-11-13  
**Version:** 1.0

---

## Overview

This guide provides step-by-step instructions for testing and verifying the database schema expansion migration. Follow these steps to ensure the migration executes successfully and all features work as expected.

---

## Pre-Migration Checklist

Before running the migration:

- [ ] **Backup database** - Create a full backup of production data
- [ ] **Test on local Supabase** - Run migration on local instance first
- [ ] **Review migration SQL** - Ensure all statements are correct
- [ ] **Check dependencies** - Verify all referenced tables exist
- [ ] **Prepare rollback plan** - Document how to revert if needed

---

## Running the Migration

### Option 1: Supabase CLI (Recommended)

```bash
# Navigate to web app directory
cd apps/web

# Link to Supabase project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push

# Or apply specific migration
supabase migration up --version 20251113000000
```

---

### Option 2: Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_REF/editor
2. Click "SQL Editor"
3. Copy contents of `20251113000000__users_billing_usage_expansion.sql`
4. Paste into editor
5. Click "Run"
6. Wait for completion (may take 30-60 seconds)

---

### Option 3: Direct psql Connection

```bash
# Get connection string from Supabase dashboard
psql "postgresql://postgres:[PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

# Run migration file
\i apps/web/supabase/migrations/20251113000000__users_billing_usage_expansion.sql
```

---

## Post-Migration Validation

### 1. Check Migration Status

```sql
-- Verify migration was applied
SELECT * FROM supabase_migrations.schema_migrations
WHERE version = '20251113000000'
ORDER BY inserted_at DESC;

-- Should show 1 row with recent timestamp
```

---

### 2. Verify Table Structure

```sql
-- Check users table has new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Should show 41+ columns including:
-- username, display_name, personal_title, first_name, etc.
```

---

### 3. Verify Indexes

```sql
-- Check all indexes were created
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'organizations', 'plan_features', 'usage_events', 'usage_aggregations')
ORDER BY tablename, indexname;

-- Should show indexes like:
-- idx_users_username
-- idx_users_email
-- idx_users_account_type
-- idx_organizations_slug
-- idx_plan_features_plan_name
-- etc.
```

---

### 4. Verify Constraints

```sql
-- Check constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('users', 'organizations', 'org_subscriptions', 'plan_features')
ORDER BY tc.table_name, tc.constraint_type;

-- Should show CHECK constraints for:
-- users.account_type
-- organizations.org_type
-- org_subscriptions.plan_name
-- org_subscriptions.billing_interval
-- plan_features.plan_name
```

---

### 5. Verify Functions

```sql
-- Check helper functions exist
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'check_username_available',
    'handle_new_user',
    'check_feature_access',
    'aggregate_usage',
    'complete_onboarding',
    'update_updated_at_column'
  )
ORDER BY routine_name;

-- Should return 6 functions
```

---

### 6. Verify Triggers

```sql
-- Check triggers are attached
SELECT
  event_object_table AS table_name,
  trigger_name,
  event_manipulation AS event,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('users', 'organizations', 'plan_features', 'usage_aggregations')
ORDER BY event_object_table, trigger_name;

-- Should show:
-- on_auth_user_created (on auth.users)
-- update_users_updated_at
-- update_organizations_updated_at
-- update_plan_features_updated_at
-- update_usage_aggregations_updated_at
```

---

### 7. Verify RLS Policies

```sql
-- Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'organizations', 'plan_features', 'usage_events', 'usage_aggregations')
ORDER BY tablename, policyname;

-- Should show policies for:
-- users: Can view own user data, Can update own user data
-- organizations: orgs_personal_select, orgs_members_select, etc.
-- plan_features: plan_features_select_policy
-- usage_events: usage_events_insert_own, usage_events_select_own
-- usage_aggregations: usage_agg_select_own
```

---

### 8. Verify Seed Data

```sql
-- Check plan features were seeded
SELECT plan_name, COUNT(*) as feature_count
FROM plan_features
GROUP BY plan_name
ORDER BY plan_name;

-- Should return:
-- business: 9
-- enterprise: 9
-- free: 9
-- pro: 9

-- Check specific feature limits
SELECT plan_name, feature_key, feature_value
FROM plan_features
WHERE feature_key = 'max_records'
ORDER BY plan_name;

-- Should show:
-- business: {"limit": 100000}
-- enterprise: {"limit": -1}
-- free: {"limit": 100}
-- pro: {"limit": 10000}
```

---

### 9. Verify Legacy Tables Dropped

```sql
-- Check old billing tables are gone
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('customers', 'subscriptions');

-- Should return 0 rows (tables dropped)
```

---

### 10. Test Data Migration

```sql
-- Check existing users have personal orgs
SELECT
  u.id,
  u.email,
  u.account_type,
  o.id as org_id,
  o.name as org_name,
  o.is_personal,
  o.org_type
FROM users u
LEFT JOIN organizations o ON o.owner_id = u.id AND o.is_personal = true;

-- All users should have a personal org

-- Check all personal orgs have subscriptions
SELECT
  o.id as org_id,
  o.name,
  os.plan_name,
  os.status,
  os.seats
FROM organizations o
LEFT JOIN org_subscriptions os ON os.org_id = o.id
WHERE o.is_personal = true;

-- All personal orgs should have 'free' subscription with status 'active'
```

---

## Functional Testing

### Test 1: User Signup Flow

```sql
-- Simulate new user signup
-- (This would normally happen via auth.users insert, but we'll test the trigger)

-- Insert test user into auth.users (requires service role)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Test User"}'::jsonb,
  now(),
  now()
);

-- Check that trigger created:
-- 1. User record in public.users
SELECT * FROM users WHERE email = 'test@example.com';

-- 2. Personal organization
SELECT * FROM organizations
WHERE owner_id = (SELECT id FROM users WHERE email = 'test@example.com')
  AND is_personal = true;

-- 3. Organization membership
SELECT * FROM organization_members
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- 4. Free subscription
SELECT * FROM org_subscriptions
WHERE org_id = (
  SELECT id FROM organizations
  WHERE owner_id = (SELECT id FROM users WHERE email = 'test@example.com')
    AND is_personal = true
);

-- Clean up test user
DELETE FROM auth.users WHERE email = 'test@example.com';
```

---

### Test 2: Username Availability Check

```sql
-- Test username checker function
SELECT check_username_available('johndoe');
-- Should return: true (if username doesn't exist)

-- Create user with username
UPDATE users
SET username = 'johndoe'
WHERE id = (SELECT id FROM users LIMIT 1);

-- Check again
SELECT check_username_available('johndoe');
-- Should return: false

-- Check case-insensitive
SELECT check_username_available('JohnDoe');
-- Should return: false (case-insensitive check)

-- Clean up
UPDATE users SET username = NULL WHERE username = 'johndoe';
```

---

### Test 3: Feature Access Check

```sql
-- Test feature access function for free plan
SELECT check_feature_access(
  (SELECT id FROM users LIMIT 1),
  'max_records',
  (SELECT id FROM organizations WHERE is_personal = true LIMIT 1)
);
-- Should return: {"limit": 100}

-- Test for unlimited (enterprise)
-- First, create enterprise subscription
UPDATE org_subscriptions
SET plan_name = 'enterprise'
WHERE org_id = (SELECT id FROM organizations WHERE is_personal = true LIMIT 1);

SELECT check_feature_access(
  (SELECT id FROM users LIMIT 1),
  'max_records',
  (SELECT id FROM organizations WHERE is_personal = true LIMIT 1)
);
-- Should return: {"limit": -1}

-- Reset to free
UPDATE org_subscriptions
SET plan_name = 'free'
WHERE org_id = (SELECT id FROM organizations WHERE is_personal = true LIMIT 1);
```

---

### Test 4: Usage Event Logging

```sql
-- Log a test usage event
INSERT INTO usage_events (
  user_id,
  org_id,
  event_type,
  quantity,
  event_data
) VALUES (
  (SELECT id FROM users LIMIT 1),
  (SELECT id FROM organizations WHERE is_personal = true LIMIT 1),
  'record_created',
  1,
  '{"test": true}'::jsonb
);

-- Verify event was logged
SELECT * FROM usage_events
WHERE event_data->>'test' = 'true';

-- Clean up
DELETE FROM usage_events WHERE event_data->>'test' = 'true';
```

---

### Test 5: Usage Aggregation

```sql
-- Create test events for aggregation
DO $$
DECLARE
  test_user_id uuid;
  test_org_id uuid;
BEGIN
  SELECT id INTO test_user_id FROM users LIMIT 1;
  SELECT id INTO test_org_id FROM organizations WHERE is_personal = true LIMIT 1;
  
  -- Insert 10 test events
  FOR i IN 1..10 LOOP
    INSERT INTO usage_events (user_id, org_id, event_type, quantity, created_at)
    VALUES (
      test_user_id,
      test_org_id,
      'api_call',
      1,
      now() - interval '1 day'
    );
  END LOOP;
END $$;

-- Run aggregation for yesterday
SELECT aggregate_usage(
  'daily',
  (now() - interval '1 day')::date,
  now()::date
);

-- Check aggregation was created
SELECT *
FROM usage_aggregations
WHERE period_type = 'daily'
  AND metric_type = 'api_call'
  AND period_start::date = (now() - interval '1 day')::date;

-- Should show total_quantity = 10

-- Clean up
DELETE FROM usage_events WHERE event_type = 'api_call' AND created_at < now();
DELETE FROM usage_aggregations WHERE metric_type = 'api_call';
```

---

### Test 6: Complete Onboarding

```sql
-- Test onboarding completion (should fail without username)
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  SELECT id INTO test_user_id FROM users LIMIT 1;
  
  -- This should raise an exception
  PERFORM complete_onboarding(test_user_id);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Expected error: %', SQLERRM;
END $$;

-- Set username and try again
UPDATE users
SET username = 'testuser123'
WHERE id = (SELECT id FROM users LIMIT 1);

-- Now it should work
SELECT complete_onboarding((SELECT id FROM users LIMIT 1));

-- Verify onboarding marked complete
SELECT onboarding_completed, profile_completed
FROM users
WHERE id = (SELECT id FROM users LIMIT 1);

-- Should show both as true

-- Clean up
UPDATE users
SET username = NULL, onboarding_completed = false, profile_completed = false
WHERE username = 'testuser123';
```

---

## Performance Testing

### Test Index Performance

```sql
-- Test username lookup (should use index)
EXPLAIN ANALYZE
SELECT * FROM users WHERE username = 'testuser';

-- Should show "Index Scan using idx_users_username"

-- Test org slug lookup (should use index)
EXPLAIN ANALYZE
SELECT * FROM organizations WHERE slug = 'personal-12345678';

-- Should show "Index Scan using idx_organizations_slug"

-- Test usage events by org (should use index)
EXPLAIN ANALYZE
SELECT * FROM usage_events
WHERE org_id = (SELECT id FROM organizations LIMIT 1)
  AND created_at >= now() - interval '30 days';

-- Should show "Index Scan using idx_usage_events_org_id" or composite index
```

---

## Rollback Plan

If the migration fails or causes issues:

### Option 1: Revert via Supabase CLI

```bash
# Revert to previous migration
supabase migration down --version 20251113000000
```

---

### Option 2: Manual Rollback SQL

```sql
-- WARNING: This will drop all new tables and columns!
-- Only use if you need to completely revert the migration

BEGIN;

-- Drop new tables
DROP TABLE IF EXISTS usage_aggregations CASCADE;
DROP TABLE IF EXISTS usage_events CASCADE;
DROP TABLE IF EXISTS plan_features CASCADE;

-- Drop new functions
DROP FUNCTION IF EXISTS check_username_available(text);
DROP FUNCTION IF EXISTS check_feature_access(uuid, text, uuid);
DROP FUNCTION IF EXISTS aggregate_usage(text, timestamptz, timestamptz);
DROP FUNCTION IF EXISTS complete_onboarding(uuid);

-- Remove columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS username;
ALTER TABLE users DROP COLUMN IF EXISTS display_name;
ALTER TABLE users DROP COLUMN IF EXISTS personal_title;
ALTER TABLE users DROP COLUMN IF EXISTS first_name;
ALTER TABLE users DROP COLUMN IF EXISTS middle_name;
ALTER TABLE users DROP COLUMN IF EXISTS last_name;
ALTER TABLE users DROP COLUMN IF EXISTS email;
ALTER TABLE users DROP COLUMN IF EXISTS phone_country_code;
ALTER TABLE users DROP COLUMN IF EXISTS phone_number;
ALTER TABLE users DROP COLUMN IF EXISTS personal_apt_suite;
ALTER TABLE users DROP COLUMN IF EXISTS personal_street_address_1;
ALTER TABLE users DROP COLUMN IF EXISTS personal_street_address_2;
ALTER TABLE users DROP COLUMN IF EXISTS personal_city;
ALTER TABLE users DROP COLUMN IF EXISTS personal_state;
ALTER TABLE users DROP COLUMN IF EXISTS personal_postal_code;
ALTER TABLE users DROP COLUMN IF EXISTS personal_country;
ALTER TABLE users DROP COLUMN IF EXISTS bio;
ALTER TABLE users DROP COLUMN IF EXISTS education;
ALTER TABLE users DROP COLUMN IF EXISTS work_experience;
ALTER TABLE users DROP COLUMN IF EXISTS business_position;
ALTER TABLE users DROP COLUMN IF EXISTS business_company;
ALTER TABLE users DROP COLUMN IF EXISTS business_apt_suite;
ALTER TABLE users DROP COLUMN IF EXISTS business_street_address_1;
ALTER TABLE users DROP COLUMN IF EXISTS business_street_address_2;
ALTER TABLE users DROP COLUMN IF EXISTS business_city;
ALTER TABLE users DROP COLUMN IF EXISTS business_state;
ALTER TABLE users DROP COLUMN IF EXISTS business_postal_code;
ALTER TABLE users DROP COLUMN IF EXISTS business_country;
ALTER TABLE users DROP COLUMN IF EXISTS account_type;
ALTER TABLE users DROP COLUMN IF EXISTS profile_completed;
ALTER TABLE users DROP COLUMN IF EXISTS onboarding_completed;

-- Remove columns from organizations table
ALTER TABLE organizations DROP COLUMN IF EXISTS is_personal;
ALTER TABLE organizations DROP COLUMN IF EXISTS org_type;
ALTER TABLE organizations DROP COLUMN IF EXISTS slug;
ALTER TABLE organizations DROP COLUMN IF EXISTS description;
ALTER TABLE organizations DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE organizations DROP COLUMN IF EXISTS settings;

-- Remove columns from org_subscriptions
ALTER TABLE org_subscriptions DROP COLUMN IF EXISTS plan_name;
ALTER TABLE org_subscriptions DROP COLUMN IF EXISTS billing_interval;
ALTER TABLE org_subscriptions DROP COLUMN IF EXISTS seats;
ALTER TABLE org_subscriptions DROP COLUMN IF EXISTS stripe_price_id;

-- Recreate old tables if needed
-- (customers and subscriptions were dropped)

COMMIT;
```

---

## Success Criteria

The migration is successful if:

- [ ] All SQL statements execute without errors
- [ ] All tables, columns, indexes, and constraints exist
- [ ] All functions and triggers are created
- [ ] RLS policies are in place
- [ ] Plan features are seeded (36 rows total)
- [ ] Existing users have personal orgs with free subscriptions
- [ ] New user signup creates personal org automatically
- [ ] Username availability check works
- [ ] Feature access check works
- [ ] Usage event logging works
- [ ] Usage aggregation works
- [ ] Performance is acceptable (queries use indexes)

---

## Monitoring After Migration

### Watch for Issues

```sql
-- Monitor for errors in logs
SELECT * FROM pg_stat_activity
WHERE state = 'active'
  AND query NOT LIKE '%pg_stat_activity%';

-- Check for slow queries
SELECT
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000 -- queries taking > 1 second
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Monitor table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Next Steps After Successful Migration

1. **Update Application Code** - Wire up onboarding flow to save profile data
2. **Implement API Routes** - Create endpoints for profile CRUD
3. **Add Feature Gates** - Implement limit checking in application
4. **Set Up Usage Tracking** - Add event logging to relevant actions
5. **Configure Cron Jobs** - Set up daily/monthly aggregation
6. **Build Billing UI** - Create subscription management pages
7. **Test End-to-End** - Full user journey from signup to upgrade
8. **Monitor Production** - Watch for errors, slow queries, usage patterns

---

**End of Migration Testing & Verification Guide**

