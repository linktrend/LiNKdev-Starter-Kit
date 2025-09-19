import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../api/root';
import { enqueueEvent, processPendingEvents, getPendingEvents } from '../automation/outbox';
// import { emitAnalyticsEvent } from '@/utils/analytics/posthog';

export const automationRouter = createTRPCRouter({
  /**
   * Enqueue an automation event for delivery
   */
  enqueue: protectedProcedure
    .input(z.object({
      event: z.string().min(1, 'Event name is required'),
      payload: z.record(z.any()),
      orgId: z.string().uuid('Invalid organization ID'),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const eventId = await enqueueEvent(input.orgId, input.event, input.payload);
        
        // Emit analytics event (commented out for template)
        // await emitAnalyticsEvent(ctx.user.id, 'automation.event_enqueued', {
        //   org_id: input.orgId,
        //   event: input.event,
        //   event_id: eventId,
        // });
        
        return {
          success: true,
          eventId,
          message: 'Event enqueued for delivery',
        };
      } catch (error) {
        console.error('AUTOMATION: Failed to enqueue event', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to enqueue event',
        });
      }
    }),

  /**
   * Run a delivery tick to process pending events
   */
  runDeliveryTick: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const startTime = Date.now();
        const result = await processPendingEvents();
        const duration = Date.now() - startTime;
        
        // Emit analytics event (commented out for template)
        // await emitAnalyticsEvent(ctx.user.id, 'automation.delivery_tick', {
        //   processed: result.processed,
        //   successful: result.successful,
        //   failed: result.failed,
        //   duration_ms: duration,
        // });
        
        return {
          success: true,
          ...result,
          duration,
          message: `Processed ${result.processed} events (${result.successful} successful, ${result.failed} failed)`,
        };
      } catch (error) {
        console.error('AUTOMATION: Delivery tick failed', error);
        
        // Emit failure analytics (commented out for template)
        // await emitAnalyticsEvent(ctx.user.id, 'automation.delivery_tick_failed', {
        //   error: error instanceof Error ? error.message : 'Unknown error',
        // });
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Delivery tick failed',
        });
      }
    }),

  /**
   * List pending events for an organization
   */
  listPending: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid('Invalid organization ID').optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const events = await getPendingEvents(input.limit);
        
        // Filter by organization if specified
        const filteredEvents = input.orgId 
          ? events.filter(event => event.org_id === input.orgId)
          : events;
        
        return {
          events: filteredEvents,
          count: filteredEvents.length,
        };
      } catch (error) {
        console.error('AUTOMATION: Failed to list pending events', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list pending events',
        });
      }
    }),

  /**
   * Get delivery statistics
   */
  getStats: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid('Invalid organization ID').optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const supabase = ctx.supabase;
        
        // Get total events count
        let query = supabase
          .from('notifications_outbox')
          .select('*', { count: 'exact', head: true });
        
        if (input.orgId) {
          query = query.eq('org_id', input.orgId);
        }
        
        const { count: totalEvents } = await query;
        
        // Get delivered events count
        let deliveredQuery = supabase
          .from('notifications_outbox')
          .select('*', { count: 'exact', head: true })
          .not('delivered_at', 'is', null);
        
        if (input.orgId) {
          deliveredQuery = deliveredQuery.eq('org_id', input.orgId);
        }
        
        const { count: deliveredEvents } = await deliveredQuery;
        
        // Get pending events count
        let pendingQuery = supabase
          .from('notifications_outbox')
          .select('*', { count: 'exact', head: true })
          .is('delivered_at', null)
          .lte('attempt_count', 8);
        
        if (input.orgId) {
          pendingQuery = pendingQuery.eq('org_id', input.orgId);
        }
        
        const { count: pendingEvents } = await pendingQuery;
        
        // Get failed events count (max attempts reached)
        let failedQuery = supabase
          .from('notifications_outbox')
          .select('*', { count: 'exact', head: true })
          .is('delivered_at', null)
          .gt('attempt_count', 8);
        
        if (input.orgId) {
          failedQuery = failedQuery.eq('org_id', input.orgId);
        }
        
        const { count: failedEvents } = await failedQuery;
        
        return {
          total: totalEvents || 0,
          delivered: deliveredEvents || 0,
          pending: pendingEvents || 0,
          failed: failedEvents || 0,
          deliveryRate: totalEvents ? ((deliveredEvents || 0) / totalEvents) * 100 : 0,
        };
      } catch (error) {
        console.error('AUTOMATION: Failed to get stats', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get delivery statistics',
        });
      }
    }),
});
