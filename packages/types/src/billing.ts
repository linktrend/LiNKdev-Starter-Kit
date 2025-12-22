import { z } from 'zod'
import type { Tables } from './db'

/**
 * Feature entitlements associated with a pricing plan.
 */
export interface PlanEntitlements {
  max_organizations?: number
  max_members_per_org?: number
  max_records?: number
  max_reminders?: number
  can_use_automation?: boolean
  can_export_data?: boolean
  can_use_analytics?: boolean
  can_use_webhooks?: boolean
  support_level?: 'community' | 'email' | 'priority' | 'dedicated'
}

/**
 * Billing plan configuration used by the app (not a DB table).
 */
export interface BillingPlan {
  id: string
  name: string
  description: string
  price_monthly: number
  price_yearly: number
  stripe_price_id_monthly?: string
  stripe_price_id_yearly?: string
  entitlements: PlanEntitlements
  features: string[]
  popular?: boolean
}

/**
 * Customer record from `public.billing_customers`.
 */
export type BillingCustomer = Tables<'billing_customers'>

/**
 * Organization subscription record from `public.org_subscriptions`.
 * Captures plan selection, billing cadence, seats, and lifecycle status.
 */
export type BillingSubscription = Tables<'org_subscriptions'>

/**
 * tRPC input: fetch the current subscription for an org.
 */
export const GetSubscriptionInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
})

/**
 * tRPC input: create a checkout session for a plan.
 */
export const CreateCheckoutInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  plan: z.string().min(1, 'Plan is required'),
  successUrl: z.string().url('Invalid success URL'),
  cancelUrl: z.string().url('Invalid cancel URL'),
})

/**
 * tRPC input: open the billing portal for an org.
 */
export const OpenPortalInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  returnUrl: z.string().url('Invalid return URL'),
})

/**
 * tRPC input: simulate Stripe webhook events for testing flows.
 */
export const SimulateEventInput = z.object({
  type: z.enum([
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.paid',
    'invoice.payment_failed',
  ]),
  orgId: z.string().uuid('Invalid organization ID'),
})

/**
 * Response payload for checkout creation.
 */
export interface CheckoutResponse {
  sessionId?: string
  url?: string
  error?: string
}

/**
 * Response payload for billing portal access.
 */
export interface PortalResponse {
  url?: string
  error?: string
}

/**
 * Subscription lookup response coupling customer + subscription.
 */
export interface SubscriptionResponse {
  subscription?: BillingSubscription
  customer?: BillingCustomer
  error?: string
}

/**
 * Analytics events emitted from billing workflows.
 */
export type BillingAnalyticsEvent =
  | 'billing.checkout_started'
  | 'billing.checkout_succeeded'
  | 'billing.checkout_canceled'
  | 'subscription.started'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'subscription.trial_started'
  | 'subscription.trial_ended'
  | 'invoice.paid'
  | 'invoice.payment_failed'

/**
 * Payload describing a billing analytics event.
 */
export interface BillingAnalyticsPayload {
  org_id: string
  plan?: string
  amount?: number
  currency?: string
  trial_end?: string
  metadata?: Record<string, any>
}

/**
 * Invoice representation used by the application (Stripe-derived).
 */
export interface BillingInvoice {
  id: string
  org_id: string
  stripe_invoice_id?: string
  amount: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  hosted_invoice_url?: string
  invoice_pdf?: string
  created_at: string
  paid_at?: string
  period_start: string
  period_end: string
}

/**
 * tRPC input: list invoices with pagination.
 */
export const ListInvoicesInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  limit: z.number().min(1).max(100).default(10),
})

/**
 * Invoice list response payload.
 */
export interface InvoiceResponse {
  invoices: BillingInvoice[]
  has_more: boolean
  offline: boolean
}
