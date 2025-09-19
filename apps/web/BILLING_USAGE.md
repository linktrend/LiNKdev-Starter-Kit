# Billing & Entitlements Module

A comprehensive billing system with organization-scoped subscriptions, entitlements, and Stripe integration.

## Features

- **Organization-scoped billing** with role-based access
- **Entitlements system** for feature gating and usage limits
- **Stripe integration** with checkout and customer portal
- **Offline mode** with fake provider for template development
- **Automation integration** for billing events
- **Analytics events** for billing tracking

## Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (optional - will use mock data if not provided)
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_monthly_price_id
STRIPE_PRO_YEARLY_PRICE_ID=price_your_pro_yearly_price_id
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_your_enterprise_monthly_price_id
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_your_enterprise_yearly_price_id

# Billing Configuration
BILLING_OFFLINE=1  # Enable offline mode for template development

# Template Configuration
TEMPLATE_OFFLINE=1  # Enable template offline mode
```

## Quick Start

### 1. Get Available Plans

```typescript
import { api } from '@/trpc/react';

function PricingPage() {
  const { data: plansData } = api.billing.getPlans.useQuery();
  
  return (
    <div>
      {plansData?.plans.map(plan => (
        <div key={plan.id}>
          <h3>{plan.name}</h3>
          <p>{plan.description}</p>
          <p>${plan.price_monthly}/month</p>
        </div>
      ))}
    </div>
  );
}
```

### 2. Get Organization Subscription

```typescript
function BillingSettings({ orgId }: { orgId: string }) {
  const { data: subscriptionData } = api.billing.getSubscription.useQuery({ 
    orgId 
  });
  
  if (!subscriptionData?.subscription) {
    return <div>No active subscription</div>;
  }
  
  return (
    <div>
      <h3>Current Plan: {subscriptionData.subscription.plan}</h3>
      <p>Status: {subscriptionData.subscription.status}</p>
      <p>Period: {subscriptionData.subscription.current_period_start} - {subscriptionData.subscription.current_period_end}</p>
    </div>
  );
}
```

### 3. Create Checkout Session

```typescript
function UpgradeButton({ orgId, plan }: { orgId: string; plan: string }) {
  const createCheckout = api.billing.createCheckout.useMutation();
  
  const handleUpgrade = async () => {
    const result = await createCheckout.mutateAsync({
      orgId,
      plan,
      successUrl: `${window.location.origin}/settings/billing?success=true`,
      cancelUrl: `${window.location.origin}/pricing?canceled=true`,
    });
    
    if (result.url) {
      window.location.href = result.url;
    }
  };
  
  return <button onClick={handleUpgrade}>Upgrade to {plan}</button>;
}
```

### 4. Open Customer Portal

```typescript
function ManageSubscriptionButton({ orgId }: { orgId: string }) {
  const openPortal = api.billing.openPortal.useMutation();
  
  const handleManage = async () => {
    const result = await openPortal.mutateAsync({
      orgId,
      returnUrl: `${window.location.origin}/settings/billing`,
    });
    
    if (result.url) {
      window.location.href = result.url;
    }
  };
  
  return <button onClick={handleManage}>Manage Subscription</button>;
}
```

## Entitlements System

### Server-side Entitlement Checks

```typescript
import { hasEntitlement, hasExceededLimit } from '@/utils/billing/entitlements';

// Check if org can use automation
const canUseAutomation = await hasEntitlement(orgId, 'can_use_automation', supabase);

// Check if org has exceeded record limit
const hasExceededRecords = await hasExceededLimit(orgId, 'max_records', currentRecordCount, supabase);
```

### Client-side Entitlement Hook

```typescript
import { useEntitlement } from '@/hooks/use-entitlement';

function FeatureGate({ children, feature }: { children: React.ReactNode; feature: string }) {
  const { hasEntitlement, isLoading } = useEntitlement(feature);
  
  if (isLoading) return <div>Loading...</div>;
  if (!hasEntitlement) return <div>This feature requires a paid plan</div>;
  
  return <>{children}</>;
}

// Usage
<FeatureGate feature="can_use_automation">
  <AutomationSettings />
</FeatureGate>
```

## Offline Mode

When `TEMPLATE_OFFLINE=1` or Stripe environment variables are missing, the billing module runs in offline mode:

- **Mock checkout sessions** with deterministic URLs
- **Simulated webhook events** via `simulateEvent` mutation
- **In-memory subscription storage** for development
- **Fake customer portal** URLs

### Simulate Events (Offline Only)

```typescript
function SimulateEventButton({ orgId }: { orgId: string }) {
  const simulateEvent = api.billing.simulateEvent.useMutation();
  
  const handleSimulate = async (eventType: string) => {
    await simulateEvent.mutateAsync({
      type: eventType as any,
      orgId,
    });
  };
  
  return (
    <div>
      <button onClick={() => handleSimulate('checkout.session.completed')}>
        Simulate Checkout Success
      </button>
      <button onClick={() => handleSimulate('customer.subscription.created')}>
        Simulate Subscription Created
      </button>
    </div>
  );
}
```

## Plans Configuration

Plans are defined in `src/config/plans.ts`:

```typescript
export const BILLING_PLANS: BillingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price_monthly: 0,
    entitlements: {
      max_organizations: 1,
      max_members_per_org: 3,
      max_records: 100,
      can_use_automation: false,
    },
    features: ['1 Organization', 'Up to 3 members'],
  },
  // ... more plans
];
```

## Database Schema

The billing module adds these tables:

- `billing_customers` - Organization to Stripe customer mapping
- `org_subscriptions` - Organization-level subscription data
- `processed_events` - Webhook idempotency tracking

## Analytics Events

The module emits these analytics events:

- `billing.checkout_started`
- `billing.checkout_succeeded`
- `subscription.started`
- `subscription.updated`
- `subscription.canceled`
- `invoice.paid`
- `invoice.payment_failed`

## Integration Points

- **Organizations**: Billing is scoped to organizations
- **Automation Bridge**: Billing events are enqueued for external processing
- **Auth**: User identity for customer mapping
- **Analytics**: Typed events for billing tracking

## Webhook Setup

### 1. Configure Stripe Webhook

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the webhook signing secret to your environment variables

### 2. Environment Variables

Add these to your `.env.local`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (optional - will use mock data if not provided)
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_monthly_price_id
STRIPE_PRO_YEARLY_PRICE_ID=price_your_pro_yearly_price_id
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_your_enterprise_monthly_price_id
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_your_enterprise_yearly_price_id

# Billing Configuration
BILLING_OFFLINE=1  # Enable offline mode for template development
```

### 3. Offline Mode Simulation

In offline mode, you can simulate webhook events:

```typescript
// Simulate checkout completion
await api.billing.simulateEvent.mutate({
  type: 'checkout.session.completed',
  orgId: 'your-org-id',
});

// Simulate subscription creation
await api.billing.simulateEvent.mutate({
  type: 'customer.subscription.created',
  orgId: 'your-org-id',
});
```

## Example Flows

### Checkout Flow
1. User clicks "Upgrade to Pro" on pricing page
2. `createCheckout` creates Stripe session with `org_id` in metadata
3. User completes payment on Stripe checkout
4. Stripe sends `checkout.session.completed` webhook
5. Webhook handler creates customer mapping and subscription
6. User is redirected to success page

### Portal Flow
1. User clicks "Manage Subscription" on billing settings
2. `openPortal` creates Stripe customer portal session
3. User manages subscription on Stripe portal
4. Stripe sends subscription update webhooks
5. Webhook handler updates local subscription data

## Invoices

### API
The billing module provides invoice management through the `listInvoices` tRPC procedure:

```typescript
const { data: invoicesData } = api.billing.listInvoices.useQuery({
  orgId: 'your-org-id',
  limit: 10
});
```

### UI
Invoices are displayed in the billing settings page (`/settings/billing`) with:
- Invoice date and amount
- Payment status badges
- Links to hosted invoice URLs
- PDF download links
- Period information

### Offline Mode
In offline mode, deterministic mock invoices are returned for testing and development.

## Guards

### Server-side Guards
Use `assertEntitlement` to protect server-side operations:

```typescript
import { assertEntitlement } from '@/utils/billing/guards';

// In your tRPC procedure
await assertEntitlement(orgId, 'can_use_automation', supabase);
```

### Client-side Guards
Use the `Paywall` component or `useEntitlement` hook:

```typescript
import { Paywall } from '@/components/billing/Paywall';

<Paywall feature="can_use_automation" orgId={orgId}>
  <AutomationComponent />
</Paywall>
```

### Route Guards
Use the `useRequirePlan` hook for page-level protection:

```typescript
import { useRequirePlan } from '@/middleware/requirePlan';

function ProtectedPage() {
  const { allowed, component } = useRequirePlan({
    orgId: 'your-org-id',
    feature: 'can_use_automation',
    redirectTo: '/pricing'
  });

  if (!allowed) return component;
  
  return <YourProtectedContent />;
}
```

## Offline Simulate Flows

### Upgrade Flow
```typescript
// 1. Start with free plan
await api.billing.simulateEvent.mutate({
  type: 'checkout.session.completed',
  orgId: 'your-org-id'
});

// 2. Verify subscription created
const { data: subscription } = await api.billing.getSubscription.useQuery({
  orgId: 'your-org-id'
});
```

### Downgrade Flow
```typescript
// 1. Update subscription to different plan
await api.billing.simulateEvent.mutate({
  type: 'customer.subscription.updated',
  orgId: 'your-org-id'
});

// 2. Verify plan change
const { data: subscription } = await api.billing.getSubscription.useQuery({
  orgId: 'your-org-id'
});
```

### Cancel Flow
```typescript
// 1. Cancel subscription
await api.billing.simulateEvent.mutate({
  type: 'customer.subscription.deleted',
  orgId: 'your-org-id'
});

// 2. Verify cancellation
const { data: subscription } = await api.billing.getSubscription.useQuery({
  orgId: 'your-org-id'
});
```

## Testing

Run the billing tests:

```bash
pnpm test billing
```

The module includes unit tests for:
- Entitlement checks
- Offline mode functionality
- Webhook processing
- Plan validation
- Signature verification
- Idempotency handling
- Invoice management
- Guard functionality
