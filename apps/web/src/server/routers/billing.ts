import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/api/root';
import { 
  GetSubscriptionInput,
  CreateCheckoutInput,
  OpenPortalInput,
  SimulateEventInput,
  ListInvoicesInput,
  CheckoutResponse,
  PortalResponse,
  SubscriptionResponse,
  InvoiceResponse,
  BillingAnalyticsEvent,
  BillingAnalyticsPayload
} from '@/types/billing';
import { BILLING_PLANS, getPlanById } from '@/config/plans';
import { billingStore } from '../mocks/billing.store';
import { createClient } from '@/utils/supabase/server';
import { emitAutomationEvent } from '@/utils/automation/event-emitter';

const isOfflineMode = process.env.TEMPLATE_OFFLINE === '1' || 
  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  !process.env.STRIPE_SECRET_KEY ||
  process.env.BILLING_OFFLINE === '1';

export const billingRouter = createTRPCRouter({
  /**
   * Get all available plans with entitlements
   */
  getPlans: protectedProcedure
    .query(async () => {
      return {
        plans: BILLING_PLANS,
        offline: isOfflineMode,
      };
    }),

  /**
   * Get organization's current subscription
   */
  getSubscription: protectedProcedure
    .input(GetSubscriptionInput)
    .query(async ({ input, ctx }) => {
      try {
        if (isOfflineMode) {
          const subscription = await billingStore.getSubscription(input.orgId);
          const customer = await billingStore.getCustomer(input.orgId);
          
          return {
            subscription,
            customer,
            offline: true,
          } as SubscriptionResponse;
        }

        const supabase = createClient();
        
        // Get subscription
        const { data: subscription, error: subError } = await supabase
          .from('org_subscriptions')
          .select('*')
          .eq('org_id', input.orgId)
          .single();

        if (subError && subError.code !== 'PGRST116') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch subscription',
          });
        }

        // Get customer
        const { data: customer, error: custError } = await supabase
          .from('billing_customers')
          .select('*')
          .eq('org_id', input.orgId)
          .single();

        if (custError && custError.code !== 'PGRST116') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch customer',
          });
        }

        return {
          subscription,
          customer,
          offline: false,
        } as SubscriptionResponse;
      } catch (error) {
        console.error('Error fetching subscription:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch subscription',
        });
      }
    }),

  /**
   * Create Stripe checkout session
   */
  createCheckout: protectedProcedure
    .input(CreateCheckoutInput)
    .mutation(async ({ input, ctx }) => {
      try {
        const plan = getPlanById(input.plan);
        if (!plan) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid plan specified',
          });
        }

        if (isOfflineMode) {
          const { sessionId, url } = await billingStore.createCheckoutSession(
            input.orgId,
            input.plan,
            input.successUrl,
            input.cancelUrl
          );

          // Emit analytics event
          await emitAnalyticsEvent(ctx.user.id, 'billing.checkout_started', {
            org_id: input.orgId,
            plan: input.plan,
            metadata: { offline: true },
          });

          return {
            sessionId,
            url,
            offline: true,
          } as CheckoutResponse;
        }

        // Real Stripe implementation would go here
        // For now, return mock response
        const { sessionId, url } = await billingStore.createCheckoutSession(
          input.orgId,
          input.plan,
          input.successUrl,
          input.cancelUrl
        );

        // Emit analytics event
        await emitAnalyticsEvent(ctx.user.id, 'billing.checkout_started', {
          org_id: input.orgId,
          plan: input.plan,
        });

        return {
          sessionId,
          url,
          offline: false,
        } as CheckoutResponse;
      } catch (error) {
        console.error('Error creating checkout:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create checkout session',
        });
      }
    }),

  /**
   * Open Stripe customer portal
   */
  openPortal: protectedProcedure
    .input(OpenPortalInput)
    .mutation(async ({ input, ctx }) => {
      try {
        if (isOfflineMode) {
          const { url } = await billingStore.createPortalSession(
            input.orgId,
            input.returnUrl
          );

          return {
            url,
            offline: true,
          } as PortalResponse;
        }

        // Real Stripe implementation would go here
        // For now, return mock response
        const { url } = await billingStore.createPortalSession(
          input.orgId,
          input.returnUrl
        );

        return {
          url,
          offline: false,
        } as PortalResponse;
      } catch (error) {
        console.error('Error opening portal:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to open customer portal',
        });
      }
    }),

  /**
   * Simulate webhook events (offline mode only)
   */
  simulateEvent: protectedProcedure
    .input(SimulateEventInput)
    .mutation(async ({ input, ctx }) => {
      if (!isOfflineMode) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Event simulation is only available in offline mode',
        });
      }

      try {
        await billingStore.simulateEvent(input.type, input.orgId);

        // Emit analytics event
        await emitAnalyticsEvent(ctx.user.id, `billing.${input.type}` as BillingAnalyticsEvent, {
          org_id: input.orgId,
          event_type: input.type,
          metadata: { simulated: true },
        });

        return {
          success: true,
          message: `Simulated ${input.type} event`,
        };
      } catch (error) {
        console.error('Error simulating event:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to simulate event',
        });
      }
    }),

  /**
   * Get usage statistics for an organization
   */
  getUsageStats: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid('Invalid organization ID'),
    }))
    .query(async ({ input, ctx }) => {
      try {
        if (isOfflineMode) {
          // Return mock usage stats
          return {
            organizations: { current: 1, limit: 1, exceeded: false },
            members: { current: 2, limit: 3, exceeded: false },
            records: { current: 15, limit: 100, exceeded: false },
            reminders: { current: 5, limit: 50, exceeded: false },
            offline: true,
          };
        }

        const supabase = createClient();
        
        // Get current plan
        const { data: subscription } = await supabase
          .from('org_subscriptions')
          .select('plan')
          .eq('org_id', input.orgId)
          .single();

        const plan = getPlanById(subscription?.plan || 'free');
        const entitlements = plan?.entitlements || {};

        // TODO: Implement actual usage counting
        // For now, return mock data
        return {
          organizations: { 
            current: 1, 
            limit: entitlements.max_organizations || 1, 
            exceeded: false 
          },
          members: { 
            current: 2, 
            limit: entitlements.max_members_per_org || 3, 
            exceeded: false 
          },
          records: { 
            current: 15, 
            limit: entitlements.max_records || 100, 
            exceeded: false 
          },
          reminders: { 
            current: 5, 
            limit: entitlements.max_reminders || 50, 
            exceeded: false 
          },
          offline: false,
        };
      } catch (error) {
        console.error('Error fetching usage stats:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch usage statistics',
        });
      }
    }),

  /**
   * Get organization's invoices
   */
  listInvoices: protectedProcedure
    .input(ListInvoicesInput)
    .query(async ({ input, ctx }) => {
      try {
        if (isOfflineMode) {
          const invoices = await billingStore.getInvoices(input.orgId, input.limit);
          
          return {
            invoices,
            has_more: false,
            offline: true,
          } as InvoiceResponse;
        }

        const supabase = createClient();
        
        // Get customer mapping
        const { data: customer } = await supabase
          .from('billing_customers')
          .select('stripe_customer_id')
          .eq('org_id', input.orgId)
          .single();

        if (!customer?.stripe_customer_id) {
          return {
            invoices: [],
            has_more: false,
            offline: false,
          } as InvoiceResponse;
        }

        // Fetch invoices from Stripe
        const stripeInvoices = await stripe.invoices.list({
          customer: customer.stripe_customer_id,
          limit: input.limit,
        });

        const invoices = stripeInvoices.data.map(invoice => ({
          id: `inv_${invoice.id}`,
          org_id: input.orgId,
          stripe_invoice_id: invoice.id,
          amount: invoice.amount_paid || invoice.amount_due,
          currency: invoice.currency,
          status: invoice.status as 'draft' | 'open' | 'paid' | 'void' | 'uncollectible',
          hosted_invoice_url: invoice.hosted_invoice_url || undefined,
          invoice_pdf: invoice.invoice_pdf || undefined,
          created_at: new Date(invoice.created * 1000).toISOString(),
          paid_at: invoice.status_transitions?.paid_at 
            ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
            : undefined,
          period_start: new Date(invoice.period_start * 1000).toISOString(),
          period_end: new Date(invoice.period_end * 1000).toISOString(),
        }));

        return {
          invoices,
          has_more: stripeInvoices.has_more,
          offline: false,
        } as InvoiceResponse;
      } catch (error) {
        console.error('Error fetching invoices:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch invoices',
        });
      }
    }),
});

/**
 * Emit analytics event with proper typing
 */
async function emitAnalyticsEvent(
  userId: string,
  event: BillingAnalyticsEvent,
  payload: BillingAnalyticsPayload
): Promise<void> {
  try {
    // Log the event for debugging
    console.log('Billing Analytics Event:', { 
      userId, 
      event, 
      payload,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Implement actual analytics emission
    // In a real implementation, this would call PostHog or similar:
    // await posthog.capture({
    //   distinctId: userId,
    //   event,
    //   properties: payload,
    // });
    
  } catch (error) {
    console.error('Error emitting analytics event:', error);
    // Don't throw - analytics failures shouldn't break the main flow
  }
}
