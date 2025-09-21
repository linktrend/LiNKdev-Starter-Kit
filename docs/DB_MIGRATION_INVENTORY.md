# Database Migration Inventory

**Generated:** 2025-01-27T20:30:00Z  
**MCP Target:** https://YOUR_PROJECT_REF.supabase.co (YOUR_PROJECT_REF)

## Executive Summary

This inventory covers the migration of a comprehensive LTM Starter Kit application database from local development to Supabase Cloud. The local database contains **11 migration files** with extensive organizational, billing, records management, scheduling, audit, and storage functionality.

### Key Statistics
- **Local Migrations:** 11 files
- **Tables to Create:** 15+ tables
- **RLS Policies:** 50+ policies
- **Functions:** 15+ functions
- **Triggers:** 8+ triggers
- **Extensions Required:** pgcrypto (already present in cloud)
- **Storage Buckets:** 3 buckets needed

## Cloud Current State

### Existing Tables
- `mcp_sanity` (test table, can be removed)

### Existing Extensions
- ✅ pg_graphql (1.5.11)
- ✅ pg_stat_statements (1.11) 
- ✅ pgcrypto (1.3) - **Required for local migrations**
- ✅ plpgsql (1.0)
- ✅ supabase_vault (0.3.1)
- ✅ uuid-ossp (1.1)

### RLS Status
- No RLS policies currently active
- No RLS-enabled tables (except mcp_sanity which has RLS disabled)

### Storage
- No storage buckets currently configured

## Local Inventory

### Migration Files (Execution Order)

1. **20230530034630_init.sql** - Core auth & billing foundation
   - Tables: users, customers, products, prices, subscriptions
   - Types: pricing_type, pricing_plan_interval, subscription_status
   - Policies: 7 RLS policies
   - Functions: handle_new_user()
   - Triggers: on_auth_user_created
   - Dependencies: pgcrypto

2. **20240918141953_posts.sql** - Blog functionality
   - Tables: posts
   - Policies: 4 RLS policies
   - Dependencies: None

3. **202509161505__orgs_teams_baseline.sql** - Organization foundation
   - Tables: organizations, organization_members
   - Views: team_members
   - Policies: 5 RLS policies
   - Dependencies: None

4. **20250101000000__orgs_invites_enhancement.sql** - Invitation system
   - Tables: invites
   - Policies: 11 RLS policies (enhanced org management)
   - Functions: cleanup_expired_invites(), generate_invite_token()
   - Dependencies: organizations, organization_members, pgcrypto

5. **20250101000001__records_crud.sql** - Generic records system
   - Tables: record_types, records
   - Policies: 8 RLS policies
   - Functions: update_updated_at_column()
   - Triggers: 2 updated_at triggers
   - Dependencies: organizations, auth.users

6. **20250101000002__billing_org_scope.sql** - Organization billing
   - Tables: billing_customers, org_subscriptions, processed_events
   - Policies: 6 RLS policies
   - Functions: update_updated_at_column()
   - Triggers: 2 updated_at triggers
   - Dependencies: organizations

7. **20250101000002__scheduling_notifications.sql** - Scheduling system
   - Tables: reminders, schedules, notifications_outbox
   - Policies: 12 RLS policies
   - Functions: update_updated_at_column(), create_reminders_from_schedules(), emit_notification_event()
   - Triggers: 2 updated_at triggers
   - Dependencies: organizations, records

8. **20250101000004__audit_logs.sql** - Audit trail
   - Tables: audit_logs
   - Policies: 4 RLS policies (immutable)
   - Functions: prevent_audit_log_modification(), get_audit_stats()
   - Triggers: 2 immutability triggers
   - Dependencies: organizations

9. **20250101000005__idempotency_rate_limits.sql** - API protection
   - Tables: idempotency_keys, rate_limits
   - Policies: 3 RLS policies
   - Functions: 4 rate limiting functions
   - Dependencies: organizations

10. **20250101000006__storage_attachments.sql** - File storage
    - Tables: attachments
    - Policies: 4 RLS policies
    - Functions: generate_signed_url() (placeholder)
    - Triggers: 1 updated_at trigger
    - Dependencies: records, organizations

11. **20250919100018__mcp_sanity.sql** - Test table
    - Tables: mcp_sanity
    - Dependencies: pgcrypto

### Seed Data
- `apps/web/supabase/seed.sql` (empty file)

### Storage Requirements
Required buckets (to be created via Supabase Dashboard/CLI):
- `attachments` (private) - Record attachments
- `public-assets` (public) - Shared assets  
- `user-uploads` (private) - User-specific files

## Migration Analysis

### Objects to Migrate

#### Tables (15 total)
- **Core Auth:** users, customers
- **Billing:** products, prices, subscriptions, billing_customers, org_subscriptions, processed_events
- **Organizations:** organizations, organization_members, invites
- **Records:** record_types, records, attachments
- **Scheduling:** reminders, schedules, notifications_outbox
- **System:** audit_logs, idempotency_keys, rate_limits
- **Content:** posts
- **Test:** mcp_sanity (can be removed)

#### Custom Types (3 total)
- pricing_type, pricing_plan_interval, subscription_status

#### Views (1 total)
- team_members

#### Functions (15+ total)
- handle_new_user(), cleanup_expired_invites(), generate_invite_token()
- update_updated_at_column(), create_reminders_from_schedules(), emit_notification_event()
- prevent_audit_log_modification(), get_audit_stats()
- cleanup_expired_idempotency_keys(), cleanup_expired_rate_limits()
- get_or_create_rate_limit_bucket(), check_rate_limit_bucket()
- generate_signed_url()

#### Triggers (8+ total)
- on_auth_user_created, update_*_updated_at (6 triggers)
- prevent_audit_log_* (2 triggers)

#### RLS Policies (50+ total)
- Comprehensive row-level security across all tables
- Organization-scoped access control
- User-scoped access control
- Immutable audit logs

### Dependencies & Execution Order

1. **Extensions:** pgcrypto (already present)
2. **Core Tables:** organizations, organization_members (baseline)
3. **Auth Tables:** users, customers (init)
4. **Billing Tables:** products, prices, subscriptions (init)
5. **Enhanced Org:** invites (orgs_invites_enhancement)
6. **Records System:** record_types, records (records_crud)
7. **Org Billing:** billing_customers, org_subscriptions, processed_events (billing_org_scope)
8. **Scheduling:** reminders, schedules, notifications_outbox (scheduling_notifications)
9. **Audit:** audit_logs (audit_logs)
10. **API Protection:** idempotency_keys, rate_limits (idempotency_rate_limits)
11. **Storage:** attachments (storage_attachments)
12. **Content:** posts (posts)
13. **Test:** mcp_sanity (mcp_sanity - can be removed)

### Potential Conflicts

#### Table Conflicts
- **mcp_sanity:** Exists in cloud but not in local schema.sql (test table, safe to replace)

#### Policy Conflicts
- No existing policies in cloud, so no conflicts expected

#### Function Conflicts
- No existing functions in cloud, so no conflicts expected

### Required Extensions
- ✅ **pgcrypto** - Already present in cloud (required for gen_random_uuid(), gen_random_bytes())

### Storage Setup Required
- Create 3 storage buckets via Supabase Dashboard or CLI
- Configure bucket policies for RLS compliance
- Test signed URL generation

## Post-Migration Validation Checklist

### Database Structure
- [ ] All 15 tables created successfully
- [ ] All 3 custom types created
- [ ] All 1 view created
- [ ] All 15+ functions created
- [ ] All 8+ triggers created
- [ ] All 50+ RLS policies active

### RLS Validation
- [ ] Test user can only see their own data
- [ ] Test org members can see org data
- [ ] Test audit logs are immutable
- [ ] Test rate limiting functions work
- [ ] Test idempotency key functions work

### Storage Validation
- [ ] All 3 buckets created
- [ ] Bucket policies configured
- [ ] Signed URL generation works
- [ ] File upload/download works

### Functionality Tests
- [ ] User registration creates user record
- [ ] Organization creation works
- [ ] Record CRUD operations work
- [ ] Billing webhook processing works
- [ ] Audit logging works
- [ ] Rate limiting works
- [ ] File attachments work

### Performance
- [ ] All indexes created
- [ ] Query performance acceptable
- [ ] No missing foreign key constraints

## Rollback Considerations

### Safe Rollbacks (in order)
1. Remove test table: `DROP TABLE mcp_sanity;`
2. Remove storage attachments: `DROP TABLE attachments CASCADE;`
3. Remove API protection: `DROP TABLE idempotency_keys, rate_limits CASCADE;`
4. Remove audit logs: `DROP TABLE audit_logs CASCADE;`
5. Remove scheduling: `DROP TABLE reminders, schedules, notifications_outbox CASCADE;`
6. Remove org billing: `DROP TABLE billing_customers, org_subscriptions, processed_events CASCADE;`
7. Remove records: `DROP TABLE record_types, records CASCADE;`
8. Remove invites: `DROP TABLE invites CASCADE;`
9. Remove organizations: `DROP TABLE organizations, organization_members CASCADE;`
10. Remove posts: `DROP TABLE posts CASCADE;`
11. Remove core auth/billing: `DROP TABLE users, customers, products, prices, subscriptions CASCADE;`

### Critical Dependencies
- **Cannot remove organizations** until all dependent tables are removed
- **Cannot remove auth.users** until all user-referencing tables are removed
- **Storage buckets** must be manually cleaned up via Supabase Dashboard

### Data Loss Warnings
- **Audit logs** are designed to be immutable - rollback will lose all audit history
- **Rate limiting data** will be lost (acceptable for rollback)
- **File attachments** metadata will be lost (files remain in storage)

## Next Steps

1. **Review this inventory** for accuracy and completeness
2. **Create storage buckets** via Supabase Dashboard
3. **Execute migrations** in the specified order
4. **Validate functionality** using the checklist
5. **Test rollback procedures** in a development environment
6. **Monitor performance** and adjust indexes as needed

---

*This inventory was generated automatically from local migration files and cloud introspection. Please verify all details before proceeding with migration.*
