'use server';

import { revalidatePath } from 'next/cache';

import { requireAuth } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';
import {
  createBillingPortalSession,
  createCheckoutSession,
  createStripeCustomer,
  stripe,
} from '@/lib/stripe/server';
import type { AvailablePlan, BillingPortalResult, CheckoutSessionResult, OrgSubscription } from '@/types/billing';

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  );
}

export async function getAvailablePlans(): Promise<{
  success: boolean;
  plans?: Array<AvailablePlan>;
  error?: string;
}> {
  try {
    const plans: AvailablePlan[] = [
      {
        name: 'free',
        displayName: 'Free',
        price: '$0',
        interval: 'forever',
        priceId: process.env.STRIPE_PRICE_FREE || 'price_free',
        features: [
          '100 records',
          '1,000 API calls/month',
          '3 automations',
          '1 GB storage',
          'Basic support',
        ],
      },
      {
        name: 'pro',
        displayName: 'Pro',
        price: '$29',
        interval: 'per month',
        priceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
        popular: true,
        features: [
          '10,000 records',
          '100,000 API calls/month',
          '25 automations',
          '50 GB storage',
          'Advanced analytics',
          'API access',
          'Priority support',
        ],
      },
      {
        name: 'business',
        displayName: 'Business',
        price: '$99',
        interval: 'per month',
        priceId: process.env.STRIPE_PRICE_BUSINESS_MONTHLY!,
        features: [
          '100,000 records',
          '1,000,000 API calls/month',
          '100 automations',
          '500 GB storage',
          'All Pro features',
          'SSO',
          'Custom branding',
          'Dedicated support',
        ],
      },
    ];

    return { success: true, plans };
  } catch (error) {
    console.error('Error fetching plans:', error);
    return { success: false, error: 'Failed to load plans' };
  }
}

/**
 * Create Stripe customer for organization
 * Only org owner can create billing customer
 */
export async function createOrgStripeCustomer(
  orgId: string
): Promise<{ success: boolean; customerId?: string; error?: string }> {
  try {
    const user = await requireAuth();
    const supabase = createClient();

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, owner_id')
      .eq('id', orgId)
      .single();

    type OrgResult = { id: string; name: string; owner_id: string };
    const typedOrg = org as OrgResult | null;

    if (orgError || !typedOrg) {
      return { success: false, error: 'Organization not found' };
    }

    if (typedOrg.owner_id !== user.id) {
      return { success: false, error: 'Only the owner can manage billing' };
    }

    const { data: existingCustomer } = await supabase
      .from('billing_customers')
      .select('stripe_customer_id')
      .eq('org_id', orgId)
      .maybeSingle();

    type CustomerResult = { stripe_customer_id: string | null };
    const typedCustomer = existingCustomer as CustomerResult | null;

    if (typedCustomer?.stripe_customer_id) {
      return {
        success: true,
        customerId: typedCustomer.stripe_customer_id,
      };
    }

    const customer = await createStripeCustomer({
      email: user.email,
      name: typedOrg.name,
      metadata: {
        org_id: orgId,
        owner_id: user.id,
      },
    });

    const { error: insertError } = await supabase.from('billing_customers').insert({
      org_id: orgId,
      stripe_customer_id: customer.id,
      billing_email: user.email ?? null,
    } as any);

    if (insertError) {
      console.error('Error saving customer:', insertError);
      return { success: false, error: 'Failed to create billing customer' };
    }

    return { success: true, customerId: customer.id };
  } catch (error) {
    console.error('Error in createOrgStripeCustomer:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Create checkout session for subscription
 * Redirects user to Stripe Checkout
 */
export async function createSubscriptionCheckout(
  orgId: string,
  priceId: string
): Promise<CheckoutSessionResult> {
  try {
    const user = await requireAuth();
    const supabase = createClient();

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('owner_id')
      .eq('id', orgId)
      .single();

    type OrgOwnerResult = { owner_id: string };
    const typedOrg = org as OrgOwnerResult | null;

    if (orgError || !typedOrg) {
      return { success: false, error: 'Organization not found' };
    }

    if (typedOrg.owner_id !== user.id) {
      return { success: false, error: 'Only the owner can manage billing' };
    }

    const customerResult = await createOrgStripeCustomer(orgId);

    if (!customerResult.success || !customerResult.customerId) {
      return { success: false, error: customerResult.error };
    }

    const siteUrl = getSiteUrl();
    const session = await createCheckoutSession({
      customerId: customerResult.customerId,
      priceId,
      successUrl: `${siteUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${siteUrl}/billing?canceled=true`,
      metadata: {
        org_id: orgId,
        user_id: user.id,
      },
      subscriptionData: {
        metadata: {
          org_id: orgId,
        },
      },
    });

    return { success: true, sessionId: session.id, url: session.url ?? undefined };
  } catch (error) {
    console.error('Error in createSubscriptionCheckout:', error);
    return { success: false, error: 'Failed to create checkout session' };
  }
}

/**
 * Create billing portal session
 * Allows user to manage subscription, payment methods, invoices
 */
export async function createBillingPortal(orgId: string): Promise<BillingPortalResult> {
  try {
    const user = await requireAuth();
    const supabase = createClient();

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('owner_id')
      .eq('id', orgId)
      .single();

    type OrgOwnerResult = { owner_id: string };
    const typedOrg = org as OrgOwnerResult | null;

    if (orgError || !typedOrg) {
      return { success: false, error: 'Organization not found' };
    }

    if (typedOrg.owner_id !== user.id) {
      return { success: false, error: 'Only the owner can manage billing' };
    }

    const { data: customer, error } = await supabase
      .from('billing_customers')
      .select('stripe_customer_id')
      .eq('org_id', orgId)
      .single();

    type CustomerResult = { stripe_customer_id: string | null };
    const typedCustomer = customer as CustomerResult | null;

    if (error || !typedCustomer?.stripe_customer_id) {
      return { success: false, error: 'No billing account found' };
    }

    const siteUrl = getSiteUrl();
    const session = await createBillingPortalSession({
      customerId: typedCustomer.stripe_customer_id,
      returnUrl: `${siteUrl}/billing`,
    });

    return { success: true, url: session.url };
  } catch (error) {
    console.error('Error in createBillingPortal:', error);
    return { success: false, error: 'Failed to create billing portal session' };
  }
}

/**
 * Get organization subscription
 * Any org member can view subscription
 */
export async function getOrgSubscription(orgId: string): Promise<{
  success: boolean;
  subscription?: OrgSubscription | null;
  error?: string;
}> {
  try {
    const user = await requireAuth();
    const supabase = createClient();

    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) {
      return { success: false, error: 'Not a member of this organization' };
    }

    const { data: subscription, error } = await supabase
      .from('org_subscriptions')
      .select('*')
      .eq('org_id', orgId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      return { success: false, error: 'Failed to fetch subscription' };
    }

    return { success: true, subscription };
  } catch (error) {
    console.error('Error in getOrgSubscription:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Cancel subscription at period end
 * Only org owner can cancel
 */
export async function cancelSubscription(orgId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const user = await requireAuth();
    const supabase = createClient();

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('owner_id')
      .eq('id', orgId)
      .single();

    type OrgOwnerResult = { owner_id: string };
    const typedOrg = org as OrgOwnerResult | null;

    if (orgError || !typedOrg) {
      return { success: false, error: 'Organization not found' };
    }

    if (typedOrg.owner_id !== user.id) {
      return { success: false, error: 'Only the owner can cancel subscription' };
    }

    const { data: subscription, error: subError } = await supabase
      .from('org_subscriptions')
      .select('stripe_subscription_id')
      .eq('org_id', orgId)
      .single();

    type SubscriptionResult = { stripe_subscription_id: string | null };
    const typedSubscription = subscription as SubscriptionResult | null;

    if (subError || !typedSubscription?.stripe_subscription_id) {
      return { success: false, error: 'No active subscription found' };
    }

    await stripe.subscriptions.update(typedSubscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    revalidatePath('/billing');

    return { success: true };
  } catch (error) {
    console.error('Error in cancelSubscription:', error);
    return { success: false, error: 'Failed to cancel subscription' };
  }
}
