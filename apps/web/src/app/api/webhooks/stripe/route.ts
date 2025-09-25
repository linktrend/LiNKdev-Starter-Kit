import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { emitAutomationEvent } from "@/utils/automation/event-emitter";
import { getPlanById } from "@/config/plans";
import { cookies } from "next/headers";

// TODO: Migrate to centralized webhook router at /api/webhooks/[provider]
// This route will be deprecated in favor of /api/webhooks/stripe after Phase 2

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Check if we're in offline mode
const isOfflineMode = process.env.TEMPLATE_OFFLINE === '1' || 
  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  !process.env.STRIPE_SECRET_KEY ||
  process.env.BILLING_OFFLINE === '1';

export async function POST(req: NextRequest) {
  try {
    // In offline mode, just log and return success
    if (isOfflineMode) {
      const body = await req.text();
      console.log('OFFLINE MODE: Stripe webhook received:', {
        headers: Object.fromEntries(req.headers.entries()),
        body: JSON.parse(body),
      });
      return NextResponse.json({ ok: true, offline: true });
    }

    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createClient({ cookies });

    // Check if event was already processed (idempotency)
    const { data: existingEvent } = await supabase
      .from('processed_events')
      .select('id')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      console.log('Event already processed:', event.id);
      return NextResponse.json({ ok: true, idempotent: true });
    }

    // Mark event as being processed
    await supabase
      .from('processed_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        metadata: { processed_at: new Date().toISOString() },
      });

    // Process the event
    await processWebhookEvent(event, supabase);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processWebhookEvent(event: Stripe.Event, supabase: any) {
  console.log('Processing webhook event:', event.type, event.id);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice, supabase);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }
  } catch (error) {
    console.error('Error processing webhook event:', error);
    throw error;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  
  if (!customerId || !subscriptionId) {
    console.error('Missing customer or subscription ID in checkout session');
    return;
  }

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;
  
  if (!priceId) {
    console.error('No price ID found in subscription');
    return;
  }

  // Find the plan by Stripe price ID
  const plan = findPlanByPriceId(priceId);
  if (!plan) {
    console.error('No plan found for price ID:', priceId);
    return;
  }

  // Get organization ID from metadata or create customer mapping
  let orgId = session.metadata?.org_id;
  
  if (!orgId) {
    // Try to find existing customer mapping
    const { data: existingCustomer } = await supabase
      .from('billing_customers')
      .select('org_id')
      .eq('stripe_customer_id', customerId)
      .single();
    
    orgId = existingCustomer?.org_id;
  }

  if (!orgId) {
    console.error('No organization ID found for customer:', customerId);
    return;
  }

  // Create or update customer mapping
  await supabase
    .from('billing_customers')
    .upsert({
      org_id: orgId,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    });

  // Create or update subscription
  await supabase
    .from('org_subscriptions')
    .upsert({
      org_id: orgId,
      plan: plan.id,
      status: subscription.status === 'active' ? 'active' : 'trialing',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      stripe_sub_id: subscriptionId,
      updated_at: new Date().toISOString(),
    });

  // Emit analytics event
  await emitAnalyticsEvent('billing.checkout_succeeded', {
    org_id: orgId,
    plan: plan.id,
    amount: session.amount_total,
    currency: session.currency,
  });

  console.log('Checkout completed for org:', orgId, 'plan:', plan.id);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer as string;
  
  // Find organization by customer ID
  const { data: customer } = await supabase
    .from('billing_customers')
    .select('org_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!customer) {
    console.error('No organization found for customer:', customerId);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceId ? findPlanByPriceId(priceId) : null;

  // Update subscription
  await supabase
    .from('org_subscriptions')
    .update({
      plan: plan?.id || 'free',
      status: mapStripeStatus(subscription.status),
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_sub_id', subscriptionId);

  // Emit analytics event
  await emitAnalyticsEvent('subscription.updated', {
    org_id: customer.org_id,
    plan: plan?.id || 'free',
    status: mapStripeStatus(subscription.status),
  });

  console.log('Subscription updated for org:', customer.org_id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  const subscriptionId = subscription.id;
  
  // Find organization by subscription ID
  const { data: orgSub } = await supabase
    .from('org_subscriptions')
    .select('org_id')
    .eq('stripe_sub_id', subscriptionId)
    .single();

  if (!orgSub) {
    console.error('No organization found for subscription:', subscriptionId);
    return;
  }

  // Update subscription status
  await supabase
    .from('org_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_sub_id', subscriptionId);

  // Emit analytics event
  await emitAnalyticsEvent('subscription.canceled', {
    org_id: orgSub.org_id,
  });

  console.log('Subscription canceled for org:', orgSub.org_id);
}

async function handleInvoicePaid(invoice: Stripe.Invoice, supabase: any) {
  const customerId = invoice.customer as string;
  
  // Find organization by customer ID
  const { data: customer } = await supabase
    .from('billing_customers')
    .select('org_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!customer) {
    console.error('No organization found for customer:', customerId);
    return;
  }

  // Emit analytics event
  await emitAnalyticsEvent('invoice.paid', {
    org_id: customer.org_id,
    amount: invoice.amount_paid,
    currency: invoice.currency,
  });

  console.log('Invoice paid for org:', customer.org_id);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  const customerId = invoice.customer as string;
  
  // Find organization by customer ID
  const { data: customer } = await supabase
    .from('billing_customers')
    .select('org_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!customer) {
    console.error('No organization found for customer:', customerId);
    return;
  }

  // Update subscription status to past_due
  await supabase
    .from('org_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('org_id', customer.org_id);

  // Emit analytics event
  await emitAnalyticsEvent('invoice.payment_failed', {
    org_id: customer.org_id,
    amount: invoice.amount_due,
    currency: invoice.currency,
  });

  console.log('Invoice payment failed for org:', customer.org_id);
}

function findPlanByPriceId(priceId: string) {
  // Find plan by Stripe price ID
  const plans = [
    { id: 'pro', monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID, yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID },
    { id: 'enterprise', monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID, yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID },
  ];

  for (const plan of plans) {
    if (plan.monthly === priceId || plan.yearly === priceId) {
      return getPlanById(plan.id);
    }
  }

  return null;
}

function mapStripeStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    'active': 'active',
    'trialing': 'trialing',
    'canceled': 'canceled',
    'incomplete': 'incomplete',
    'incomplete_expired': 'incomplete_expired',
    'past_due': 'past_due',
    'unpaid': 'unpaid',
    'paused': 'paused',
  };

  return statusMap[stripeStatus] || 'active';
}

async function emitAnalyticsEvent(event: string, payload: any) {
  try {
    // TODO: Implement actual analytics emission
    console.log('Analytics Event:', { event, payload });
    
    // For now, just log the event
    // In a real implementation, this would call PostHog or similar
  } catch (error) {
    console.error('Error emitting analytics event:', error);
    // Don't throw - analytics failures shouldn't break the main flow
  }
}
