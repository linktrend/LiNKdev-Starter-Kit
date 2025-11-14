# Database Inspection Summary

**Date:** 2025-11-13  
**Purpose:** Comprehensive analysis of existing database structure before designing users/auth architecture

---

## 1. Existing Database Schemas

Via Supabase MCP, the following schemas are available:

- **`public`** - Default public schema (main application tables)
- **`auth`** - Supabase auth schema (managed by Supabase)
- **`storage`** - Supabase storage schema (managed by Supabase)
- **`extensions`** - PostgreSQL extensions

---

## 2. Existing Tables (from migrations)

### 2.1 User & Authentication Related Tables

#### **`users`** (public schema)
**Source:** `20230530034630_init.sql`

```sql
create table users (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  billing_address jsonb,
  payment_method jsonb
);
```

**Current Fields:**
- `id` - UUID from `auth.users` (primary key)
- `full_name` - Text
- `avatar_url` - Text
- `billing_address` - JSONB
- `payment_method` - JSONB

**RLS Policies:**
- Users can view their own data
- Users can update their own data

**Trigger:**
- `on_auth_user_created` - Automatically creates a user entry when someone signs up via Supabase Auth
- Pulls `full_name` and `avatar_url` from `auth.users.raw_user_meta_data`

**Current Data:**
- 1 user exists: `id: 00000000-0000-0000-0000-000000000000`
- All profile fields are NULL

---

#### **`customers`** (public schema)
**Source:** `20230530034630_init.sql`

```sql
create table customers (
  id uuid references auth.users not null primary key,
  stripe_customer_id text
);
```

**Purpose:** Private table mapping user IDs to Stripe customer IDs

**RLS Policies:**
- NO policies (private table, service role only)

**Current Data:**
- 0 rows

---

#### **`subscriptions`** (public schema)
**Source:** `20230530034630_init.sql`

```sql
create table subscriptions (
  id text primary key,
  user_id uuid references auth.users not null,
  status subscription_status,
  metadata jsonb,
  price_id text references prices,
  quantity integer,
  cancel_at_period_end boolean,
  created timestamp with time zone,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  ended_at timestamp with time zone,
  cancel_at timestamp with time zone,
  canceled_at timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone
);
```

**Purpose:** User-level subscriptions (Stripe synced)

**Current Data:**
- 0 rows

---

### 2.2 Organization & Team Related Tables

#### **`organizations`** (public schema)
**Source:** `202509161505__orgs_teams_baseline.sql`

```sql
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id),
  created_at timestamptz default now()
);
```

**RLS Policies:**
- Owner can select, update, insert
- Members can select (via `orgs_member_select` policy)

**Current Data:**
- 1 organization: `Demo Org` (owner: `00000000-0000-0000-0000-000000000000`)

---

#### **`organization_members`** (public schema)
**Source:** `202509161505__orgs_teams_baseline.sql`

```sql
create table organization_members (
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  role text not null check (role in ('owner','admin','editor','viewer')),
  created_at timestamptz default now(),
  primary key (org_id, user_id)
);
```

**RLS Policies:**
- Members can select if they belong to the org
- Members can delete themselves
- Owners/admins can update roles, add/remove members

**Current Data:**
- 0 rows

---

#### **`invites`** (public schema)
**Source:** `20250101000000__orgs_invites_enhancement.sql`

```sql
create table invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  email citext not null,
  role text not null check (role in ('admin','editor','viewer')),
  token text not null unique,
  status text not null default 'pending' check (status in ('pending','accepted','expired')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days'),
  unique(org_id, email)
);
```

**Current Data:**
- 0 rows

---

### 2.3 Billing & Subscription Tables (Org-scoped)

#### **`billing_customers`** (public schema)
**Source:** `20250101000002__billing_org_scope.sql`

```sql
create table billing_customers (
  org_id uuid primary key references organizations(id) on delete cascade,
  stripe_customer_id text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Purpose:** Organization-level Stripe customer mapping

**Current Data:**
- Not queried (likely 0 rows)

---

#### **`org_subscriptions`** (public schema)
**Source:** `20250101000002__billing_org_scope.sql`

```sql
create table org_subscriptions (
  org_id uuid primary key references organizations(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'active',
  current_period_start timestamptz default now(),
  current_period_end timestamptz default now(),
  trial_end timestamptz,
  stripe_sub_id text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Purpose:** Organization-level subscriptions

**Current Data:**
- Not queried (likely 0 rows)

---

### 2.4 Content & Records Tables

#### **`posts`** (public schema)
**Source:** `20240918141953_posts.sql`

```sql
create table posts (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  title text not null,
  content text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
```

**Purpose:** User posts (limited to 5 per user)

**Current Data:**
- 0 rows

---

#### **`record_types`** & **`records`** (public schema)
**Source:** `20250101000001__records_crud.sql`

```sql
create table record_types (
  id uuid primary key,
  key text not null unique,
  display_name text not null,
  description text,
  config jsonb not null default '{}',
  created_by uuid not null references auth.users(id),
  created_at timestamptz,
  updated_at timestamptz
);

create table records (
  id uuid primary key,
  type_id uuid not null references record_types(id) on delete cascade,
  org_id uuid references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  data jsonb not null default '{}',
  created_at timestamptz,
  updated_at timestamptz,
  constraint records_owner_check check (
    (org_id is not null and user_id is null) or 
    (org_id is null and user_id is not null)
  )
);
```

**Purpose:** Generic entity system with custom fields

**Current Data:**
- Not queried

---

### 2.5 Stripe Product/Price Tables

#### **`products`** & **`prices`** (public schema)
**Source:** `20230530034630_init.sql`

```sql
create table products (
  id text primary key,
  active boolean,
  name text,
  description text,
  image text,
  metadata jsonb
);

create table prices (
  id text primary key,
  product_id text references products,
  active boolean,
  description text,
  unit_amount bigint,
  currency text,
  type pricing_type,
  interval pricing_plan_interval,
  interval_count integer,
  trial_period_days integer,
  metadata jsonb
);
```

**Purpose:** Stripe product catalog (synced via webhooks)

**Current Data:**
- Not queried

---

## 3. UI/UX Defined User Profile Fields

Based on the codebase analysis, the UI expects the following user profile fields:

### **Personal Information**
- `username` - Unique username (with availability checking)
- `displayName` - Display name
- `personalTitle` - Title (Mr., Mrs., Ms., Dr., etc.)
- `firstName` - First name
- `middleName` - Middle name (optional)
- `lastName` - Last name
- `email` - Email address
- `phoneCountryCode` - Phone country code (e.g., +1)
- `phoneNumber` - Phone number
- `personalAptSuite` - Apartment/Suite
- `personalStreetAddress1` - Street address line 1
- `personalStreetAddress2` - Street address line 2 (optional)
- `personalCity` - City
- `personalState` - State/Province
- `personalPostalCode` - Postal/ZIP code
- `personalCountry` - Country

### **About Section**
- `bio` - Biography/About text (textarea)
- `education` - Array of education entries (JSONB)
  - `institution` - School/University name
  - `degree` - Degree/Field of study
  - `startDate` - Start year
  - `endDate` - End year
- `workExperience` - Array of work experience entries (JSONB)
  - `company` - Company name
  - `position` - Job title/position
  - `startDate` - Start year
  - `endDate` - End year
  - `description` - Job description (optional)

### **Business Information**
- `businessPosition` - Current job title
- `businessCompany` - Current company
- `businessAptSuite` - Business apartment/suite
- `businessStreetAddress1` - Business street address line 1
- `businessStreetAddress2` - Business street address line 2 (optional)
- `businessCity` - Business city
- `businessState` - Business state/province
- `businessPostalCode` - Business postal/ZIP code
- `businessCountry` - Business country

### **Account Information** (Read-only, system-managed)
- `accountCreated` - Account creation timestamp
- `adminLevel` - Admin level (Super Admin, Admin, User, etc.)
- `profileStatus` - Profile status (Active, Inactive, etc.)
- `twoFactorEnabled` - 2FA status (boolean)

---

## 4. Current Problems & Gaps

### 4.1 **Massive Schema Mismatch**

**Current `users` table:**
```sql
- id
- full_name
- avatar_url
- billing_address (jsonb)
- payment_method (jsonb)
```

**UI expects ~40+ fields:**
- username, displayName, personalTitle, firstName, middleName, lastName
- email, phoneCountryCode, phoneNumber
- Multiple address fields (personal + business)
- bio, education, workExperience
- Business information fields

**Gap:** The `users` table is completely inadequate for the UI requirements.

---

### 4.2 **Duplicate/Conflicting Billing Tables**

**User-level billing:**
- `customers` (user → Stripe customer)
- `subscriptions` (user-level subscriptions)

**Organization-level billing:**
- `billing_customers` (org → Stripe customer)
- `org_subscriptions` (org-level subscriptions)

**Problem:** Two parallel billing systems exist. It's unclear which should be primary.

---

### 4.3 **Missing Critical User Fields**

The following fields are completely missing from the database:

- `username` (unique identifier, used throughout UI)
- `firstName`, `middleName`, `lastName` (only `full_name` exists)
- `email` (stored in `auth.users`, not in `public.users`)
- `phoneNumber`, `phoneCountryCode` (not stored anywhere)
- `bio` (biography/about text)
- `education` (education history)
- `workExperience` (work experience history)
- `personalTitle` (Mr., Mrs., etc.)
- All address fields (personal + business)
- All business information fields

---

### 4.4 **Auth Flow Mismatch**

**Current signup flow:**
- `signUp()` in `auth-helpers/server.ts` only captures `email` and `password`
- No metadata is passed to `auth.users.raw_user_meta_data`
- The `handle_new_user()` trigger tries to pull `full_name` and `avatar_url` from metadata, but these are never set

**Onboarding flow expects:**
- Step 1: Create account (email/phone/social)
- Step 2: Complete profile (full profile form with all fields)
- Step 3: Preferences
- Step 4: Welcome

**Problem:** The signup flow doesn't capture any profile data, and the onboarding flow has no backend integration.

---

### 4.5 **No Profile Update Mechanism**

- The UI has a comprehensive profile edit modal
- The database has no fields to store the edited data
- No API routes or server actions exist for profile updates

---

## 5. Recommendations

### 5.1 **Expand `users` Table**

Add all required profile fields to the `users` table:

```sql
-- Core identity fields
username text unique not null,
display_name text,
personal_title text,
first_name text,
middle_name text,
last_name text,
full_name text, -- Keep for backward compatibility

-- Contact information
email text, -- Duplicate from auth.users for easier access
phone_country_code text,
phone_number text,

-- Personal address
personal_apt_suite text,
personal_street_address_1 text,
personal_street_address_2 text,
personal_city text,
personal_state text,
personal_postal_code text,
personal_country text,

-- About section
bio text,
education jsonb, -- Array of education entries
work_experience jsonb, -- Array of work experience entries

-- Business information
business_position text,
business_company text,
business_apt_suite text,
business_street_address_1 text,
business_street_address_2 text,
business_city text,
business_state text,
business_postal_code text,
business_country text,

-- System fields
avatar_url text, -- Keep existing
billing_address jsonb, -- Keep existing
payment_method jsonb, -- Keep existing
created_at timestamptz default now(),
updated_at timestamptz default now(),
profile_completed boolean default false,
onboarding_completed boolean default false
```

---

### 5.2 **Clarify Billing Architecture**

**Option A: User-level billing only**
- Keep `customers` and `subscriptions`
- Remove `billing_customers` and `org_subscriptions`
- Organizations don't have billing, only users do

**Option B: Organization-level billing only**
- Remove `customers` and `subscriptions`
- Keep `billing_customers` and `org_subscriptions`
- All billing is tied to organizations

**Option C: Dual billing (recommended for SaaS)**
- Keep both systems
- Use `org_subscriptions` for team/enterprise plans
- Use `subscriptions` for individual/personal plans
- Add a `billing_type` field to clarify which system is active

**Recommendation:** Choose **Option B** or **Option C** based on business model.

---

### 5.3 **Update `handle_new_user()` Trigger**

Modify the trigger to:
1. Create a user entry with minimal data
2. Set `profile_completed = false`
3. Set `onboarding_completed = false`
4. Redirect to onboarding flow

```sql
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (
    id, 
    email,
    full_name, 
    avatar_url,
    profile_completed,
    onboarding_completed
  )
  values (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    false,
    false
  );
  return new;
end;
$$ language plpgsql security definer;
```

---

### 5.4 **Add Username Uniqueness Constraint**

Create a unique index on `username`:

```sql
create unique index idx_users_username on users(username);
```

Add a function for username availability checking:

```sql
create or replace function check_username_available(username_to_check text)
returns boolean as $$
begin
  return not exists (
    select 1 from users where username = username_to_check
  );
end;
$$ language plpgsql security definer;
```

---

### 5.5 **Create Profile Update RLS Policies**

Update RLS policies to allow profile updates:

```sql
-- Allow users to update their own profile
create policy "Users can update own profile" on users
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow users to insert their own profile (for onboarding)
create policy "Users can insert own profile" on users
  for insert with check (auth.uid() = id);
```

---

### 5.6 **Add Onboarding Completion Tracking**

Create a function to mark onboarding as complete:

```sql
create or replace function complete_onboarding(user_id uuid)
returns void as $$
begin
  update users 
  set 
    onboarding_completed = true,
    profile_completed = true,
    updated_at = now()
  where id = user_id and id = auth.uid();
end;
$$ language plpgsql security definer;
```

---

## 6. Proposed Schema Design

### 6.1 **`auth.users` (Supabase managed)**

**Purpose:** Core authentication and identity

**Fields (managed by Supabase):**
- `id` - UUID (primary key)
- `email` - Email address
- `phone` - Phone number
- `email_confirmed_at` - Email confirmation timestamp
- `phone_confirmed_at` - Phone confirmation timestamp
- `encrypted_password` - Hashed password
- `raw_user_meta_data` - JSONB (for OAuth profile data)
- `created_at`, `updated_at`, etc.

**Usage:**
- Use for authentication only
- Do NOT store application-level user data here
- Use `raw_user_meta_data` only for OAuth profile data (name, avatar from Google/Apple/etc.)

---

### 6.2 **`public.users` (Application profile)**

**Purpose:** Application-level user profile and data

**Recommended Fields:**

```sql
create table users (
  -- Identity (references auth.users)
  id uuid references auth.users not null primary key,
  
  -- Core identity fields
  username text unique not null,
  display_name text,
  personal_title text, -- Mr., Mrs., Ms., Dr., etc.
  first_name text,
  middle_name text,
  last_name text,
  full_name text, -- Computed or stored
  
  -- Contact information (duplicated from auth for convenience)
  email text, -- From auth.users.email
  phone_country_code text, -- e.g., +1
  phone_number text, -- e.g., 5551234567
  
  -- Avatar
  avatar_url text,
  
  -- Personal address
  personal_apt_suite text,
  personal_street_address_1 text,
  personal_street_address_2 text,
  personal_city text,
  personal_state text,
  personal_postal_code text,
  personal_country text default 'United States',
  
  -- About section
  bio text,
  education jsonb default '[]'::jsonb, -- Array of education entries
  work_experience jsonb default '[]'::jsonb, -- Array of work experience entries
  
  -- Business information
  business_position text,
  business_company text,
  business_apt_suite text,
  business_street_address_1 text,
  business_street_address_2 text,
  business_city text,
  business_state text,
  business_postal_code text,
  business_country text default 'United States',
  
  -- Billing (keep for backward compatibility)
  billing_address jsonb,
  payment_method jsonb,
  
  -- System/metadata fields
  profile_completed boolean default false,
  onboarding_completed boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create unique index idx_users_username on users(username);
create index idx_users_email on users(email);
create index idx_users_created_at on users(created_at);

-- RLS Policies
alter table users enable row level security;

create policy "Users can view own profile" on users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile" on users
  for insert with check (auth.uid() = id);

-- Trigger for updated_at
create trigger update_users_updated_at 
  before update on users 
  for each row execute function update_updated_at_column();
```

---

### 6.3 **JSONB Schema for `education`**

```json
[
  {
    "id": "uuid",
    "institution": "Stanford University",
    "degree": "Bachelor of Science in Computer Science",
    "startDate": "2015",
    "endDate": "2019"
  }
]
```

---

### 6.4 **JSONB Schema for `work_experience`**

```json
[
  {
    "id": "uuid",
    "company": "Tech Innovations Inc.",
    "position": "Senior Product Designer",
    "startDate": "2019",
    "endDate": "2021",
    "description": "Led design initiatives for multiple products..."
  }
]
```

---

## 7. Migration Strategy

### 7.1 **Create New Migration File**

**File:** `apps/web/supabase/migrations/20251113000000__users_profile_expansion.sql`

**Contents:**
1. Add all new columns to `users` table
2. Create indexes
3. Update RLS policies
4. Update `handle_new_user()` trigger
5. Create helper functions (username check, onboarding completion)

---

### 7.2 **Backward Compatibility**

- Keep existing fields (`full_name`, `avatar_url`, `billing_address`, `payment_method`)
- Add new fields as nullable initially
- Gradually migrate existing data if any
- Update frontend to use new fields

---

### 7.3 **Data Migration for Existing Users**

```sql
-- If there are existing users, populate new fields from old fields
update users 
set 
  display_name = full_name,
  email = (select email from auth.users where auth.users.id = users.id),
  profile_completed = false,
  onboarding_completed = false
where display_name is null;
```

---

## 8. Next Steps

1. **Review and approve** this schema design
2. **Decide on billing architecture** (Option A, B, or C)
3. **Create migration file** with new schema
4. **Update `handle_new_user()` trigger**
5. **Create API routes** for profile CRUD operations
6. **Update onboarding flow** to save profile data
7. **Update profile edit modal** to save to database
8. **Add username availability checking** endpoint
9. **Test end-to-end** signup → onboarding → profile edit flow

---

## 9. Summary

### **What Exists:**
- Basic `users` table with 5 fields (id, full_name, avatar_url, billing_address, payment_method)
- Organization tables (organizations, organization_members, invites)
- Billing tables (both user-level and org-level)
- Content tables (posts, records, record_types)
- Stripe sync tables (products, prices, subscriptions)

### **What's Missing:**
- ~35+ user profile fields expected by the UI
- Username field and uniqueness constraint
- Contact information fields (email, phone in public.users)
- Address fields (personal + business)
- Bio, education, work experience fields
- Profile completion tracking
- Onboarding completion tracking

### **What Should Be Modified:**
- Expand `users` table with all required fields
- Update `handle_new_user()` trigger to set initial state
- Add RLS policies for profile updates
- Create helper functions for username checking and onboarding
- Clarify billing architecture (user vs org vs dual)

### **What Should Be Removed:**
- Consider consolidating billing tables (decide on architecture first)
- Remove duplicate/unused tables if any

---

**End of Database Inspection Summary**

