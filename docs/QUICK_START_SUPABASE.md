# Quick Start: Supabase Database Setup

## ✅ What's Been Completed

1. ✅ **Cleaned up old `.env` files** - Removed 3 backup/example files
2. ✅ **Created fresh `.env.local`** - Your Supabase credentials are configured at:
   - Location: `apps/web/.env.local`
   - Contains: Supabase URL, publishable key, secret key, database URL

3. ✅ **Audited all migrations** - Analyzed 21 migration files (3,330 lines of SQL)
4. ✅ **Created consolidated SQL** - All migrations combined in one file for easy execution

---

## 📋 Next Steps (What YOU Need to Do)

### Step 1: Run Database Migrations (5 minutes)

**Choose ONE of these options:**

#### Option A: Easiest - One-Click Migration ⭐ RECOMMENDED

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/sql
   - Click "New Query"

2. **Open the consolidated SQL file:**
   - In your code editor, open: `docs/CONSOLIDATED_MIGRATIONS.sql`
   - This file contains ALL 21 migrations in one

3. **Copy and Paste:**
   - Select all the SQL (Cmd+A / Ctrl+A)
   - Copy it (Cmd+C / Ctrl+C)
   - Paste into Supabase SQL Editor

4. **Run it:**
   - Click the green "Run" button
   - Wait 10-30 seconds
   - You should see "Success. No rows returned"

5. **Verify:**
   - Click "Table Editor" in the left sidebar
   - You should see 20+ tables

#### Option B: Manual - One File at a Time

Follow the detailed guide in: `docs/SUPABASE_MIGRATION_GUIDE.md`

---

### Step 2: Test Your Application (10 minutes)

1. **Start the development server:**
   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Open browser:**
   - Navigate to: http://localhost:3000

3. **Test sign-up:**
   - Create a test account
   - Verify you can log in

4. **Check database:**
   - Go back to Supabase dashboard
   - Click "Table Editor" → "users"
   - Your test user should appear

---

### Step 3: Update GitHub Secrets (5 minutes)

Go to your GitHub repository settings and add these secrets:

1. **SUPABASE_URL**
   ```
   https://YOUR_PROJECT_REF.supabase.co
   ```

2. **SUPABASE_ANON_KEY**
   ```
   sb_publishable_***REDACTED***
   ```

3. **SUPABASE_SERVICE_ROLE_KEY**
   ```
   sb_secret_***REDACTED***
   ```

**How to add GitHub secrets:**
- Go to your repo on GitHub
- Click "Settings" → "Secrets and variables" → "Actions"
- Click "New repository secret"
- Add each secret one by one

---

## 📚 Documentation Files Created

1. **`SUPABASE_MIGRATION_GUIDE.md`** - Detailed migration instructions with troubleshooting
2. **`CONSOLIDATED_MIGRATIONS.sql`** - All 21 migrations in one file (117KB)
3. **`QUICK_START_SUPABASE.md`** - This file!

---

## 🔍 What Each Migration Creates

**Core System:**
- User accounts and authentication
- Organizations and team management
- Stripe billing integration

**Features:**
- Blog/content management (posts)
- Document/records system with versioning
- Task/project management
- Scheduling and notifications
- File attachments and storage

**Admin Tools:**
- Audit logs (tracks all actions)
- Error tracking and monitoring
- Usage analytics
- Rate limiting
- Health checks

---

## ⚠️ Important Notes

1. **`.env.local` is secret** - Never commit it to Git (it's already in `.gitignore`)
2. **Free plan limitations** - Direct database connection isn't IPv4 compatible, but transaction pooler works fine
3. **RLS is enabled** - All tables have Row Level Security policies for data protection
4. **Test first** - Always test locally before deploying to production

---

## 🆘 Need Help?

**If migrations fail:**
- Check `docs/SUPABASE_MIGRATION_GUIDE.md` for troubleshooting
- Look at the error message in Supabase SQL Editor
- Verify your database is empty (fresh project)

**If app doesn't start:**
- Check `.env.local` file exists at `apps/web/.env.local`
- Verify all Supabase credentials are correct
- Check browser console (F12) for errors

**If authentication doesn't work:**
- Go to Supabase dashboard → Authentication → Settings
- Verify email auth is enabled
- Check redirect URLs are configured

---

## ✅ Success Criteria

You'll know everything is working when:

- [ ] Migrations run without errors
- [ ] 20+ tables visible in Supabase Table Editor
- [ ] App starts at http://localhost:3000
- [ ] You can sign up for an account
- [ ] You can log in
- [ ] Your user appears in Supabase `users` table
- [ ] You can create an organization
- [ ] No errors in browser console

---

## 🚀 Ready to Start?

**Go to Step 1 above and run your migrations!**

Then come back and test your application. You're minutes away from a working production-ready app!
