# Billing Architecture Documentation

> Current default plan model is `Free/Pro/Business`.  
> If this file mentions `Enterprise`, treat that content as historical and use `docs/00_OPERATOR_LIBRARY/README.md` for current operations.

**Date:** 2025-11-13  
**Version:** 1.0  
**Status:** Production-Ready

---

## Overview

The LiNKdev Starter Kit uses a **unified organization-based billing system**. All subscriptions are managed at the organization level, whether for individual users (personal orgs) or teams (business/family/education orgs).

### Key Principles

1. **Every user has a personal organization** - Auto-created on signup
2. **All billing goes through organizations** - No user-level billing
3. **Subscriptions are org-scoped** - Plans, seats, and limits apply to the org
4. **Users can belong to multiple orgs** - Personal + team orgs
5. **Stripe is the payment processor** - Webhooks sync subscription data

---

## Architecture Components

### 1. Organizations Table

```sql
organizations (
  id uuid PRIMARY KEY,
  name text,
  owner_id uuid REFERENCES auth.users,
  is_personal boolean DEFAULT false,
  org_type text CHECK (org_type IN ('personal', 'business', 'family', 'education', 'other')),
  slug text UNIQUE,
  description text,
  avatar_url text,
  settings jsonb,
  created_at timestamptz
)
```

**Organization Types:**
- **`personal`** - Auto-created for every user (e.g., "John's Workspace")
- **`business`** - Company/hotel/organization (e.g., "Grand Hotel")
- **`family`** - Household accounts (e.g., "Smith Family")
- **`education`** - Schools/universities
- **`other`** - Custom use cases

---

### 2. Billing Customers Table

```sql
billing_customers (
  org_id uuid PRIMARY KEY REFERENCES organizations(id),
  stripe_customer_id text UNIQUE,
  billing_email text,
  created_at timestamptz,
  updated_at timestamptz
)
```

**Purpose:** Maps organizations to Stripe customer IDs

**Access:** Service role only (no RLS for users)

---

### 3. Organization Subscriptions Table

```sql
org_subscriptions (
  org_id uuid PRIMARY KEY REFERENCES organizations(id),
  plan_name text CHECK (plan_name IN ('free', 'pro', 'business', 'enterprise')),
  status text CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'unpaid', ...)),
  billing_interval text CHECK (billing_interval IN ('monthly', 'annual')),
  seats integer DEFAULT 1,
  stripe_sub_id text UNIQUE,
  stripe_price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_end timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
```

**Key Fields:**
- `plan_name` - Which plan tier (free/pro/business/enterprise)
- `seats` - Number of paid seats in the organization
- `status` - Subscription status (synced from Stripe)
- `stripe_sub_id` - Stripe subscription ID for webhook matching

---

## Billing Flows

### Flow 1: Individual User Signup (Personal Org)

```
1. User signs up (email + password)
   ↓
2. handle_new_user() trigger fires
   ↓
3. Creates user record (account_type = 'user')
   ↓
4. Creates personal organization (is_personal = true, org_type = 'personal')
   ↓
5. Adds user as owner in organization_members
   ↓
6. Creates FREE subscription for personal org
   ↓
7. User redirected to onboarding
```

**Result:** User has a personal workspace with free plan (1 seat)

---

### Flow 2: Individual User Upgrades to Pro

```
1. User clicks "Upgrade to Pro" in their personal workspace
   ↓
2. Frontend calls /api/billing/create-checkout-session
   ↓
3. Backend creates Stripe Checkout session
   - customer: org's stripe_customer_id (or create new)
   - price: pro_monthly or pro_annual
   - metadata: { org_id, user_id }
   ↓
4. User completes payment in Stripe
   ↓
5. Stripe webhook: checkout.session.completed
   ↓
6. Backend updates org_subscriptions:
   - plan_name = 'pro'
   - status = 'active'
   - stripe_sub_id = subscription.id
   - seats = 1
   ↓
7. User now has Pro features in personal workspace
```

**Result:** Personal org upgraded to Pro plan (still 1 seat)

---

### Flow 3: User Adds Family Members (Seat Expansion)

```
1. User (on Pro plan) wants to add spouse and kids
   ↓
2. User clicks "Add Seats" in billing settings
   ↓
3. Frontend calls /api/billing/update-subscription
   - new_seats: 4 (user + spouse + 2 kids)
   ↓
4. Backend calls Stripe API:
   - stripe.subscriptions.update(sub_id, { quantity: 4 })
   ↓
5. Stripe webhook: customer.subscription.updated
   ↓
6. Backend updates org_subscriptions:
   - seats = 4
   ↓
7. User can now invite 3 more people to personal org
   ↓
8. Invited users receive email invites
   ↓
9. They sign up (get their own personal orgs)
   ↓
10. They join the family org as members
```

**Result:** Personal org now has 4 seats, 4 members (owner + 3 members)

---

### Flow 4: Business Creates Team Organization

```
1. Hotel manager signs up (gets personal org with free plan)
   ↓
2. Manager clicks "Create Team" in dashboard
   ↓
3. Frontend shows "Create Organization" modal
   - Name: "Grand Hotel"
   - Type: business
   ↓
4. Backend creates new organization:
   - is_personal = false
   - org_type = 'business'
   - owner_id = manager's user_id
   ↓
5. Adds manager as owner in organization_members
   ↓
6. Creates FREE subscription for team org (default)
   ↓
7. Manager now has 2 orgs:
   - Personal org (free, 1 seat)
   - Grand Hotel (free, 1 seat)
   ↓
8. Manager upgrades Grand Hotel to Business plan
   ↓
9. Follows Flow 2 (checkout) for the team org
   ↓
10. Manager adds seats and invites staff
   ↓
11. Staff members join Grand Hotel org (they still keep their personal orgs)
```

**Result:** Manager has personal org + team org. Staff have personal org + team org.

---

## Plan Tiers & Pricing

### Free Plan
- **Price:** $0/month
- **Seats:** 1
- **Limits:**
  - 100 records
  - 1,000 API calls/month
  - 3 automations
  - 1 GB storage
  - 50 MAU
  - 5 schedules
  - 5,000 AI tokens/month
- **Features:** Basic functionality only

### Pro Plan
- **Price:** $29/month or $290/year (save 17%)
- **Seats:** 1-5 (additional seats: $10/seat/month)
- **Limits:**
  - 10,000 records
  - 100,000 API calls/month
  - 25 automations
  - 50 GB storage
  - 1,000 MAU
  - 50 schedules
  - 100,000 AI tokens/month
- **Features:** Advanced analytics, API access

### Business Plan
- **Price:** $99/month or $990/year (save 17%)
- **Seats:** 1-50 (additional seats: $8/seat/month)
- **Limits:**
  - 100,000 records
  - 1,000,000 API calls/month
  - 100 automations
  - 500 GB storage
  - 10,000 MAU
  - 200 schedules
  - 1,000,000 AI tokens/month
- **Features:** All Pro features + SSO, custom branding, priority support

### Enterprise Plan
- **Price:** Custom pricing
- **Seats:** Unlimited
- **Limits:** Unlimited (all -1 in database)
- **Features:** All Business features + dedicated support, custom contracts, SLA

---

## Stripe Integration

### Stripe Products & Prices

**Product Structure:**
```
Product: LiNKdev Starter Kit Pro
├─ Price: pro_monthly ($29/month, per seat)
└─ Price: pro_annual ($290/year, per seat)

Product: LiNKdev Starter Kit Business
├─ Price: business_monthly ($99/month base + $8/seat)
└─ Price: business_annual ($990/year base + $80/seat)

Product: LiNKdev Starter Kit Enterprise
└─ Price: Custom (negotiated)
```

### Webhook Events to Handle

1. **`checkout.session.completed`**
   - New subscription created
   - Create/update `billing_customers` record
   - Create/update `org_subscriptions` record
   - Set status = 'active'

2. **`customer.subscription.updated`**
   - Subscription modified (seats changed, plan changed)
   - Update `org_subscriptions` record
   - Update seats, plan_name, status

3. **`customer.subscription.deleted`**
   - Subscription canceled
   - Update `org_subscriptions` status = 'canceled'
   - Downgrade to free plan after grace period

4. **`invoice.payment_succeeded`**
   - Successful payment
   - Extend `current_period_end`
   - Ensure status = 'active'

5. **`invoice.payment_failed`**
   - Failed payment
   - Update status = 'past_due'
   - Send notification to org owner

---

## Database Functions

### 1. Check Feature Access

```sql
SELECT check_feature_access(
  p_user_id := auth.uid(),
  p_feature_key := 'max_records',
  p_org_id := 'current-org-id'
);

-- Returns: {"limit": 10000}
```

**Usage in Application:**
```typescript
const limits = await supabase.rpc('check_feature_access', {
  p_user_id: user.id,
  p_feature_key: 'max_records',
  p_org_id: currentOrg.id
});

if (recordCount >= limits.limit) {
  throw new Error('Record limit reached. Upgrade to create more.');
}
```

---

### 2. Get Active Subscription

```typescript
// Query org subscription
const { data: subscription } = await supabase
  .from('org_subscriptions')
  .select('*')
  .eq('org_id', currentOrg.id)
  .eq('status', 'active')
  .single();

// Check plan
if (subscription.plan_name === 'free') {
  // Show upgrade prompt
}
```

---

### 3. Check Seat Availability

```typescript
// Count current members
const { count: memberCount } = await supabase
  .from('organization_members')
  .select('*', { count: 'exact', head: true })
  .eq('org_id', currentOrg.id);

// Get subscription seats
const { data: subscription } = await supabase
  .from('org_subscriptions')
  .select('seats')
  .eq('org_id', currentOrg.id)
  .single();

if (memberCount >= subscription.seats) {
  throw new Error('Seat limit reached. Add more seats to invite users.');
}
```

---

## Multi-Organization Support

### User's Organization List

```typescript
// Get all orgs user belongs to
const { data: memberships } = await supabase
  .from('organization_members')
  .select(`
    role,
    organizations (
      id,
      name,
      org_type,
      is_personal,
      avatar_url
    )
  `)
  .eq('user_id', user.id);

// Separate personal and team orgs
const personalOrg = memberships.find(m => m.organizations.is_personal);
const teamOrgs = memberships.filter(m => !m.organizations.is_personal);
```

### Org Switcher UI

```typescript
// Store current org in context/state
const [currentOrg, setCurrentOrg] = useState(personalOrg);

// Switch organization
function switchOrg(orgId: string) {
  const org = memberships.find(m => m.organizations.id === orgId);
  setCurrentOrg(org.organizations);
  
  // Reload data for new org context
  refetchOrgData();
}
```

---

## Billing UI Components

### 1. Billing Settings Page

**Location:** `/dashboard/settings/billing`

**Features:**
- Current plan display
- Seat count and usage
- Billing cycle (monthly/annual)
- Payment method
- Invoices history
- Upgrade/downgrade buttons
- Add/remove seats
- Cancel subscription

---

### 2. Upgrade Modal

**Triggered by:**
- Feature gate hit (e.g., "Upgrade to create more records")
- Manual click on "Upgrade" button
- Seat limit reached

**Flow:**
1. Show plan comparison table
2. User selects plan and billing cycle
3. User enters seat count (if applicable)
4. Click "Subscribe"
5. Redirect to Stripe Checkout
6. Return to success page after payment

---

### 3. Usage Dashboard

**Location:** `/dashboard/usage`

**Displays:**
- Current usage vs limits for each metric
- Progress bars for each limit
- "Upgrade" prompts when approaching limits
- Historical usage charts

---

## Security Considerations

### 1. RLS Policies

**Billing Customers:**
- No user access (service role only)
- Prevents users from seeing Stripe customer IDs

**Org Subscriptions:**
- Org members can view their org's subscription
- Only service role can modify (via webhooks)

**Plan Features:**
- Public read access (all users can see plan limits)
- No write access for users

---

### 2. Webhook Security

**Verify Stripe Signatures:**
```typescript
const sig = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  request.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

**Use Service Role for Updates:**
```typescript
// Webhook handler uses service role client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

---

### 3. Metadata for Tracking

**Include in Stripe Checkout:**
```typescript
metadata: {
  org_id: currentOrg.id,
  user_id: user.id,
  org_type: currentOrg.org_type,
}
```

**Use in Webhooks:**
```typescript
const { org_id, user_id } = event.data.object.metadata;
// Update correct org subscription
```

---

## Migration Path

### From User-Level to Org-Level Billing

**If you had existing user subscriptions:**

1. Create personal org for each user
2. Move subscription from `subscriptions` to `org_subscriptions`
3. Update `org_id` to personal org ID
4. Update Stripe subscription metadata with org_id
5. Drop old `customers` and `subscriptions` tables

**This migration is included in the schema expansion SQL.**

---

## Testing Checklist

- [ ] User signup creates personal org with free subscription
- [ ] User can upgrade personal org to Pro
- [ ] User can add seats to personal org
- [ ] User can create team organization
- [ ] User can upgrade team org to Business
- [ ] User can invite members to team org
- [ ] Seat limits are enforced
- [ ] Feature gates work correctly
- [ ] Webhooks update subscriptions correctly
- [ ] Downgrade to free plan works
- [ ] Subscription cancellation works
- [ ] Invoice payment failed updates status
- [ ] Multi-org switching works
- [ ] RLS policies prevent unauthorized access

---

## Troubleshooting

### Issue: Webhook not updating subscription

**Check:**
1. Webhook signature verification passing?
2. Metadata includes correct `org_id`?
3. Service role key being used?
4. Database RLS policies not blocking service role?

**Debug:**
```sql
-- Check if subscription exists
SELECT * FROM org_subscriptions WHERE org_id = 'org-uuid';

-- Check Stripe subscription ID
SELECT * FROM org_subscriptions WHERE stripe_sub_id = 'sub_xxx';
```

---

### Issue: User can't access paid features

**Check:**
1. Subscription status is 'active'?
2. User is member of the org?
3. Feature gate checking correct org_id?
4. Plan features seeded correctly?

**Debug:**
```sql
-- Check user's org membership
SELECT * FROM organization_members WHERE user_id = 'user-uuid';

-- Check org subscription
SELECT * FROM org_subscriptions WHERE org_id = 'org-uuid';

-- Check feature limits
SELECT * FROM plan_features WHERE plan_name = 'pro';
```

---

### Issue: Seat limit not enforced

**Check:**
1. Frontend checking seat count before invite?
2. Backend validating seat availability?
3. Subscription seats value correct?

**Debug:**
```sql
-- Count current members
SELECT count(*) FROM organization_members WHERE org_id = 'org-uuid';

-- Check subscription seats
SELECT seats FROM org_subscriptions WHERE org_id = 'org-uuid';
```

---

## Next Steps

1. **Implement Stripe Checkout API** - Create checkout session endpoint
2. **Build Webhook Handler** - Process Stripe events
3. **Create Billing UI** - Settings page, upgrade modal, usage dashboard
4. **Add Feature Gates** - Middleware to check limits before operations
5. **Test End-to-End** - Signup → upgrade → invite → downgrade flow
6. **Set Up Monitoring** - Track failed payments, usage spikes, churn

---

**End of Billing Architecture Documentation**
