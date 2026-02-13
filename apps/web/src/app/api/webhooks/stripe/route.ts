import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { Database } from '@/types/database.types';
import { sendPaymentReceiptEmail, sendPaymentFailedEmail } from '@/utils/communication/email-dispatcher';
import { format } from 'date-fns';

// Use service role for webhooks (bypasses RLS)
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    console.error('[Webhook] No stripe-signature header');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  // Check if event was already processed (idempotency)
  const { data: existingEvent } = await supabaseAdmin
    .from('processed_events')
    .select('id')
    .eq('event_id', event.id)
    .maybeSingle();

  if (existingEvent) {
    console.log('[Webhook] Event already processed:', event.id);
    return NextResponse.json({ received: true, idempotent: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await supabaseAdmin.from('processed_events').insert({
      event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString(),
      metadata: { processed: true },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing event:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orgId = session.metadata?.org_id;

  if (!orgId) {
    console.error('[Webhook] No org_id in checkout session metadata');
    return;
  }

  console.log(`[Webhook] Checkout completed for org: ${orgId}`);
  // Subscription will be handled by subscription.created event
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const orgId = subscription.metadata?.org_id;

  if (!orgId) {
    console.error('[Webhook] No org_id in subscription metadata');
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const planName = getPlanNameFromPriceId(priceId);
  const billingInterval =
    subscription.items.data[0]?.price.recurring?.interval === 'year'
      ? 'annual'
      : 'monthly';

  console.log(
    `[Webhook] Updating subscription for org ${orgId}: plan=${planName}, status=${subscription.status}`
  );

  // Upsert subscription (idempotent)
  const { error } = await supabaseAdmin.from('org_subscriptions').upsert(
    {
      org_id: orgId,
      stripe_subscription_id: subscription.id,
      stripe_sub_id: subscription.id, // Keep legacy field in sync
      plan_name: planName,
      status: subscription.status,
      billing_interval: billingInterval,
      seats: subscription.items.data[0]?.quantity || 1,
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
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
    },
    {
      onConflict: 'org_id',
    }
  );

  if (error) {
    console.error('[Webhook] Error upserting subscription:', error);
    throw error;
  }

  // Also ensure billing customer record exists
  const customerId = subscription.customer as string;
  await supabaseAdmin.from('billing_customers').upsert(
    {
      org_id: orgId,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'org_id',
    }
  );

  console.log(`[Webhook] Subscription updated successfully for org: ${orgId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const orgId = subscription.metadata?.org_id;

  if (!orgId) {
    console.error('[Webhook] No org_id in subscription metadata');
    return;
  }

  console.log(`[Webhook] Subscription deleted for org: ${orgId}`);

  const { error } = await supabaseAdmin
    .from('org_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('[Webhook] Error updating canceled subscription:', error);
    throw error;
  }

  console.log(`[Webhook] Subscription canceled successfully for org: ${orgId}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Invoice paid: ${invoice.id}`);

  // Get org_id from subscription metadata
  let orgId: string | undefined;
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    orgId = subscription.metadata?.org_id;
  }

  if (!orgId) {
    console.warn('[Webhook] No org_id found for invoice, skipping storage');
    return;
  }

  // Store invoice in database
  const { error: invoiceError } = await supabaseAdmin.from('billing_invoices').upsert(
    {
      org_id: orgId,
      stripe_invoice_id: invoice.id,
      stripe_customer_id: invoice.customer as string,
      amount_paid: invoice.amount_paid,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status || 'paid',
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      period_start: new Date(invoice.period_start * 1000).toISOString(),
      period_end: new Date(invoice.period_end * 1000).toISOString(),
      paid_at: invoice.status_transitions?.paid_at 
        ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
        : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'stripe_invoice_id',
    }
  );

  if (invoiceError) {
    console.error('[Webhook] Error storing invoice:', invoiceError);
  } else {
    console.log(`[Webhook] Invoice stored successfully: ${invoice.id}`);
  }

  // Send receipt email
  if (invoice.customer_email) {
    try {
      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('name')
        .eq('id', orgId)
        .single();

      const emailData = {
        orgName: org?.name || 'Customer',
        amount: `$${(invoice.amount_paid / 100).toFixed(2)}`,
        currency: invoice.currency,
        paidAt: format(new Date(invoice.status_transitions?.paid_at ? invoice.status_transitions.paid_at * 1000 : Date.now()), 'MMMM d, yyyy'),
        invoiceUrl: invoice.hosted_invoice_url || undefined,
        invoicePdf: invoice.invoice_pdf || undefined,
        periodStart: format(new Date(invoice.period_start * 1000), 'MMM d, yyyy'),
        periodEnd: format(new Date(invoice.period_end * 1000), 'MMM d, yyyy'),
      };

      await sendPaymentReceiptEmail(invoice.customer_email, emailData);
      console.log(`[Webhook] Receipt email sent to: ${invoice.customer_email}`);
    } catch (emailError) {
      console.warn(`[Webhook] Failed to send receipt email:`, emailError);
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Invoice payment failed: ${invoice.id}`);

  // Update subscription status to past_due
  if (invoice.subscription) {
    const { error } = await supabaseAdmin
      .from('org_subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription as string);

    if (error) {
      console.error('[Webhook] Error updating past_due status:', error);
    }
  }

  // Send failure notification email
  if (invoice.customer_email) {
    try {
      const subscription = invoice.subscription 
        ? await stripe.subscriptions.retrieve(invoice.subscription as string)
        : null;
      
      const orgId = subscription?.metadata?.org_id;
      let orgName = 'Customer';

      if (orgId) {
        const { data: org } = await supabaseAdmin
          .from('organizations')
          .select('name')
          .eq('id', orgId)
          .single();
        orgName = org?.name || orgName;
      }

      const emailData = {
        orgName,
        amount: `$${(invoice.amount_due / 100).toFixed(2)}`,
        currency: invoice.currency,
        reason: invoice.last_finalization_error?.message,
        billingUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/billing`,
      };

      await sendPaymentFailedEmail(invoice.customer_email, emailData);
      console.log(`[Webhook] Payment failure email sent to: ${invoice.customer_email}`);
    } catch (emailError) {
      console.warn(`[Webhook] Failed to send payment failure email:`, emailError);
    }
  }
}

function getPlanNameFromPriceId(priceId: string): 'free' | 'pro' | 'business' {
  const priceMap: Record<string, 'free' | 'pro' | 'business'> = {
    [process.env.STRIPE_PRICE_FREE || 'price_free']: 'free',
    [process.env.STRIPE_PRICE_PRO_MONTHLY || '']: 'pro',
    [process.env.STRIPE_PRICE_PRO_ANNUAL || '']: 'pro',
    [process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '']: 'business',
    [process.env.STRIPE_PRICE_BUSINESS_ANNUAL || '']: 'business',
  };

  return priceMap[priceId] || 'free';
}
