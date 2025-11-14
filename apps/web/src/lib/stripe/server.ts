'use server'

import Stripe from 'stripe'

import { stripe as sharedStripe, validateStripeConfig } from '@/utils/stripe/config'

validateStripeConfig()

export const stripe = sharedStripe

type StripePlanConfig = {
  name: string
  priceId?: string
  interval?: 'month' | 'year'
  features?: string[]
}

function getPriceEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]
    if (value) {
      return value
    }
  }
  return undefined
}

export const STRIPE_PLANS: Record<string, StripePlanConfig> = {
  free: {
    name: 'Free',
    priceId: getPriceEnv('STRIPE_PRICE_FREE', 'STRIPE_FREE_PRICE_ID'),
    features: ['100 records', '1GB storage', 'Basic support'],
  },
  pro_monthly: {
    name: 'Pro (Monthly)',
    priceId: getPriceEnv('STRIPE_PRICE_PRO_MONTHLY', 'STRIPE_PRO_MONTHLY_PRICE_ID'),
    interval: 'month',
  },
  pro_annual: {
    name: 'Pro (Annual)',
    priceId: getPriceEnv('STRIPE_PRICE_PRO_ANNUAL', 'STRIPE_PRO_YEARLY_PRICE_ID'),
    interval: 'year',
  },
  business_monthly: {
    name: 'Business (Monthly)',
    priceId: getPriceEnv('STRIPE_PRICE_BUSINESS_MONTHLY', 'STRIPE_BUSINESS_MONTHLY_PRICE_ID'),
    interval: 'month',
  },
  business_annual: {
    name: 'Business (Annual)',
    priceId: getPriceEnv('STRIPE_PRICE_BUSINESS_ANNUAL', 'STRIPE_BUSINESS_YEARLY_PRICE_ID'),
    interval: 'year',
  },
  enterprise: {
    name: 'Enterprise',
    priceId: getPriceEnv('STRIPE_PRICE_ENTERPRISE', 'STRIPE_ENTERPRISE_MONTHLY_PRICE_ID'),
  },
} as const

export async function createStripeCustomer(params: {
  email: string | null
  name: string
  metadata?: Record<string, string>
}) {
  return stripe.customers.create({
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
  return stripe.checkout.sessions.create({
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
  return stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  })
}

export async function updateSubscription(subscriptionId: string, params: Stripe.SubscriptionUpdateParams) {
  return stripe.subscriptions.update(subscriptionId, params)
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId)
}
