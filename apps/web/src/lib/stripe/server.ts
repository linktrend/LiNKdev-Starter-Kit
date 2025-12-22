'use server'

import Stripe from 'stripe'
import { validateEnvironment } from '@/lib/env/validation'

// Validate environment variables on module load
if (process.env.NODE_ENV !== 'test') {
  validateEnvironment()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY_LIVE

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-11-20.acacia' as '2023-10-16',
  typescript: true,
})

export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    priceId: process.env.STRIPE_PRICE_FREE || 'price_free',
    features: ['100 records', '1GB storage', 'Basic support'],
  },
  pro_monthly: {
    name: 'Pro (Monthly)',
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    interval: 'month' as const,
  },
  pro_annual: {
    name: 'Pro (Annual)',
    priceId: process.env.STRIPE_PRICE_PRO_ANNUAL!,
    interval: 'year' as const,
  },
  business_monthly: {
    name: 'Business (Monthly)',
    priceId: process.env.STRIPE_PRICE_BUSINESS_MONTHLY!,
    interval: 'month' as const,
  },
  business_annual: {
    name: 'Business (Annual)',
    priceId: process.env.STRIPE_PRICE_BUSINESS_ANNUAL!,
    interval: 'year' as const,
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
  },
} as const

export type StripePlanKey = keyof typeof STRIPE_PLANS

export async function createStripeCustomer(params: {
  email: string | null
  name: string
  metadata?: Record<string, string>
}) {
  return await stripe.customers.create({
    email: params.email ?? undefined,
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

export async function createBillingPortalSession(params: { customerId: string; returnUrl: string }) {
  return await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  })
}

export async function updateSubscription(subscriptionId: string, params: Stripe.SubscriptionUpdateParams) {
  return await stripe.subscriptions.update(subscriptionId, params)
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId)
}
