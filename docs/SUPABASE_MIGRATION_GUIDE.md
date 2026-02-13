# Supabase Database Migration Guide

**Project:** linkdev-starter-kit  
**Project Ref:** YOUR_PROJECT_REF  
**Date:** December 18, 2024

---

## Overview

This guide will help you set up your Supabase database from scratch. You have **21 migration files** that need to be run in a specific order to create all necessary tables, functions, policies, and indexes.

**Total SQL Lines:** ~3,330 lines  
**Estimated Time:** 5-10 minutes

---

## What These Migrations Do (Plain English)

### Core Foundation (Migrations 1-3)
1. **`init.sql`** - Creates the basic user system, Stripe customer tracking, products, prices, and subscriptions
2. **`posts.sql`** - Adds blog/content management tables
3. **`orgs_teams_baseline.sql`** - Creates organizations and team member management

### Business Logic (Migrations 4-13)
4. **`orgs_invites_enhancement.sql`** - Adds organization invitation system
5. **`records_crud.sql`** - Creates records/documents system with versioning
6. **`billing_org_scope.sql`** - Updates billing to work at organization level
7. **`scheduling_notifications.sql`** - Adds scheduling and notification systems
8. **`audit_logs.sql`** - Creates audit trail for tracking all actions
9. **`idempotency_rate_limits.sql`** - Prevents duplicate actions and rate limiting
10. **`storage_attachments.sql`** - File upload and attachment management
11. **`billing_webhook_fields.sql`** - Adds fields for Stripe webhook integration
12. **`billing_invoices.sql`** - Creates invoice tracking table
13. **`development_tasks.sql`** - Project management / task tracking system

### Integration & Optimization (Migrations 14-21)
14. **`mcp_sanity.sql`** - MCP (Model Context Protocol) integration checks
15. **`users_billing_usage_expansion.sql`** - Enhanced user billing and usage tracking
16. **`performance_indexes.sql`** - Database performance optimizations
17. **`defer_org_creation.sql`** - Deferred organization creation logic
18. **`api_services_tables.sql`** - API service configuration tables
19. **`usage_tracking.sql`** - Detailed usage analytics
20. **`error_tracking.sql`** - Error logging and monitoring
21. **`database_console_functions.sql`** - Admin console helper functions

---

## Two Options for Running Migrations

### Option 1: Single Consolidated SQL (RECOMMENDED)

**Easiest and fastest - all migrations in one go.**

#### Steps:

1. **Download the SQL file:**
   - I've created a consolidated file at: `/tmp/consolidated_migrations.sql`
   - Or use the file attached to this guide

2. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_REF
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste the ENTIRE consolidated SQL**
   - Open `/tmp/consolidated_migrations.sql`
   - Select all (Cmd+A / Ctrl+A)
   - Copy (Cmd+C / Ctrl+C)
   - Paste into Supabase SQL Editor

4. **Run the migration:**
   - Click "Run" or press Cmd+Enter / Ctrl+Enter
   - Wait for completion (should take 10-30 seconds)
   - You should see "Success. No rows returned"

5. **Verify success:**
   - Click "Table Editor" in left sidebar
   - You should see 20+ tables including:
     - `users`
     - `organizations`
     - `organization_members`
     - `org_subscriptions`
     - `billing_invoices`
     - `audit_logs`
     - `records`
     - `development_tasks`
     - And many more...

---

### Option 2: Individual Migration Files (Manual)

**Run each migration file one by one. More control but takes longer.**

#### Steps:

For each migration file in order:

1. **Open the migration file** in your code editor
2. **Copy the SQL content**
3. **Paste into Supabase SQL Editor**
4. **Click "Run"**
5. **Wait for "Success"**
6. **Move to next file**

#### Order to Run:

```
1.  20230530034630_init.sql
2.  20240918141953_posts.sql
3.  202509161505__orgs_teams_baseline.sql
4.  20250101000000__orgs_invites_enhancement.sql
5.  20250101000001__records_crud.sql
6.  20250101000002__billing_org_scope.sql
7.  20250101000002__scheduling_notifications.sql
8.  20250101000004__audit_logs.sql
9.  20250101000005__idempotency_rate_limits.sql
10. 20250101000006__storage_attachments.sql
11. 20250117000000__billing_webhook_fields.sql
12. 20250117000001__billing_invoices.sql
13. 20250127000000__development_tasks.sql
14. 20250919100018__mcp_sanity.sql
15. 20251113000000__users_billing_usage_expansion.sql
16. 20251215000000__performance_indexes.sql
17. 20251215000001__defer_org_creation.sql
18. 20251215000002__api_services_tables.sql
19. 20251215000003__usage_tracking.sql
20. 20251215000004__error_tracking.sql
21. 20251216000001_database_console_functions.sql
```

---

## Verification Checklist

After running migrations, verify these tables exist:

### ✅ Core Tables
- [ ] `users` - User accounts
- [ ] `customers` - Stripe customer mapping
- [ ] `products` - Stripe products
- [ ] `prices` - Stripe pricing
- [ ] `subscriptions` - User subscriptions (legacy table)

### ✅ Organization Tables
- [ ] `organizations` - Company/team organizations
- [ ] `organization_members` - Team membership
- [ ] `organization_invites` - Pending invitations
- [ ] `org_subscriptions` - Organization-level subscriptions

### ✅ Feature Tables
- [ ] `posts` - Blog/content posts
- [ ] `records` - Document/record management
- [ ] `record_versions` - Version history
- [ ] `audit_logs` - Action audit trail
- [ ] `billing_invoices` - Invoice tracking
- [ ] `development_tasks` - Task management
- [ ] `scheduled_jobs` - Scheduled tasks
- [ ] `notifications` - User notifications
- [ ] `storage_attachments` - File uploads

### ✅ System Tables
- [ ] `idempotency_keys` - Duplicate prevention
- [ ] `rate_limits` - API rate limiting
- [ ] `api_services` - API service configs
- [ ] `usage_events` - Usage analytics
- [ ] `error_logs` - Error tracking
- [ ] `system_health_checks` - Health monitoring

---

## Common Issues & Solutions

### Issue 1: "relation already exists"

**Cause:** You're running migrations on a database that already has some tables.

**Solution:**
- If this is a fresh project, drop the existing tables first
- Or skip the migrations that create tables that already exist

### Issue 2: "column already exists"

**Cause:** Some columns were added in a previous run.

**Solution:**
- The migrations use `IF NOT EXISTS` so they should be safe to re-run
- If error persists, skip that specific ALTER TABLE statement

### Issue 3: "permission denied"

**Cause:** You're not using the service role key.

**Solution:**
- Make sure you're logged into the Supabase dashboard as the project owner
- SQL Editor in dashboard automatically uses service role

### Issue 4: Timeout

**Cause:** The SQL is too large to run in one go.

**Solution:**
- Use Option 2 (individual files)
- Or split the consolidated SQL into smaller chunks

---

## After Migration: Enable Row Level Security (RLS)

The migrations automatically enable RLS on all tables. Verify by:

1. Go to "Table Editor"
2. Click any table
3. Click "RLS" tab at top
4. You should see "Row Level Security is enabled"
5. Check policies are listed

---

## Next Steps After Successful Migration

1. ✅ **Test the application locally**
   ```bash
   cd apps/web
   pnpm dev
   ```

2. ✅ **Create a test account**
   - Go to http://localhost:3000
   - Sign up with test email
   - Verify user appears in `users` table

3. ✅ **Create test organization**
   - Create an organization in the app
   - Check `organizations` table
   - Check `organization_members` table

4. ✅ **Test billing flow** (if Stripe configured)
   - Navigate to billing page
   - Verify plans are displayed

5. ✅ **Update GitHub Secrets** (for CI/CD)
   - Add Supabase credentials to GitHub repo secrets

---

## Need Help?

If you encounter issues:

1. Check the Supabase logs (Dashboard → Logs)
2. Check browser console for errors (F12)
3. Verify `.env.local` has correct credentials
4. Test connection with a simple query:
   ```sql
   SELECT current_database(), current_user;
   ```

---

## Migration Status Tracking

Track which migrations you've run:

```
☐ 1.  init.sql
☐ 2.  posts.sql
☐ 3.  orgs_teams_baseline.sql
☐ 4.  orgs_invites_enhancement.sql
☐ 5.  records_crud.sql
☐ 6.  billing_org_scope.sql
☐ 7.  scheduling_notifications.sql
☐ 8.  audit_logs.sql
☐ 9.  idempotency_rate_limits.sql
☐ 10. storage_attachments.sql
☐ 11. billing_webhook_fields.sql
☐ 12. billing_invoices.sql
☐ 13. development_tasks.sql
☐ 14. mcp_sanity.sql
☐ 15. users_billing_usage_expansion.sql
☐ 16. performance_indexes.sql
☐ 17. defer_org_creation.sql
☐ 18. api_services_tables.sql
☐ 19. usage_tracking.sql
☐ 20. error_tracking.sql
☐ 21. database_console_functions.sql
```

---

**Ready to proceed? Follow Option 1 above and you'll be done in 5 minutes!**
