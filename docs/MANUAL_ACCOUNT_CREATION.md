# Manual Account Creation Instructions

Since the Supabase MCP `executeSQL` tool requires a custom RPC function that hasn't been set up yet, you'll need to create the admin and test user accounts manually through the Supabase Dashboard.

## Instructions

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_REF
2. Navigate to **SQL Editor**
3. Run the SQL scripts below

---

## 1. Create Platform Admin Account

**Email:** `admin@example.com`  
**Password:** `CHOOSE_A_STRONG_PASSWORD`

```sql
-- Create admin user in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('CHOOSE_A_STRONG_PASSWORD', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Platform Admin"}',
  ''
);

-- Update to super_admin (trigger creates users record)
UPDATE users 
SET account_type = 'super_admin',
    onboarding_completed = true,
    profile_completed = true
WHERE email = 'admin@example.com';

-- Verify admin account created
SELECT id, email, account_type, onboarding_completed, profile_completed 
FROM users 
WHERE email = 'admin@example.com';
```

---

## 2. Create Test User Account

**Email:** `testuser@example.com`  
**Password:** `TestPassword123!`

```sql
-- Create test user in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'testuser@example.com',
  crypt('TestPassword123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test User"}',
  ''
);

-- Verify user record created by trigger
SELECT id, email, account_type, onboarding_completed 
FROM users 
WHERE email = 'testuser@example.com';
```

---

## Verification

After running both scripts, verify the accounts were created:

```sql
-- Check both accounts
SELECT id, email, account_type, onboarding_completed, profile_completed, created_at
FROM users 
WHERE email IN ('admin@example.com', 'testuser@example.com')
ORDER BY email;
```

**Expected Results:**
- `admin@example.com` should have `account_type = 'super_admin'`, `onboarding_completed = true`, `profile_completed = true`
- `testuser@example.com` should have `account_type = 'user'`, `onboarding_completed = false`, `profile_completed = false`

---

## Next Steps

Once the accounts are created:

1. Test login as admin → should see "Admin Console" link
2. Test login as test user → should NOT see "Admin Console" link
3. Test signup flow with a new email
4. Test password reset flow

