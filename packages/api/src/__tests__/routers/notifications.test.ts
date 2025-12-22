/**
 * Tests for Notifications Router
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { notificationsRouter } from '../../routers/notifications';
import { getUserOrgRole } from '../../rbac';

// Mock the RBAC functions
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

const uuid = (suffix: number) =>
  `00000000-0000-4000-8000-${suffix.toString(16).padStart(12, '0')}`;

describe('Notifications Router', () => {
  const mockUser = { id: uuid(1), email: 'user@example.com' };
  const mockOrgId = uuid(2);
  const mockNotificationId = uuid(3);
  const missingNotificationId = uuid(999);

  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TEMPLATE_OFFLINE = '1';

    mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
                })),
                single: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
              order: vi.fn(() => ({
                range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
              })),
              single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
            order: vi.fn(() => ({
              range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
            })),
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        })),
      })),
    };
  });

  const makeCaller = () =>
    notificationsRouter.createCaller({
      user: mockUser,
      supabase: mockSupabase,
      orgId: mockOrgId,
    });

  describe('list', () => {
    it('should list notifications for an organization', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      const mockNotifications = [
        {
          id: mockNotificationId,
          org_id: mockOrgId,
          user_id: mockUser.id,
          type: 'info',
          title: 'Test Notification',
          message: 'This is a test',
          read: false,
          metadata: {},
          created_at: new Date().toISOString(),
        },
      ];

      mockNotificationsStore.list.mockReturnValue({
        notifications: mockNotifications,
        total: 1,
      });

      const caller = makeCaller();

      const result = await caller.list({ orgId: mockOrgId, limit: 50, offset: 0 });

      expect(result.notifications).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
      expect(mockNotificationsStore.list).toHaveBeenCalledWith(mockOrgId, mockUser.id, {
        read: undefined,
        limit: 50,
        offset: 0,
      });
    });

    it('should filter notifications by read status', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      mockNotificationsStore.list.mockReturnValue({
        notifications: [],
        total: 0,
      });

      const caller = makeCaller();

      await caller.list({ orgId: mockOrgId, read: false, limit: 50, offset: 0 });

      expect(mockNotificationsStore.list).toHaveBeenCalledWith(mockOrgId, mockUser.id, {
        read: false,
        limit: 50,
        offset: 0,
      });
    });

    it('should handle pagination correctly', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      mockNotificationsStore.list.mockReturnValue({
        notifications: new Array(20).fill(null).map((_, i) => ({
          id: uuid(100 + i),
          org_id: mockOrgId,
          user_id: mockUser.id,
          type: 'info',
          title: `Notification ${i}`,
          message: 'Test',
          read: false,
          metadata: {},
          created_at: new Date().toISOString(),
        })),
        total: 100,
      });

      const caller = makeCaller();

      const result = await caller.list({ orgId: mockOrgId, limit: 20, offset: 0 });

      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(100);
    });

    it('should deny access to non-members', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue(null);

      const caller = makeCaller();

      await expect(
        caller.list({ orgId: mockOrgId, limit: 50, offset: 0 })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      mockNotificationsStore.markAsRead.mockReturnValue(true);

      const caller = makeCaller();

      const result = await caller.markAsRead({ notificationId: mockNotificationId });

      expect(result.success).toBe(true);
      expect(mockNotificationsStore.markAsRead).toHaveBeenCalledWith(mockNotificationId, mockUser.id);
    });

    it('should throw error if notification not found', async () => {
      mockNotificationsStore.markAsRead.mockReturnValue(false);

      const caller = makeCaller();

      await expect(
        caller.markAsRead({ notificationId: missingNotificationId })
      ).rejects.toThrow('Notification not found or access denied');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      mockNotificationsStore.markAllAsRead.mockReturnValue(5);

      const caller = makeCaller();

      const result = await caller.markAllAsRead({ orgId: mockOrgId });

      expect(result.success).toBe(true);
      expect(result.count).toBe(5);
      expect(mockNotificationsStore.markAllAsRead).toHaveBeenCalledWith(mockOrgId, mockUser.id);
    });

    it('should deny access to non-members', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue(null);

      const caller = makeCaller();

      await expect(
        caller.markAllAsRead({ orgId: mockOrgId })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      mockNotificationsStore.delete.mockReturnValue(true);

      const caller = makeCaller();

      const result = await caller.delete({ notificationId: mockNotificationId });

      expect(result.success).toBe(true);
      expect(mockNotificationsStore.delete).toHaveBeenCalledWith(mockNotificationId, mockUser.id);
    });

    it('should throw error if notification not found', async () => {
      mockNotificationsStore.delete.mockReturnValue(false);

      const caller = makeCaller();

      await expect(
        caller.delete({ notificationId: missingNotificationId })
      ).rejects.toThrow('Notification not found or access denied');
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      mockNotificationsStore.getUnreadCount.mockReturnValue(10);

      const caller = makeCaller();

      const result = await caller.getUnreadCount({ orgId: mockOrgId });

      expect(result.count).toBe(10);
      expect(mockNotificationsStore.getUnreadCount).toHaveBeenCalledWith(mockOrgId, mockUser.id);
    });

    it('should deny access to non-members', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue(null);

      const caller = makeCaller();

      await expect(
        caller.getUnreadCount({ orgId: mockOrgId })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('subscribe', () => {
    it('should return subscription configuration', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      const caller = makeCaller();

      const result = await caller.subscribe({ orgId: mockOrgId });

      expect(result.channel).toBe(`notifications:${mockOrgId}:${mockUser.id}`);
      expect(result.event).toBe('INSERT');
      expect(result.table).toBe('notifications');
    });

    it('should deny access to non-members', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue(null);

      const caller = makeCaller();

      await expect(
        caller.subscribe({ orgId: mockOrgId })
      ).rejects.toThrow(TRPCError);
    });
  });
});
