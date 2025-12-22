import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { requireMember } from '../middleware/accessGuard';
import type {
  Notification,
  NotificationList,
  UnreadCountResponse,
  NotificationSubscription,
} from '@starter/types';

// Mock store for offline mode
declare const notificationsStore: {
  list: (orgId: string, userId: string, filters: any) => { notifications: Notification[]; total: number };
  markAsRead: (notificationId: string, userId: string) => boolean;
  markAllAsRead: (orgId: string, userId: string) => number;
  delete: (notificationId: string, userId: string) => boolean;
  getUnreadCount: (orgId: string, userId: string) => number;
};

const isOfflineMode = () =>
  process.env.TEMPLATE_OFFLINE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

export const notificationsRouter = createTRPCRouter({
  /**
   * List notifications for an organization with optional filters
   * @param orgId - Organization ID
   * @param read - Filter by read status (optional)
   * @param limit - Maximum number of results (default 50, max 100)
   * @param offset - Pagination offset (default 0)
   * @returns Paginated list of notifications with total count
   * @throws {TRPCError} FORBIDDEN if user is not a member of the organization
   * @permission Requires member role or higher
   * @example
   * await trpc.notifications.list.query({ orgId: '...', read: false, limit: 20 })
   */
  list: protectedProcedure
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(
      z.object({
        orgId: z.string().uuid('Invalid organization ID'),
        read: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }): Promise<NotificationList> => {
      if (isOfflineMode()) {
        const result = notificationsStore.list(input.orgId, ctx.user.id, {
          read: input.read,
          limit: input.limit,
          offset: input.offset,
        });
        
        return {
          notifications: result.notifications,
          total: result.total,
          hasMore: result.total > input.offset + input.limit,
        };
      }

      // Build query
      let query = ctx.supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('org_id', input.orgId)
        .eq('user_id', ctx.user.id)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      // Apply read filter if specified
      if (input.read !== undefined) {
        query = query.eq('read', input.read);
      }

      const { data: notifications, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notifications',
        });
      }

      return {
        notifications: notifications || [],
        total: count || 0,
        hasMore: (count || 0) > input.offset + input.limit,
      };
    }),

  /**
   * Mark a single notification as read
   * @param notificationId - UUID of the notification
   * @returns Success status
   * @throws {TRPCError} FORBIDDEN if user doesn't own the notification
   * @throws {TRPCError} NOT_FOUND if notification doesn't exist
   * @permission User must own the notification
   * @example
   * await trpc.notifications.markAsRead.mutate({ notificationId: '...' })
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        notificationId: z.string().uuid('Invalid notification ID'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode()) {
        const success = notificationsStore.markAsRead(input.notificationId, ctx.user.id);
        
        if (!success) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Notification not found or access denied',
          });
        }

        return { success: true };
      }

      // Update notification (RLS will ensure user owns it)
      const { error } = await ctx.supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', input.notificationId)
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark notification as read',
        });
      }

      return { success: true };
    }),

  /**
   * Mark all notifications as read for a user in an organization
   * @param orgId - Organization ID
   * @returns Success status with count of updated notifications
   * @throws {TRPCError} FORBIDDEN if user is not a member of the organization
   * @permission Requires member role or higher
   * @example
   * await trpc.notifications.markAllAsRead.mutate({ orgId: '...' })
   */
  markAllAsRead: protectedProcedure
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(
      z.object({
        orgId: z.string().uuid('Invalid organization ID'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode()) {
        const count = notificationsStore.markAllAsRead(input.orgId, ctx.user.id);
        return { success: true, count };
      }

      // Update all unread notifications for user in org
      const { error, count } = await ctx.supabase
        .from('notifications')
        .update({ read: true })
        .eq('org_id', input.orgId)
        .eq('user_id', ctx.user.id)
        .eq('read', false);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark all notifications as read',
        });
      }

      return { success: true, count: count || 0 };
    }),

  /**
   * Delete a notification
   * @param notificationId - UUID of the notification
   * @returns Success status
   * @throws {TRPCError} FORBIDDEN if user doesn't own the notification
   * @throws {TRPCError} NOT_FOUND if notification doesn't exist
   * @permission User must own the notification
   * @example
   * await trpc.notifications.delete.mutate({ notificationId: '...' })
   */
  delete: protectedProcedure
    .input(
      z.object({
        notificationId: z.string().uuid('Invalid notification ID'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode()) {
        const success = notificationsStore.delete(input.notificationId, ctx.user.id);
        
        if (!success) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Notification not found or access denied',
          });
        }

        return { success: true };
      }

      // Delete notification (RLS will ensure user owns it)
      const { error } = await ctx.supabase
        .from('notifications')
        .delete()
        .eq('id', input.notificationId)
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete notification',
        });
      }

      return { success: true };
    }),

  /**
   * Get count of unread notifications for a user in an organization
   * @param orgId - Organization ID
   * @returns Count of unread notifications
   * @throws {TRPCError} FORBIDDEN if user is not a member of the organization
   * @permission Requires member role or higher
   * @example
   * const { count } = await trpc.notifications.getUnreadCount.query({ orgId: '...' })
   */
  getUnreadCount: protectedProcedure
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(
      z.object({
        orgId: z.string().uuid('Invalid organization ID'),
      })
    )
    .query(async ({ ctx, input }): Promise<UnreadCountResponse> => {
      if (isOfflineMode()) {
        const count = notificationsStore.getUnreadCount(input.orgId, ctx.user.id);
        return { count };
      }

      // Count unread notifications
      const { count, error } = await ctx.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', input.orgId)
        .eq('user_id', ctx.user.id)
        .eq('read', false);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get unread count',
        });
      }

      return { count: count || 0 };
    }),

  /**
   * Get subscription configuration for real-time notifications
   * @param orgId - Organization ID
   * @returns Real-time subscription metadata (channel, event, table)
   * @throws {TRPCError} FORBIDDEN if user is not a member of the organization
   * @permission Requires member role or higher
   * @example
   * const config = await trpc.notifications.subscribe.query({ orgId: '...' })
   * // Use config to set up real-time subscription in client
   */
  subscribe: protectedProcedure
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(
      z.object({
        orgId: z.string().uuid('Invalid organization ID'),
      })
    )
    .query(async ({ ctx, input }): Promise<NotificationSubscription> => {
      // Return subscription configuration for real-time updates
      // Client will use this to subscribe to Supabase realtime
      return {
        channel: `notifications:${input.orgId}:${ctx.user.id}`,
        event: 'INSERT',
        table: 'notifications',
      };
    }),
});
