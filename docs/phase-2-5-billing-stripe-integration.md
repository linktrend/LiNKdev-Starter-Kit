# Phase 2.5: Billing & Stripe Integration

## 📋 Project Rules & Guardrails

**Before starting implementation, review these project rule files:**

1. **`.cursor/01-foundation.mdc`** - Monorepo structure, TypeScript config, package management, commit hygiene
2. **`.cursor/02-web-nextjs.mdc`** - Next.js App Router conventions, styling, data fetching, auth integration
3. **`.cursor/04-supabase.mdc`** - Database migrations, RLS policies, auth, edge functions, typed queries
4. **`.cursor/06-quality.mdc`** - Type-checking, linting, formatting, build verification requirements
5. **`.cursor/07-testing.mdc`** - Testing workflow, unit/integration/E2E test requirements
6. **`.cursor/12-mcp-rules.mdc`** - MCP server usage for database inspection and verification

---

## 🔒 Critical Guardrails

**Key Requirements:**
- ✅ Use Stripe SDK for all payment operations
- ✅ Never expose secret keys to client
- ✅ Validate webhook signatures
- ✅ Handle idempotent webhooks
- ✅ Sync billing data to database
- ✅ Test with Stripe test mode
- ✅ Document all webhook events

---

## 🎯 Phase Overview

**Goal:** Implement complete Stripe integration for org-based billing with subscription management, webhooks, and billing portal.

**Scope:**
1. Configure Stripe SDK and environment
2. Create Stripe customer on org creation
3. Implement subscription creation flow
4. Build webhook handlers for all events
5. Create billing settings page
6. Implement subscription management (upgrade/downgrade/cancel)
7. Add usage-based billing tracking
8. Test webhook flows end-to-end

**Dependencies:**
- Phase 2.1, 2.2, 2.3, 2.4 complete
- Stripe account configured with products/prices
- Database has `billing_customers` and `org_subscriptions` tables

---

## 📝 Implementation Steps

### Step 1: Install Stripe SDK

```bash
cd apps/web
pnpm add stripe @stripe/stripe-js
```

**Update `.env.local` and `.env.example`:**

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product IDs
STRIPE_PRICE_FREE=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
STRIPE_PRICE_BUSINESS_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_ANNUAL=price_...
STRIPE_PRICE_ENTERPRISE=price_...
```

---

### Step 2: Create Stripe Utilities

**File to create:** `apps/web/lib/stripe/server.ts`

```typescript
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    priceId: process.env.STRIPE_PRICE_FREE!,
    features: ['100 records', '1GB storage', 'Basic support'],
  },
  pro_monthly: {
    name: 'Pro (Monthly)',
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    interval: 'month',
  },
  pro_annual: {
    name: 'Pro (Annual)',
    priceId: process.env.STRIPE_PRICE_PRO_ANNUAL!,
    interval: 'year',
  },
  business_monthly: {
    name: 'Business (Monthly)',
    priceId: process.env.STRIPE_PRICE_BUSINESS_MONTHLY!,
    interval: 'month',
  },
  business_annual: {
    name: 'Business (Annual)',
    priceId: process.env.STRIPE_PRICE_BUSINESS_ANNUAL!,
    interval: 'year',
  },
} as const

export async function createStripeCustomer(params: {
  email: string
  name: string
  metadata?: Record<string, string>
}) {
  return await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata,
  })
}

export async function createCheckoutSession(params: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
  subscriptionData?: Stripe.Checkout.SessionCreateParams.SubscriptionData
}) {
  return await stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    subscription_data: params.subscriptionData,
  })
}

export async function createBillingPortalSession(params: {
  customerId: string
  returnUrl: string
}) {
  return await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  })
}

export async function updateSubscription(
  subscriptionId: string,
  params: Stripe.SubscriptionUpdateParams
) {
  return await stripe.subscriptions.update(subscriptionId, params)
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId)
}
```

**File to create:** `apps/web/lib/stripe/client.ts`

```typescript
'use client'

import { loadStripe } from '@stripe/stripe-js'

export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}
```

---

### Step 3: Create Billing Server Actions

**File to create:** `apps/web/app/actions/billing.ts`

```typescript
'use server'

import { createClient, requireAuth } from '@/lib/auth/server'
import {
  stripe,
  createStripeCustomer,
  createCheckoutSession,
  createBillingPortalSession,
} from '@/lib/stripe/server'
import { revalidatePath } from 'next/cache'

/**
 * Create Stripe customer for organization
 */
export async function createOrgStripeCustomer(orgId: string) {
  const user = await requireAuth()
  const supabase = createClient()

  // Get org details
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, owner_id')
    .eq('id', orgId)
    .single()

  if (orgError || !org) {
    return { error: 'Organization not found' }
  }

  // Check permissions
  if (org.owner_id !== user.id) {
    return { error: 'Only the owner can manage billing' }
  }

  // Check if customer already exists
  const { data: existingCustomer } = await supabase
    .from('billing_customers')
    .select('stripe_customer_id')
    .eq('org_id', orgId)
    .maybeSingle()

  if (existingCustomer) {
    return { success: true, customerId: existingCustomer.stripe_customer_id }
  }

  // Create Stripe customer
  const customer = await createStripeCustomer({
    email: user.email,
    name: org.name,
    metadata: {
      org_id: orgId,
      owner_id: user.id,
    },
  })

  // Save to database
  const { error: insertError } = await supabase
    .from('billing_customers')
    .insert({
      org_id: orgId,
      stripe_customer_id: customer.id,
      billing_email: user.email,
    })

  if (insertError) {
    console.error('Error saving customer:', insertError)
    return { error: 'Failed to create billing customer' }
  }

  return { success: true, customerId: customer.id }
}

/**
 * Create checkout session for subscription
 */
export async function createSubscriptionCheckout(
  orgId: string,
  priceId: string
) {
  const user = await requireAuth()
  const supabase = createClient()

  // Get or create customer
  let customerId: string
  const customerResult = await createOrgStripeCustomer(orgId)

  if (customerResult.error) {
    return { error: customerResult.error }
  }

  customerId = customerResult.customerId!

  // Create checkout session
  const session = await createCheckoutSession({
    customerId,
    priceId,
    successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/en/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/en/billing?canceled=true`,
    metadata: {
      org_id: orgId,
      user_id: user.id,
    },
    subscriptionData: {
      metadata: {
        org_id: orgId,
      },
    },
  })

  return { success: true, sessionId: session.id, url: session.url }
}

/**
 * Create billing portal session
 */
export async function createBillingPortal(orgId: string) {
  const user = await requireAuth()
  const supabase = createClient()

  // Get customer
  const { data: customer, error } = await supabase
    .from('billing_customers')
    .select('stripe_customer_id')
    .eq('org_id', orgId)
    .single()

  if (error || !customer) {
    return { error: 'No billing account found' }
  }

  // Create portal session
  const session = await createBillingPortalSession({
    customerId: customer.stripe_customer_id,
    returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/en/billing`,
  })

  return { success: true, url: session.url }
}

/**
 * Get organization subscription
 */
export async function getOrgSubscription(orgId: string) {
  const user = await requireAuth()
  const supabase = createClient()

  // Check membership
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) {
    return { error: 'Not a member of this organization' }
  }

  // Get subscription
  const { data: subscription, error } = await supabase
    .from('org_subscriptions')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching subscription:', error)
    return { error: 'Failed to fetch subscription' }
  }

  return { success: true, subscription }
}
```

---

### Step 4: Create Webhook Handler

**File to create:** `apps/web/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role for webhooks (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('Received webhook event:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
) {
  const orgId = session.metadata?.org_id

  if (!orgId) {
    console.error('No org_id in checkout session metadata')
    return
  }

  // Subscription will be handled by subscription.created event
  console.log('Checkout completed for org:', orgId)
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  const orgId = subscription.metadata?.org_id

  if (!orgId) {
    console.error('No org_id in subscription metadata')
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  const planName = getPlanNameFromPriceId(priceId)
  const billingInterval = subscription.items.data[0]?.price.recurring?.interval || 'month'

  // Upsert subscription
  const { error } = await supabase
    .from('org_subscriptions')
    .upsert({
      org_id: orgId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      plan_name: planName,
      billing_interval: billingInterval,
      seats: 1, // TODO: Extract from subscription quantity or metadata
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Error upserting subscription:', error)
    throw error
  }

  console.log('Subscription updated for org:', orgId)
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const orgId = subscription.metadata?.org_id

  if (!orgId) return

  const { error } = await supabase
    .from('org_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating canceled subscription:', error)
    throw error
  }

  console.log('Subscription canceled for org:', orgId)
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id)
  // TODO: Update payment history, send receipt email
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id)
  // TODO: Send payment failure notification email
}

function getPlanNameFromPriceId(priceId: string): string {
  const priceMap: Record<string, string> = {
    [process.env.STRIPE_PRICE_FREE!]: 'free',
    [process.env.STRIPE_PRICE_PRO_MONTHLY!]: 'pro',
    [process.env.STRIPE_PRICE_PRO_ANNUAL!]: 'pro',
    [process.env.STRIPE_PRICE_BUSINESS_MONTHLY!]: 'business',
    [process.env.STRIPE_PRICE_BUSINESS_ANNUAL!]: 'business',
    [process.env.STRIPE_PRICE_ENTERPRISE!]: 'enterprise',
  }

  return priceMap[priceId] || 'free'
}
```

---

### Step 5: Create Billing Settings Page

**File to create:** `apps/web/app/[locale]/billing/page.tsx`

```typescript
import { requireAuth } from '@/lib/auth/server'
import { getOrgSubscription } from '@/app/actions/billing'
import BillingDashboard from '@/components/billing/billing-dashboard'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { org?: string }
}) {
  const user = await requireAuth()
  const orgId = searchParams.org || user.id // Default to user's personal org

  const result = await getOrgSubscription(orgId)

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Billing & Subscription</h1>
      <BillingDashboard
        subscription={result.subscription}
        orgId={orgId}
      />
    </div>
  )
}
```

---

## ✅ Acceptance Criteria

- [ ] Stripe SDK installed and configured
- [ ] Stripe customer created on org creation
- [ ] Checkout session flow works
- [ ] Webhook handlers for all events implemented
- [ ] Subscription data synced to database
- [ ] Billing portal accessible
- [ ] Plan upgrades/downgrades work
- [ ] Subscription cancellation works
- [ ] Webhook signatures verified
- [ ] Idempotent webhook handling
- [ ] Integration tests pass
- [ ] Test mode verified end-to-end

---

## ✅ Definition of Done Checklist

- [ ] All acceptance criteria met
- [ ] TypeScript strict mode - zero errors
- [ ] ESLint + Prettier pass
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Environment variables documented
- [ ] Stripe webhooks configured in dashboard
- [ ] Test payments successful
- [ ] Webhook events logged and processed

---

## 🔍 Verification Commands

```bash
cd apps/web && pnpm typecheck && pnpm lint && pnpm test && pnpm build

# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed

# Verify subscriptions via MCP
call SupabaseMCP.select {"table": "org_subscriptions", "select": "org_id,plan_name,status,billing_interval", "limit": 10}
call SupabaseMCP.select {"table": "billing_customers", "select": "org_id,stripe_customer_id,billing_email", "limit": 10}
```

---

## 🚀 Next Phase

**Phase 2.6: Feature Gating** - Implement plan-based feature access control


