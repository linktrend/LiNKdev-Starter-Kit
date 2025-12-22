import type { Tables } from './db';

/**
 * Notification type enum for categorizing notifications
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Notification status for filtering
 */
export type NotificationStatus = 'read' | 'unread' | 'all';

/**
 * In-app notification record from `public.notifications`
 */
export type Notification = Tables<'notifications'>;

/**
 * Input for creating a new notification
 */
export interface CreateNotificationInput {
  orgId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Filters for querying notifications
 */
export interface NotificationFilters {
  orgId: string;
  read?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
}

/**
 * Paginated list of notifications
 */
export interface NotificationList {
  notifications: Notification[];
  total: number;
  hasMore: boolean;
}

/**
 * Unread notification count response
 */
export interface UnreadCountResponse {
  count: number;
}

/**
 * Real-time subscription configuration
 */
export interface NotificationSubscription {
  channel: string;
  event: string;
  table: string;
}

/**
 * Mark notification as read input
 */
export interface MarkAsReadInput {
  notificationId: string;
}

/**
 * Mark all as read input
 */
export interface MarkAllAsReadInput {
  orgId: string;
}

/**
 * Delete notification input
 */
export interface DeleteNotificationInput {
  notificationId: string;
}
