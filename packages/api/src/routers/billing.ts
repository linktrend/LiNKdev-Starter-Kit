import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { requireMember, requireAdmin } from '../middleware/accessGuard';
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
} from '@starter/types';
import { createAuditMiddleware } from '../middleware/audit';

// Note: These utility functions and stores will need to be provided by the consuming application
declare const BILLING_PLANS: any;
declare const getPlanById: (id: string) => any;
declare const billingStore: any;
declare const emitAnalyticsEvent: (userId: string, event: BillingAnalyticsEvent, payload: BillingAnalyticsPayload) => Promise<void>;

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
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(GetSubscriptionInput)
    .query(async ({ input, ctx }) => {
      try {
        if (isOfflineMode) {
          const subscription = await billingStore.getSubscription(input.orgId as string);
          const customer = await billingStore.getCustomer(input.orgId as string);
          
          return {
            subscription,
            customer,
            offline: true,
          } as SubscriptionResponse;
        }

        // Supabase implementation
        const { data: subscription, error: subError } = await ctx.supabase
          .from('org_subscriptions')
          .select('*')
          .eq('org_id', input.orgId as string)
          .single();

        if (subError && subError.code !== 'PGRST116') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch subscription',
          });
        }

        // Get customer
        const { data: customer, error: custError } = await ctx.supabase
          .from('billing_customers')
          .select('*')
          .eq('org_id', input.orgId as string)
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
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(CreateCheckoutInput)
    .use(createAuditMiddleware({
      action: 'started',
      entityType: 'subscription',
      entityIdFromResult: (result) => result.sessionId,
      orgIdField: 'orgId',
      captureMetadata: (input) => ({ plan: input.plan }),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const plan = getPlanById(input.plan as string);
        if (!plan) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid plan specified',
          });
        }

        if (isOfflineMode) {
          const { sessionId, url } = await billingStore.createCheckoutSession(
            input.orgId as string,
            input.plan as string,
            input.successUrl as string,
            input.cancelUrl as string
          );

          // Emit analytics event
          await emitAnalyticsEvent(ctx.user.id, 'billing.checkout_started', {
            org_id: input.orgId as string,
            plan: input.plan as string,
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
          input.orgId as string,
          input.plan as string,
          input.successUrl as string,
          input.cancelUrl as string
        );

        // Emit analytics event
        await emitAnalyticsEvent(ctx.user.id, 'billing.checkout_started', {
          org_id: input.orgId as string,
          plan: input.plan as string,
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
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(OpenPortalInput)
    .mutation(async ({ input }) => {
      try {
        if (isOfflineMode) {
          const { url } = await billingStore.createPortalSession(
            input.orgId as string,
            input.returnUrl as string
          );

          return {
            url,
            offline: true,
          } as PortalResponse;
        }

        // Real Stripe implementation would go here
        // For now, return mock response
        const { url } = await billingStore.createPortalSession(
          input.orgId as string,
          input.returnUrl as string
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
    .use(requireAdmin({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(SimulateEventInput)
    .use(createAuditMiddleware({
      action: 'updated',
      entityType: 'subscription',
      entityIdField: 'orgId',
      orgIdField: 'orgId',
      captureMetadata: (input) => ({ event_type: input.type, simulated: true }),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!isOfflineMode) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Event simulation is only available in offline mode',
        });
      }

      try {
        await billingStore.simulateEvent(input.type as string, input.orgId as string);

        // Emit analytics event
        await emitAnalyticsEvent(ctx.user.id, `billing.${input.type as string}` as BillingAnalyticsEvent, {
          org_id: input.orgId as string,
          metadata: { simulated: true, event_type: input.type as string },
        });

        return {
          success: true,
          message: `Simulated ${input.type as string} event`,
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
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
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

        // Get current plan
        const { data: subscription } = await ctx.supabase
          .from('org_subscriptions')
          .select('plan_name')
          .eq('org_id', input.orgId)
          .single();

        const plan = getPlanById(subscription?.plan_name || 'free');
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
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(ListInvoicesInput)
    .query(async ({ input, ctx }) => {
      try {
        if (isOfflineMode) {
          const invoices = await billingStore.getInvoices(input.orgId as string, input.limit);
          
          return {
            invoices,
            has_more: false,
            offline: true,
          } as InvoiceResponse;
        }

        // Get customer mapping
        const { data: customer } = await ctx.supabase
          .from('billing_customers')
          .select('stripe_customer_id')
          .eq('org_id', input.orgId as string)
          .single();

        if (!customer?.stripe_customer_id) {
          return {
            invoices: [],
            has_more: false,
            offline: false,
          } as InvoiceResponse;
        }

        // Note: Stripe integration would go here
        // For now, return empty invoices
        return {
          invoices: [],
          has_more: false,
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
