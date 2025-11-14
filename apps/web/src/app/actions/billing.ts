'use server'

import { createClient as createServiceRoleClient, SupabaseClient } from '@supabase/supabase-js'

import { createClient, requireAuth } from '@/lib/auth/server'
import {
  createBillingPortalSession,
  createCheckoutSession,
  createStripeCustomer,
} from '@/lib/stripe/server'
import type { Database } from '@/types/database.types'

type BillingCustomerResult =
  | { success: true; customerId: string; skipped?: boolean }
  | { success: true; customerId?: undefined; skipped: true }
  | { success: false; error: string }

type BillingActionResponse =
  | { success: true; url?: string; sessionId?: string }
  | { success: false; error: string }

const BILLING_OFFLINE =
  process.env.BILLING_OFFLINE === '1' ||
  (!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY_LIVE)

let serviceRoleClient: SupabaseClient<Database> | null = null

function getServiceRoleClient() {
  if (BILLING_OFFLINE) {
    throw new Error('Billing is disabled')
  }

  if (serviceRoleClient) return serviceRoleClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase service role environment variables are not set')
  }

  serviceRoleClient = createServiceRoleClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return serviceRoleClient
}

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  )
}

/**
 * Create Stripe customer for organization
 */
export async function createOrgStripeCustomer(orgId: string): Promise<BillingCustomerResult> {
  const user = await requireAuth()

  if (!orgId) {
    return { success: false, error: 'Organization ID is required' }
  }

  if (BILLING_OFFLINE) {
    console.info('Billing is disabled; skipping Stripe customer creation for org:', orgId)
    return { success: true, skipped: true }
  }

  const supabase = createClient() as any

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, owner_id, slug')
    .eq('id', orgId)
    .single()

  if (orgError || !org) {
    console.error('Organization lookup failed:', orgError)
    return { success: false, error: 'Organization not found' }
  }

  if (org.owner_id !== user.id) {
    return { success: false, error: 'Only the owner can manage billing' }
  }

  try {
    const adminSupabase = getServiceRoleClient()

    const { data: existingCustomer } = await adminSupabase
      .from('billing_customers')
      .select('stripe_customer_id')
      .eq('org_id', orgId)
      .maybeSingle()

    if (existingCustomer?.stripe_customer_id) {
      return { success: true, customerId: existingCustomer.stripe_customer_id }
    }

    const customer = await createStripeCustomer({
      email: user.email,
      name: org.name,
      metadata: {
        org_id: orgId,
        owner_id: user.id,
        slug: org.slug ?? undefined,
      },
    })

    const { error: insertError } = await adminSupabase.from('billing_customers').insert({
      org_id: orgId,
      stripe_customer_id: customer.id,
      billing_email: user.email ?? null,
    })

    if (insertError) {
      console.error('Error saving billing customer:', insertError)
      return { success: false, error: 'Failed to save billing customer' }
    }

    return { success: true, customerId: customer.id }
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    return { success: false, error: 'Failed to create billing customer' }
  }
}

/**
 * Create checkout session for subscription
 */
export async function createSubscriptionCheckout(orgId: string, priceId: string): Promise<BillingActionResponse> {
  const user = await requireAuth()

  if (!orgId || !priceId) {
    return { success: false, error: 'Organization and price are required' }
  }

  if (BILLING_OFFLINE) {
    return { success: false, error: 'Billing is currently disabled' }
  }

  const supabase = createClient() as any

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!membership || (membership as any)?.role !== 'owner') {
    return { success: false, error: 'Only the owner can upgrade this organization' }
  }

  const customerResult = await createOrgStripeCustomer(orgId)

  if (!customerResult.success || !customerResult.customerId) {
    return { success: false, error: (customerResult as any).error ?? 'Unable to create billing customer' }
  }

  try {
    const siteUrl = getSiteUrl()
    const session = await createCheckoutSession({
      customerId: customerResult.customerId,
      priceId,
      successUrl: `${siteUrl}/en/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${siteUrl}/en/billing?canceled=true`,
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

    if (!session?.id || !session.url) {
      return { success: false, error: 'Failed to create checkout session' }
    }

    return { success: true, sessionId: session.id, url: session.url }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return { success: false, error: 'Failed to start checkout session' }
  }
}

/**
 * Create billing portal session
 */
export async function createBillingPortal(orgId: string): Promise<BillingActionResponse> {
  const user = await requireAuth()

  if (!orgId) {
    return { success: false, error: 'Organization ID is required' }
  }

  if (BILLING_OFFLINE) {
    return { success: false, error: 'Billing is currently disabled' }
  }

  const supabase = createClient() as any

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!membership || (membership as any)?.role !== 'owner') {
    return { success: false, error: 'Only the owner can access billing portal' }
  }

  try {
    const adminSupabase = getServiceRoleClient()
    const { data: customer, error } = await adminSupabase
      .from('billing_customers')
      .select('stripe_customer_id')
      .eq('org_id', orgId)
      .single()

    if (error || !customer?.stripe_customer_id) {
      return { success: false, error: 'Billing customer not found' }
    }

    const session = await createBillingPortalSession({
      customerId: customer.stripe_customer_id,
      returnUrl: `${getSiteUrl()}/en/billing`,
    })

    if (!session.url) {
      return { success: false, error: 'Failed to create billing portal session' }
    }

    return { success: true, url: session.url }
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    return { success: false, error: 'Failed to create billing portal session' }
  }
}

/**
 * Get organization subscription
 */
export async function getOrgSubscription(orgId: string) {
  const user = await requireAuth()
  const supabase = createClient() as any

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) {
    return { success: false, error: 'Not a member of this organization' }
  }

  const { data: subscription, error } = await supabase
    .from('org_subscriptions')
    .select('*')
    .eq('org_id', orgId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching subscription:', error)
    return { success: false, error: 'Failed to fetch subscription' }
  }

  return { success: true, subscription }
}
