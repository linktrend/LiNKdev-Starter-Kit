/**
 * Stripe webhook handler
 * Uses official Stripe verification and handles specific events
 */

import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface StripeHandlerOptions {
  rawBody: Buffer | Uint8Array | string;
  headers: Headers | Record<string, string>;
  env: { STRIPE_WEBHOOK_SECRET: string };
  now?: () => number; // for testing
}

export type StripeHandlerResult = 
  | { ok: true; status: number }
  | { ok: false; status: number; reason: string };

// In-memory idempotency set (fallback when DB not available)
const processedEvents = new Set<string>();

/**
 * Handle Stripe webhook events
 */
export async function handleStripe(opts: StripeHandlerOptions): Promise<StripeHandlerResult> {
  const { rawBody, headers, env, now = () => Date.now() } = opts;
  
  try {
    // Convert raw body to string for Stripe verification
    const body = typeof rawBody === 'string' ? rawBody : Buffer.from(rawBody).toString('utf8');
    
    // Get signature from headers
    const signature = headers instanceof Headers 
      ? headers.get('stripe-signature')
      : headers['stripe-signature'] || headers['Stripe-Signature'];
    
    if (!signature) {
      console.warn('WEBHOOK: Missing Stripe signature header');
      return { ok: false, status: 400, reason: 'Missing stripe-signature header' };
    }

    // Verify signature using Stripe's official method
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.warn('WEBHOOK: Stripe signature verification failed', { error: err instanceof Error ? err.message : 'Unknown error' });
      return { ok: false, status: 401, reason: 'Invalid signature' };
    }

    // Check idempotency
    const isProcessed = await checkIdempotency(event.id);
    if (isProcessed) {
      console.info('WEBHOOK: Event already processed', { eventId: event.id, type: event.type });
      return { ok: true, status: 200 };
    }

    // Mark as being processed
    await markAsProcessed(event.id, event.type);

    // Process the event
    await processStripeEvent(event);

    console.info('WEBHOOK: Stripe event processed successfully', { 
      eventId: event.id, 
      type: event.type,
      timestamp: new Date(now()).toISOString()
    });

    return { ok: true, status: 200 };

  } catch (error) {
    console.error('WEBHOOK: Stripe handler error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(now()).toISOString()
    });
    return { ok: false, status: 500, reason: 'Internal server error' };
  }
}

/**
 * Process Stripe webhook event
 */
async function processStripeEvent(event: Stripe.Event): Promise<void> {
  console.info('WEBHOOK: Processing Stripe event', { 
    type: event.type, 
    id: event.id,
    timestamp: new Date().toISOString()
  });

  switch (event.type) {
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'checkout.session.completed':
      console.info('WEBHOOK: Checkout session completed (logged only)', {
        sessionId: (event.data.object as Stripe.Checkout.Session).id
      });
      break;

    case 'customer.subscription.created':
      console.info('WEBHOOK: Subscription created (logged only)', {
        subscriptionId: (event.data.object as Stripe.Subscription).id
      });
      break;

    case 'customer.subscription.deleted':
      console.info('WEBHOOK: Subscription deleted (logged only)', {
        subscriptionId: (event.data.object as Stripe.Subscription).id
      });
      break;

    case 'invoice.payment_failed':
      console.info('WEBHOOK: Invoice payment failed (logged only)', {
        invoiceId: (event.data.object as Stripe.Invoice).id
      });
      break;

    default:
      console.info('WEBHOOK: Unhandled Stripe event type', { type: event.type });
  }
}

/**
 * Handle invoice.paid event
 */
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  console.info('WEBHOOK: Invoice paid', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    // Redact sensitive data in logs
    customerEmail: invoice.customer_email ? '[REDACTED]' : undefined,
  });

  // TODO: Implement actual invoice processing logic
  // For now, just log the event
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  console.info('WEBHOOK: Subscription updated', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
  });

  // TODO: Implement actual subscription update logic
  // For now, just log the event
}

/**
 * Check if event was already processed (idempotency)
 */
async function checkIdempotency(eventId: string): Promise<boolean> {
  try {
    // Try database first
    const supabase = createClient();
    const { data: existingEvent } = await supabase
      .from('processed_events')
      .select('id')
      .eq('event_id', eventId)
      .single();

    if (existingEvent) {
      return true;
    }
  } catch (error) {
    // Fallback to in-memory set if DB not available
    console.warn('WEBHOOK: Database idempotency check failed, using in-memory fallback', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // In-memory fallback
  return processedEvents.has(eventId);
}

/**
 * Mark event as processed
 */
async function markAsProcessed(eventId: string, eventType: string): Promise<void> {
  try {
    // Try database first
    const supabase = createClient();
    await supabase
      .from('processed_events')
      .insert({
        event_id: eventId,
        event_type: eventType,
        metadata: { processed_at: new Date().toISOString() },
      });
  } catch (error) {
    // Fallback to in-memory set if DB not available
    console.warn('WEBHOOK: Database idempotency insert failed, using in-memory fallback', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    processedEvents.add(eventId);
  }
}
