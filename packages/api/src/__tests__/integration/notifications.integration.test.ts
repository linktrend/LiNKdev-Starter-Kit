/**
 * Integration Tests for Notifications Router
 * 
 * Tests notification CRUD operations, pagination, and permission checks.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createTestCaller } from './helpers/test-context';
import {
  createTestUser,
  createTestNotification,
  createTestNotifications,
  generateUUID,
} from './helpers/test-data';
import { getUserOrgRole } from '../../rbac';

// Mock RBAC
vi.mock('../../rbac', () => ({
  getUserOrgRole: vi.fn(),
  roleIsSufficient: vi.fn((required, user) => {
    const hierarchy = { owner: 3, member: 2, viewer: 1 };
    return hierarchy[user as keyof typeof hierarchy] >= hierarchy[required as keyof typeof hierarchy];
  }),
  createRBACError: vi.fn((msg) => new TRPCError({ code: 'FORBIDDEN', message: msg })),
}));

// Mock store
const mockNotificationsStore = {
  list: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  delete: vi.fn(),
  getUnreadCount: vi.fn(),
};

global.notificationsStore = mockNotificationsStore as any;

describe('Notifications Router Integration Tests', () => {
  let testUser: any;
  let testOrgId: string;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TEMPLATE_OFFLINE = '1';
    
    testUser = createTestUser();
    testOrgId = generateUUID();
    
    vi.mocked(getUserOrgRole).mockResolvedValue('member');
  });

  describe('list', () => {
    it('should list notifications for organization', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const notifications = createTestNotifications(3, {
        org_id: testOrgId,
        user_id: testUser.id,
      });

      mockNotificationsStore.list.mockReturnValue({
        notifications,
        total: 3,
      });

      const result = await caller.notifications.list({
        orgId: testOrgId,
        limit: 50,
        offset: 0,
      });

      expect(result.notifications).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.hasMore).toBe(false);
    });

    it('should filter notifications by read status', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const unreadNotifications = createTestNotifications(2, {
        org_id: testOrgId,
        user_id: testUser.id,
        read: false,
      });

      mockNotificationsStore.list.mockReturnValue({
        notifications: unreadNotifications,
        total: 2,
      });

      const result = await caller.notifications.list({
        orgId: testOrgId,
        read: false,
        limit: 50,
        offset: 0,
      });

      expect(result.notifications).toHaveLength(2);
      expect(result.notifications.every(n => !n.read)).toBe(true);
    });

    it('should handle pagination correctly', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const notifications = createTestNotifications(20, {
        org_id: testOrgId,
        user_id: testUser.id,
      });

      mockNotificationsStore.list.mockReturnValue({
        notifications,
        total: 100,
      });

      const result = await caller.notifications.list({
        orgId: testOrgId,
        limit: 20,
        offset: 0,
      });

      expect(result.notifications).toHaveLength(20);
      expect(result.total).toBe(100);
      expect(result.hasMore).toBe(true);
    });

    it('should deny access to non-members', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue(null);
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.notifications.list({
          orgId: testOrgId,
          limit: 50,
          offset: 0,
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should return empty list when no notifications', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockNotificationsStore.list.mockReturnValue({
        notifications: [],
        total: 0,
      });

      const result = await caller.notifications.list({
        orgId: testOrgId,
        limit: 50,
        offset: 0,
      });

      expect(result.notifications).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const notificationId = generateUUID();

      mockNotificationsStore.markAsRead.mockReturnValue(true);

      const result = await caller.notifications.markAsRead({
        notificationId,
      });

      expect(result.success).toBe(true);
      expect(mockNotificationsStore.markAsRead).toHaveBeenCalledWith(
        notificationId,
        testUser.id
      );
    });

    it('should throw error if notification not found', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockNotificationsStore.markAsRead.mockReturnValue(false);

      await expect(
        caller.notifications.markAsRead({
          notificationId: generateUUID(),
        })
      ).rejects.toThrow('Notification not found or access denied');
    });

    it('should prevent marking other user notifications as read', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const otherUserNotificationId = generateUUID();

      mockNotificationsStore.markAsRead.mockReturnValue(false);

      await expect(
        caller.notifications.markAsRead({
          notificationId: otherUserNotificationId,
        })
      ).rejects.toThrow();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockNotificationsStore.markAllAsRead.mockReturnValue(5);

      const result = await caller.notifications.markAllAsRead({
        orgId: testOrgId,
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(5);
      expect(mockNotificationsStore.markAllAsRead).toHaveBeenCalledWith(
        testOrgId,
        testUser.id
      );
    });

    it('should return 0 when no unread notifications', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockNotificationsStore.markAllAsRead.mockReturnValue(0);

      const result = await caller.notifications.markAllAsRead({
        orgId: testOrgId,
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });

    it('should deny access to non-members', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue(null);
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.notifications.markAllAsRead({
          orgId: testOrgId,
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('delete', () => {
    it('should delete notification', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const notificationId = generateUUID();

      mockNotificationsStore.delete.mockReturnValue(true);

      const result = await caller.notifications.delete({
        notificationId,
      });

      expect(result.success).toBe(true);
      expect(mockNotificationsStore.delete).toHaveBeenCalledWith(
        notificationId,
        testUser.id
      );
    });

    it('should throw error if notification not found', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockNotificationsStore.delete.mockReturnValue(false);

      await expect(
        caller.notifications.delete({
          notificationId: generateUUID(),
        })
      ).rejects.toThrow('Notification not found or access denied');
    });

    it('should prevent deleting other user notifications', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockNotificationsStore.delete.mockReturnValue(false);

      await expect(
        caller.notifications.delete({
          notificationId: generateUUID(),
        })
      ).rejects.toThrow();
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockNotificationsStore.getUnreadCount.mockReturnValue(10);

      const result = await caller.notifications.getUnreadCount({
        orgId: testOrgId,
      });

      expect(result.count).toBe(10);
      expect(mockNotificationsStore.getUnreadCount).toHaveBeenCalledWith(
        testOrgId,
        testUser.id
      );
    });

    it('should return 0 when no unread notifications', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockNotificationsStore.getUnreadCount.mockReturnValue(0);

      const result = await caller.notifications.getUnreadCount({
        orgId: testOrgId,
      });

      expect(result.count).toBe(0);
    });

    it('should deny access to non-members', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue(null);
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.notifications.getUnreadCount({
          orgId: testOrgId,
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('subscribe', () => {
    it('should return subscription configuration', async () => {
      const { caller } = createTestCaller({ user: testUser });

      const result = await caller.notifications.subscribe({
        orgId: testOrgId,
      });

      expect(result.channel).toBe(`notifications:${testOrgId}:${testUser.id}`);
      expect(result.event).toBe('INSERT');
      expect(result.table).toBe('notifications');
    });

    it('should deny access to non-members', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue(null);
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.notifications.subscribe({
          orgId: testOrgId,
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('Integration: Notification lifecycle', () => {
    it('should list → mark as read → verify unread count decreases', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const notifications = createTestNotifications(5, {
        org_id: testOrgId,
        user_id: testUser.id,
        read: false,
      });

      // Initial list
      mockNotificationsStore.list.mockReturnValue({
        notifications,
        total: 5,
      });

      const listResult = await caller.notifications.list({
        orgId: testOrgId,
        limit: 50,
        offset: 0,
      });

      expect(listResult.notifications).toHaveLength(5);

      // Get unread count
      mockNotificationsStore.getUnreadCount.mockReturnValue(5);
      const countBefore = await caller.notifications.getUnreadCount({
        orgId: testOrgId,
      });
      expect(countBefore.count).toBe(5);

      // Mark one as read
      mockNotificationsStore.markAsRead.mockReturnValue(true);
      await caller.notifications.markAsRead({
        notificationId: notifications[0].id,
      });

      // Verify count decreased
      mockNotificationsStore.getUnreadCount.mockReturnValue(4);
      const countAfter = await caller.notifications.getUnreadCount({
        orgId: testOrgId,
      });
      expect(countAfter.count).toBe(4);
    });

    it('should list → mark all as read → verify count is 0', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // Initial unread count
      mockNotificationsStore.getUnreadCount.mockReturnValue(10);
      const countBefore = await caller.notifications.getUnreadCount({
        orgId: testOrgId,
      });
      expect(countBefore.count).toBe(10);

      // Mark all as read
      mockNotificationsStore.markAllAsRead.mockReturnValue(10);
      const markResult = await caller.notifications.markAllAsRead({
        orgId: testOrgId,
      });
      expect(markResult.count).toBe(10);

      // Verify count is 0
      mockNotificationsStore.getUnreadCount.mockReturnValue(0);
      const countAfter = await caller.notifications.getUnreadCount({
        orgId: testOrgId,
      });
      expect(countAfter.count).toBe(0);
    });

    it('should list → delete → verify removed from list', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const notifications = createTestNotifications(3, {
        org_id: testOrgId,
        user_id: testUser.id,
      });

      // Initial list
      mockNotificationsStore.list.mockReturnValue({
        notifications,
        total: 3,
      });

      const listBefore = await caller.notifications.list({
        orgId: testOrgId,
        limit: 50,
        offset: 0,
      });
      expect(listBefore.notifications).toHaveLength(3);

      // Delete one
      mockNotificationsStore.delete.mockReturnValue(true);
      await caller.notifications.delete({
        notificationId: notifications[0].id,
      });

      // Verify removed
      mockNotificationsStore.list.mockReturnValue({
        notifications: notifications.slice(1),
        total: 2,
      });

      const listAfter = await caller.notifications.list({
        orgId: testOrgId,
        limit: 50,
        offset: 0,
      });
      expect(listAfter.notifications).toHaveLength(2);
      expect(listAfter.total).toBe(2);
    });
  });

  describe('Permission isolation', () => {
    it('should only show user their own notifications', async () => {
      const user1 = createTestUser({ id: generateUUID() });
      const user2 = createTestUser({ id: generateUUID() });

      const { caller: caller1 } = createTestCaller({ user: user1 });

      const user1Notifications = createTestNotifications(3, {
        org_id: testOrgId,
        user_id: user1.id,
      });

      mockNotificationsStore.list.mockReturnValue({
        notifications: user1Notifications,
        total: 3,
      });

      const result = await caller1.notifications.list({
        orgId: testOrgId,
        limit: 50,
        offset: 0,
      });

      // Verify all notifications belong to user1
      expect(result.notifications.every(n => n.user_id === user1.id)).toBe(true);
    });
  });

  describe('Input validation', () => {
    it('should validate orgId format', async () => {
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.notifications.list({
          orgId: 'invalid-uuid',
          limit: 50,
          offset: 0,
        })
      ).rejects.toThrow();
    });

    it('should validate limit boundaries', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // Too small
      await expect(
        caller.notifications.list({
          orgId: testOrgId,
          limit: 0,
          offset: 0,
        })
      ).rejects.toThrow();

      // Too large
      await expect(
        caller.notifications.list({
          orgId: testOrgId,
          limit: 101,
          offset: 0,
        })
      ).rejects.toThrow();
    });

    it('should validate offset is non-negative', async () => {
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.notifications.list({
          orgId: testOrgId,
          limit: 50,
          offset: -1,
        })
      ).rejects.toThrow();
    });
  });
});
