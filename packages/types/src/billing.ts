import { z } from 'zod';

// Plan and Entitlements
export interface PlanEntitlements {
  max_organizations?: number;
  max_members_per_org?: number;
  max_records?: number;
  max_reminders?: number;
  can_use_automation?: boolean;
  can_export_data?: boolean;
  can_use_analytics?: boolean;
  can_use_webhooks?: boolean;
  support_level?: 'community' | 'email' | 'priority' | 'dedicated';
}

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  entitlements: PlanEntitlements;
  features: string[];
  popular?: boolean;
}

// Database Types
export interface BillingCustomer {
  org_id: string;
  stripe_customer_id?: string;
  created_at: string;
}

export interface BillingSubscription {
  org_id: string;
  plan: string;
  status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused';
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  stripe_sub_id?: string;
  updated_at: string;
}

// tRPC Input Schemas
export const GetSubscriptionInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
});

export const CreateCheckoutInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  plan: z.string().min(1, 'Plan is required'),
  successUrl: z.string().url('Invalid success URL'),
  cancelUrl: z.string().url('Invalid cancel URL'),
});

export const OpenPortalInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  returnUrl: z.string().url('Invalid return URL'),
});

export const SimulateEventInput = z.object({
  type: z.enum([
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.paid',
    'invoice.payment_failed'
  ]),
  orgId: z.string().uuid('Invalid organization ID'),
});

// Response Types
export interface CheckoutResponse {
  sessionId?: string;
  url?: string;
  error?: string;
}

export interface PortalResponse {
  url?: string;
  error?: string;
}

export interface SubscriptionResponse {
  subscription?: BillingSubscription;
  customer?: BillingCustomer;
  error?: string;
}

// Analytics Event Types
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
  | 'invoice.payment_failed';

export interface BillingAnalyticsPayload {
  org_id: string;
  plan?: string;
  amount?: number;
  currency?: string;
  trial_end?: string;
  metadata?: Record<string, any>;
}

// Invoice Types
export interface BillingInvoice {
  id: string;
  org_id: string;
  stripe_invoice_id?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  created_at: string;
  paid_at?: string;
  period_start: string;
  period_end: string;
}

// tRPC Input Schemas
export const ListInvoicesInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  limit: z.number().min(1).max(100).default(10),
});

export interface InvoiceResponse {
  invoices: BillingInvoice[];
  has_more: boolean;
  offline: boolean;
}
