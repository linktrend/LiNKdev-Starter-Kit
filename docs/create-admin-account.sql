-- Create Platform Admin Account
-- Email: admin@example.com
-- Password: CHOOSE_A_STRONG_PASSWORD

-- Step 1: Create admin user in auth.users
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

-- Step 2: Update to super_admin (trigger creates users record)
UPDATE users 
SET account_type = 'super_admin',
    onboarding_completed = true,
    profile_completed = true
WHERE email = 'admin@example.com';

-- Step 3: Verify admin account created
SELECT id, email, account_type, onboarding_completed, profile_completed 
FROM users 
WHERE email = 'admin@example.com';

