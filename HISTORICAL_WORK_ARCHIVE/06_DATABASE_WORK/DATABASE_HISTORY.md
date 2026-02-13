# Database Work - Historical Documentation

**Archive Date:** December 22, 2025  
**Original Work Period:** November 2025 - January 2026  
**Status:** Complete - Production Deployed

---

## Overview

Comprehensive database schema expansion and migration work to support the full feature set of the LiNKdev Starter Kit, including user profiles, organization-based billing, usage metering, and feature gating infrastructure.

---

## Database Inspection Summary

**Date:** November 13, 2025  
**Purpose:** Pre-migration analysis of existing database structure

### Initial State

**Existing `users` Table (5 fields):**
- id, full_name, avatar_url, billing_address (jsonb), payment_method (jsonb)

**UI Requirements (40+ fields):**
- username, displayName, personalTitle, firstName, middleName, lastName
- email, phoneCountryCode, phoneNumber
- Multiple address fields (personal + business)
- bio, education, workExperience
- Business information fields

**Gap Identified:** The `users` table was completely inadequate for UI requirements.

### Existing Tables Found
- **Auth & Users:** users, customers
- **Organizations:** organizations, organization_members, invites
- **Billing:** products, prices, subscriptions (user-level), billing_customers, org_subscriptions (org-level)
- **Content:** posts, record_types, records
- **System:** audit_logs, idempotency_keys, rate_limits, attachments

### Key Problems Identified
1. **Massive Schema Mismatch:** 40+ missing user profile fields
2. **Duplicate Billing Systems:** Both user-level and org-level billing tables
3. **Missing Critical Fields:** username, firstName, lastName, phone, bio, education, workExperience
4. **Auth Flow Mismatch:** Signup flow didn't capture profile data
5. **No Profile Update Mechanism:** No API routes or server actions for profile updates

---

## Schema Expansion Implementation

**Migration:** `20251113000000__users_billing_usage_expansion.sql`  
**Date:** November 13, 2025  
**Status:** ✅ Complete - Ready for Deployment

### 1. Users Table Expansion (36 New Fields)

**Core Identity:**
- username (unique), display_name, personal_title
- first_name, middle_name, last_name

**Contact Information:**
- email, phone_country_code, phone_number

**Personal Address (8 fields):**
- personal_apt_suite, personal_street_address_1, personal_street_address_2
- personal_city, personal_state, personal_postal_code, personal_country

**About Section:**
- bio (text)
- education (JSONB array)
- work_experience (JSONB array)

**Business Information (8 fields):**
- business_position, business_company
- business_apt_suite, business_street_address_1, business_street_address_2
- business_city, business_state, business_postal_code, business_country

**System Fields:**
- account_type (super_admin/admin/user)
- profile_completed, onboarding_completed
- created_at, updated_at

### 2. Organizations Table Enhancement

**New Fields:**
- `is_personal` - Marks auto-created personal workspaces
- `org_type` - 'personal', 'business', 'family', 'education', 'other'
- `slug` - URL-friendly identifier
- `description`, `avatar_url`, `settings` (JSONB)

### 3. Unified Organization-Based Billing

**Architecture Decision:** All billing goes through organizations (no user-level billing)

**Enhanced Tables:**
- `billing_customers` - Maps orgs to Stripe customer IDs
- `org_subscriptions` - Subscription details (plan, seats, status, Stripe IDs)

**Dropped Tables:**
- `customers` (user-level) - Removed
- `subscriptions` (user-level) - Removed

**Plan Tiers:**
- **Free:** 100 records, 1 seat, basic features
- **Pro:** 10K records, 5 seats, API access, advanced analytics
- **Business:** 100K records, 50 seats, SSO, custom branding, priority support
- **Enterprise:** Unlimited everything, dedicated support, custom contracts

### 4. Usage Metering Infrastructure

**Tables Created:**
- `usage_events` - Raw event log (record_created, api_call, automation_run, etc.)
- `usage_aggregations` - Daily/monthly rollups for efficient querying

**Event Types:**
- record_created, api_call, automation_run, storage_used
- schedule_executed, ai_tokens_used, user_active (MAU tracking)

### 5. Feature Gating System

**Table Created:**
- `plan_features` - Database-driven feature limits and flags

**Seed Data:** 36 feature definitions (9 per plan × 4 plans)

**Feature Keys:**
- max_records, max_api_calls_per_month, max_automations
- max_storage_gb, max_mau, max_schedules, max_ai_tokens_per_month
- max_seats, features (boolean flags)

### 6. Helper Functions Created

1. `check_username_available(text)` - Validates username uniqueness
2. `handle_new_user()` - Auto-creates personal org on signup
3. `check_feature_access(uuid, text, uuid)` - Returns plan limits for org
4. `aggregate_usage(text, timestamptz, timestamptz)` - Rolls up usage events
5. `complete_onboarding(uuid)` - Marks onboarding complete
6. `update_updated_at_column()` - Auto-updates updated_at timestamps

### 7. Triggers Attached

- `on_auth_user_created` - Creates user, personal org, and free subscription on signup
- `update_users_updated_at` - Auto-updates users.updated_at
- `update_organizations_updated_at` - Auto-updates organizations.updated_at
- `update_plan_features_updated_at` - Auto-updates plan_features.updated_at
- `update_usage_aggregations_updated_at` - Auto-updates usage_aggregations.updated_at

### 8. Indexes Created (20+)

**Performance Optimizations:**
- Username uniqueness (partial index where username IS NOT NULL)
- Email lookup
- Account type filtering
- Organization slug lookup
- Usage events by org/user/type/date
- Plan features by plan/key

### 9. RLS Policies

**Security Enhancements:**
- Users can view/update their own data
- Org members can view their orgs
- Personal orgs visible to owners
- Plan features publicly readable
- Usage events: users can insert/view own
- Usage aggregations: users/org members can view

---

## Migration Inventory

**Generated:** January 27, 2025  
**Target:** Supabase Cloud (YOUR_PROJECT_REF)

### Migration Files (11 total)

1. **20230530034630_init.sql** - Core auth & billing foundation
2. **20240918141953_posts.sql** - Blog functionality
3. **202509161505__orgs_teams_baseline.sql** - Organization foundation
4. **20250101000000__orgs_invites_enhancement.sql** - Invitation system
5. **20250101000001__records_crud.sql** - Generic records system
6. **20250101000002__billing_org_scope.sql** - Organization billing
7. **20250101000002__scheduling_notifications.sql** - Scheduling system
8. **20250101000004__audit_logs.sql** - Audit trail
9. **20250101000005__idempotency_rate_limits.sql** - API protection
10. **20250101000006__storage_attachments.sql** - File storage
11. **20250919100018__mcp_sanity.sql** - Test table

### Objects Migrated

**Tables (15 total):**
- Core Auth: users, customers
- Billing: products, prices, subscriptions, billing_customers, org_subscriptions, processed_events
- Organizations: organizations, organization_members, invites
- Records: record_types, records, attachments
- Scheduling: reminders, schedules, notifications_outbox
- System: audit_logs, idempotency_keys, rate_limits
- Content: posts

**Custom Types (3 total):**
- pricing_type, pricing_plan_interval, subscription_status

**Views (1 total):**
- team_members

**Functions (15+ total):**
- handle_new_user(), cleanup_expired_invites(), generate_invite_token()
- update_updated_at_column(), create_reminders_from_schedules(), emit_notification_event()
- prevent_audit_log_modification(), get_audit_stats()
- cleanup_expired_idempotency_keys(), cleanup_expired_rate_limits()
- get_or_create_rate_limit_bucket(), check_rate_limit_bucket()
- generate_signed_url()

**Triggers (8+ total):**
- on_auth_user_created, update_*_updated_at (6 triggers)
- prevent_audit_log_* (2 triggers)

**RLS Policies (50+ total):**
- Comprehensive row-level security across all tables
- Organization-scoped access control
- User-scoped access control
- Immutable audit logs

---

## Key Design Decisions

### 1. Organization-Based Billing (Not User-Based)

**Why:** Simplifies billing logic, supports teams naturally, allows seat-based pricing

**Impact:**
- Personal users subscribe their personal org
- Teams subscribe their team org
- No dual billing complexity
- Easier to add seats

### 2. Auto-Create Personal Org

**Why:** Every user always has at least one org, no special cases in code

**Impact:**
- Signup flow creates: user → personal org → free subscription → org membership
- User can immediately use the app
- Can create team orgs later without migration

### 3. Database-Driven Feature Gates

**Why:** Change limits without code deployments, A/B testing, flexible pricing

**Impact:**
- All limits in `plan_features` table
- Easy to adjust (just UPDATE the table)
- Consistent enforcement across app

### 4. Two-Tier Usage Tracking

**Why:** Balance between real-time logging and query performance

**Impact:**
- Raw events for accuracy and debugging
- Aggregations for fast dashboard queries
- Cron jobs roll up data daily/monthly

### 5. Unlimited = -1

**Why:** Explicit unlimited value, easy to check in code

**Impact:**
- Enterprise plan has `-1` for all limits
- Code checks: `if (limit === -1) { /* unlimited */ }`
- Clear distinction from 0 or null

---

## Dual Role System

### Platform Level (account_type in users table)
- `super_admin` - Full platform access, console access
- `admin` - Staff members, console access
- `user` - All customers (default), no console access

### Organization Level (role in organization_members table)
- `owner` - Full control of org (billing, delete, manage all members)
- `member` - Can use features, limited management
- `viewer` - Read-only access

### Console vs Dashboard
- **Console** (`/en/console/`) - Platform admin area (super_admin/admin only)
- **Dashboard** (`/en/dashboard/`) - Customer application (all users)
- Middleware checks account_type to restrict console access

---

## Migration Testing & Smoke Tests

### Database Smoke Test
**Date:** Various dates during implementation

**Tests Performed:**
- ✅ All tables created successfully
- ✅ All custom types created
- ✅ All views created
- ✅ All functions created
- ✅ All triggers created
- ✅ All RLS policies active
- ✅ User registration creates user record
- ✅ Organization creation works
- ✅ Personal org auto-created on signup
- ✅ Free subscription auto-created
- ✅ Username uniqueness enforced
- ✅ Feature access checks working
- ✅ Usage event logging working

### Post-Deployment Verification

**Verification Queries:**
```sql
-- Check migration applied
SELECT * FROM supabase_migrations.schema_migrations
WHERE version = '20251113000000';

-- Verify users table has 41+ columns
SELECT COUNT(*) FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public';

-- Verify plan features seeded (should be 36)
SELECT COUNT(*) FROM plan_features;

-- Verify all users have personal orgs
SELECT COUNT(*) FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM organizations o
  WHERE o.owner_id = u.id AND o.is_personal = true
);
-- Should return 0

-- Test feature access function
SELECT check_feature_access(
  (SELECT id FROM users LIMIT 1),
  'max_records',
  (SELECT id FROM organizations WHERE is_personal = true LIMIT 1)
);
-- Should return: {"limit": 100}
```

---

## Deployment

### How to Deploy

**Option 1: Supabase CLI (Recommended)**
```bash
cd apps/web
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

**Option 2: Supabase Dashboard**
1. Go to SQL Editor
2. Copy migration file contents
3. Paste and run
4. Wait for completion (~30-60 seconds)

**Option 3: Direct psql**
```bash
psql "postgresql://postgres:[PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
\i apps/web/supabase/migrations/20251113000000__users_billing_usage_expansion.sql
```

### Rollback Plan

If issues occur:
```bash
# Via CLI
supabase migration down --version 20251113000000

# Or manual SQL (see MIGRATION_TESTING_GUIDE.md for full rollback script)
```

---

## Storage Requirements

**Required Buckets:**
- `attachments` (private) - Record attachments
- `public-assets` (public) - Shared assets
- `user-uploads` (private) - User-specific files

**Setup:** Create via Supabase Dashboard or CLI, configure bucket policies for RLS compliance

---

## Success Metrics

### After Deployment, Monitor:
- **Signup Flow** - Users getting personal orgs automatically
- **Profile Completion** - Users filling out onboarding
- **Billing Upgrades** - Users upgrading from free to paid
- **Usage Tracking** - Events being logged correctly
- **Feature Gates** - Limits being enforced
- **Performance** - Query times acceptable
- **Errors** - No RLS policy violations or constraint errors

---

## Related Documentation

### Original Documentation Files
- `DATABASE_INSPECTION_SUMMARY.md` - Pre-migration analysis
- `DB_MIGRATION_INVENTORY.md` - Migration file inventory
- `DB_MIGRATION_RUN.md` - Migration execution log
- `DB_SMOKE_TEST.md` - Testing procedures
- `SCHEMA_EXPANSION_SUMMARY.md` - Implementation summary
- `DB_SEEDS.md` - Seed data documentation
- `DB_OPERATIONS.md` - Database operations guide

### Additional Resources
- `BILLING_ARCHITECTURE.md` - Billing system documentation
- `USAGE_METERING_GUIDE.md` - Usage tracking implementation
- `FEATURE_GATING_GUIDE.md` - Feature access control
- `MIGRATION_TESTING_GUIDE.md` - Testing and verification procedures

---

## Conclusion

The database schema expansion is **complete and production-deployed**. The foundation is now in place for a production-ready SaaS application with:
- ✅ Complete user profiles (41 fields)
- ✅ Organization-based billing
- ✅ Usage metering
- ✅ Feature gating
- ✅ Multi-org support
- ✅ Platform admin system

**Status:** ✅ COMPLETE  
**Quality:** Production-Deployed  
**Next:** Application code integration and usage monitoring

---

**Archive Note:** This document consolidates all database-related work from the schema expansion period. The database continues to be actively maintained and evolved as part of the production application.
