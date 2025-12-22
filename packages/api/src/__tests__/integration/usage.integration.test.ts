/**
 * Integration Tests for Usage Router
 * 
 * Tests usage tracking, metrics, and limits checking.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createTestCaller } from './helpers/test-context';
import {
  createTestUser,
  createTestUsageEvent,
  createTestApiUsage,
  generateUUID,
  dateHelpers,
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
const mockUsageStore = {
  getApiUsage: vi.fn(),
  getFeatureUsage: vi.fn(),
  getActiveUsers: vi.fn(),
  getStorageUsage: vi.fn(),
  getUsageLimits: vi.fn(),
  recordEvent: vi.fn(),
};

global.usageStore = mockUsageStore as any;

describe('Usage Router Integration Tests', () => {
  let testUser: any;
  let testOrgId: string;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TEMPLATE_OFFLINE = '1';
    
    testUser = createTestUser();
    testOrgId = generateUUID();
    
    vi.mocked(getUserOrgRole).mockResolvedValue('member');
  });

  describe('getApiUsage', () => {
    it('should get API usage metrics', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const usage = {
        endpoints: [
          {
            endpoint: '/api/users',
            method: 'GET',
            call_count: 100,
            avg_response_time: 50,
            error_count: 2,
            error_rate: 2,
          },
        ],
        total_calls: 100,
        avg_response_time: 50,
        error_rate: 2,
        period: {
          from: dateHelpers.daysAgo(30).toISOString(),
          to: dateHelpers.now().toISOString(),
        },
      };

      mockUsageStore.getApiUsage.mockResolvedValue(usage);

      const result = await caller.usage.getApiUsage({
        orgId: testOrgId,
      });

      expect(result.endpoints).toHaveLength(1);
      expect(result.total_calls).toBe(100);
      expect(result.avg_response_time).toBe(50);
    });

    it('should filter by endpoint', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const usage = {
        endpoints: [
          {
            endpoint: '/api/users',
            method: 'GET',
            call_count: 50,
            avg_response_time: 40,
            error_count: 1,
            error_rate: 2,
          },
        ],
        total_calls: 50,
        avg_response_time: 40,
        error_rate: 2,
        period: {
          from: dateHelpers.daysAgo(30).toISOString(),
          to: dateHelpers.now().toISOString(),
        },
      };

      mockUsageStore.getApiUsage.mockResolvedValue(usage);

      const result = await caller.usage.getApiUsage({
        orgId: testOrgId,
        endpoint: '/api/users',
      });

      expect(result.endpoints.every(e => e.endpoint === '/api/users')).toBe(true);
    });

    it('should filter by method', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const usage = {
        endpoints: [
          {
            endpoint: '/api/users',
            method: 'POST',
            call_count: 25,
            avg_response_time: 60,
            error_count: 0,
            error_rate: 0,
          },
        ],
        total_calls: 25,
        avg_response_time: 60,
        error_rate: 0,
        period: {
          from: dateHelpers.daysAgo(30).toISOString(),
          to: dateHelpers.now().toISOString(),
        },
      };

      mockUsageStore.getApiUsage.mockResolvedValue(usage);

      const result = await caller.usage.getApiUsage({
        orgId: testOrgId,
        method: 'POST',
      });

      expect(result.endpoints.every(e => e.method === 'POST')).toBe(true);
    });

    it('should support date range filtering', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const from = dateHelpers.daysAgo(7);
      const to = dateHelpers.now();

      mockUsageStore.getApiUsage.mockResolvedValue({
        endpoints: [],
        total_calls: 0,
        avg_response_time: 0,
        error_rate: 0,
        period: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
      });

      const result = await caller.usage.getApiUsage({
        orgId: testOrgId,
        from: from.toISOString(),
        to: to.toISOString(),
      });

      expect(result.period.from).toBe(from.toISOString());
      expect(result.period.to).toBe(to.toISOString());
    });
  });

  describe('getFeatureUsage', () => {
    it('should get feature usage metrics', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const usage = {
        features: [
          {
            event_type: 'record_created',
            usage_count: 50,
            unique_users: 10,
            last_used: dateHelpers.now().toISOString(),
          },
          {
            event_type: 'automation_run',
            usage_count: 30,
            unique_users: 5,
            last_used: dateHelpers.hoursAgo(2).toISOString(),
          },
        ],
        total_events: 80,
        active_users: 10,
        period: {
          from: dateHelpers.daysAgo(30).toISOString(),
          to: dateHelpers.now().toISOString(),
        },
      };

      mockUsageStore.getFeatureUsage.mockResolvedValue(usage);

      const result = await caller.usage.getFeatureUsage({
        orgId: testOrgId,
      });

      expect(result.features).toHaveLength(2);
      expect(result.total_events).toBe(80);
      expect(result.active_users).toBe(10);
    });

    it('should filter by event type', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const usage = {
        features: [
          {
            event_type: 'record_created',
            usage_count: 50,
            unique_users: 10,
            last_used: dateHelpers.now().toISOString(),
          },
        ],
        total_events: 50,
        active_users: 10,
        period: {
          from: dateHelpers.daysAgo(30).toISOString(),
          to: dateHelpers.now().toISOString(),
        },
      };

      mockUsageStore.getFeatureUsage.mockResolvedValue(usage);

      const result = await caller.usage.getFeatureUsage({
        orgId: testOrgId,
        eventType: 'record_created',
      });

      expect(result.features.every(f => f.event_type === 'record_created')).toBe(true);
    });
  });

  describe('getActiveUsers', () => {
    it('should get daily active users', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const usage = {
        active_users: 25,
        period_type: 'day',
        period_start: dateHelpers.daysAgo(1).toISOString(),
        period_end: dateHelpers.now().toISOString(),
      };

      mockUsageStore.getActiveUsers.mockResolvedValue(usage);

      const result = await caller.usage.getActiveUsers({
        orgId: testOrgId,
        period: 'day',
      });

      expect(result.active_users).toBe(25);
      expect(result.period_type).toBe('day');
    });

    it('should get weekly active users', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const usage = {
        active_users: 100,
        period_type: 'week',
        period_start: dateHelpers.daysAgo(7).toISOString(),
        period_end: dateHelpers.now().toISOString(),
      };

      mockUsageStore.getActiveUsers.mockResolvedValue(usage);

      const result = await caller.usage.getActiveUsers({
        orgId: testOrgId,
        period: 'week',
      });

      expect(result.active_users).toBe(100);
      expect(result.period_type).toBe('week');
    });

    it('should get monthly active users', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const usage = {
        active_users: 250,
        period_type: 'month',
        period_start: dateHelpers.daysAgo(30).toISOString(),
        period_end: dateHelpers.now().toISOString(),
      };

      mockUsageStore.getActiveUsers.mockResolvedValue(usage);

      const result = await caller.usage.getActiveUsers({
        orgId: testOrgId,
        period: 'month',
      });

      expect(result.active_users).toBe(250);
      expect(result.period_type).toBe('month');
    });

    it('should support daily breakdown', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const usage = {
        active_users: 100,
        period_type: 'day',
        period_start: dateHelpers.daysAgo(7).toISOString(),
        period_end: dateHelpers.now().toISOString(),
        daily_breakdown: [
          { date: dateHelpers.daysAgo(6).toISOString().split('T')[0], count: 15 },
          { date: dateHelpers.daysAgo(5).toISOString().split('T')[0], count: 18 },
          { date: dateHelpers.daysAgo(4).toISOString().split('T')[0], count: 12 },
        ],
      };

      mockUsageStore.getActiveUsers.mockResolvedValue(usage);

      const result = await caller.usage.getActiveUsers({
        orgId: testOrgId,
        period: 'day',
        from: dateHelpers.daysAgo(7).toISOString(),
        to: dateHelpers.now().toISOString(),
      });

      expect(result.daily_breakdown).toBeDefined();
      expect(result.daily_breakdown?.length).toBeGreaterThan(0);
    });
  });

  describe('getStorageUsage', () => {
    it('should get storage usage', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const usage = {
        total_bytes: 1073741824, // 1 GB
        total_gb: 1.0,
        file_count: 150,
        last_updated: dateHelpers.now().toISOString(),
      };

      mockUsageStore.getStorageUsage.mockResolvedValue(usage);

      const result = await caller.usage.getStorageUsage({
        orgId: testOrgId,
      });

      expect(result.total_bytes).toBe(1073741824);
      expect(result.total_gb).toBe(1.0);
      expect(result.file_count).toBe(150);
    });

    it('should handle zero storage', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const usage = {
        total_bytes: 0,
        total_gb: 0,
        file_count: 0,
        last_updated: null,
      };

      mockUsageStore.getStorageUsage.mockResolvedValue(usage);

      const result = await caller.usage.getStorageUsage({
        orgId: testOrgId,
      });

      expect(result.total_bytes).toBe(0);
      expect(result.file_count).toBe(0);
    });
  });

  describe('getUsageLimits', () => {
    it('should get usage limits and current usage', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const limits = {
        plan_name: 'pro',
        limits: {
          max_records: 10000,
          max_api_calls_per_month: 100000,
          max_storage_gb: 50,
          max_mau: 1000,
        },
        current_usage: {
          records: 5000,
          api_calls: 50000,
          storage_gb: 25,
          mau: 500,
        },
        usage_percentage: {
          records: 50,
          api_calls: 50,
          storage_gb: 50,
          mau: 50,
        },
        approaching_limits: [],
        exceeded_limits: [],
      };

      mockUsageStore.getUsageLimits.mockResolvedValue(limits);

      const result = await caller.usage.getUsageLimits({
        orgId: testOrgId,
      });

      expect(result.plan_name).toBe('pro');
      expect(result.limits.max_records).toBe(10000);
      expect(result.current_usage.records).toBe(5000);
      expect(result.usage_percentage.records).toBe(50);
    });

    it('should identify approaching limits', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const limits = {
        plan_name: 'pro',
        limits: {
          max_records: 10000,
        },
        current_usage: {
          records: 8500, // 85%
        },
        usage_percentage: {
          records: 85,
        },
        approaching_limits: ['records'],
        exceeded_limits: [],
      };

      mockUsageStore.getUsageLimits.mockResolvedValue(limits);

      const result = await caller.usage.getUsageLimits({
        orgId: testOrgId,
      });

      expect(result.approaching_limits).toContain('records');
    });

    it('should identify exceeded limits', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const limits = {
        plan_name: 'starter',
        limits: {
          max_records: 1000,
        },
        current_usage: {
          records: 1100, // 110%
        },
        usage_percentage: {
          records: 110,
        },
        approaching_limits: [],
        exceeded_limits: ['records'],
      };

      mockUsageStore.getUsageLimits.mockResolvedValue(limits);

      const result = await caller.usage.getUsageLimits({
        orgId: testOrgId,
      });

      expect(result.exceeded_limits).toContain('records');
    });
  });

  describe('recordEvent', () => {
    it('should record usage event', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockUsageStore.recordEvent.mockResolvedValue(undefined);

      const result = await caller.usage.recordEvent({
        orgId: testOrgId,
        eventType: 'record_created',
        quantity: 1,
      });

      expect(result.success).toBe(true);
      expect(mockUsageStore.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          orgId: testOrgId,
          userId: testUser.id,
          eventType: 'record_created',
          quantity: 1,
        })
      );
    });

    it('should record event with metadata', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const metadata = { source: 'api', version: '1.0' };

      mockUsageStore.recordEvent.mockResolvedValue(undefined);

      const result = await caller.usage.recordEvent({
        orgId: testOrgId,
        eventType: 'automation_run',
        quantity: 1,
        metadata,
      });

      expect(result.success).toBe(true);
    });

    it('should default quantity to 1', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockUsageStore.recordEvent.mockResolvedValue(undefined);

      await caller.usage.recordEvent({
        orgId: testOrgId,
      eventType: 'api_call',
      });

      expect(mockUsageStore.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
        quantity: 1,
        })
      );
    });
  });

  describe('Integration: Usage lifecycle', () => {
    it('should record event → get feature usage → verify event counted', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // Record event
      mockUsageStore.recordEvent.mockResolvedValue(undefined);
      await caller.usage.recordEvent({
        orgId: testOrgId,
        eventType: 'record_created',
        quantity: 1,
      });

      // Get feature usage
      mockUsageStore.getFeatureUsage.mockResolvedValue({
        features: [
          {
            event_type: 'record_created',
            usage_count: 1,
            unique_users: 1,
            last_used: dateHelpers.now().toISOString(),
          },
        ],
        total_events: 1,
        active_users: 1,
        period: {
          from: dateHelpers.daysAgo(30).toISOString(),
          to: dateHelpers.now().toISOString(),
        },
      });

      const usage = await caller.usage.getFeatureUsage({
        orgId: testOrgId,
      });

      expect(usage.features[0].usage_count).toBe(1);
      expect(usage.features[0].event_type).toBe('record_created');
    });

    it('should track usage → check limits → verify approaching threshold', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // Get initial limits
      mockUsageStore.getUsageLimits.mockResolvedValue({
        plan_name: 'pro',
        limits: { max_records: 10000 },
        current_usage: { records: 7000 },
        usage_percentage: { records: 70 },
        approaching_limits: [],
        exceeded_limits: [],
      });

      let limits = await caller.usage.getUsageLimits({
        orgId: testOrgId,
      });
      expect(limits.approaching_limits).toHaveLength(0);

      // Record more events
      for (let i = 0; i < 1500; i++) {
        mockUsageStore.recordEvent.mockResolvedValue(undefined);
        await caller.usage.recordEvent({
          orgId: testOrgId,
          eventType: 'record_created',
        });
      }

      // Check limits again
      mockUsageStore.getUsageLimits.mockResolvedValue({
        plan_name: 'pro',
        limits: { max_records: 10000 },
        current_usage: { records: 8500 },
        usage_percentage: { records: 85 },
        approaching_limits: ['records'],
        exceeded_limits: [],
      });

      limits = await caller.usage.getUsageLimits({
        orgId: testOrgId,
      });
      expect(limits.approaching_limits).toContain('records');
    });
  });

  describe('Permission checks', () => {
    it('should require authentication', async () => {
      const { caller } = createTestCaller({ user: null as any });

      await expect(
        caller.usage.getApiUsage({
          orgId: testOrgId,
        })
      ).rejects.toThrow('You must be logged in');
    });

    it('should deny access to non-members', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue(null);
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.usage.getApiUsage({
          orgId: testOrgId,
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should allow any member to view usage', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('viewer');
      const { caller } = createTestCaller({ user: testUser });

      mockUsageStore.getApiUsage.mockResolvedValue({
        endpoints: [],
        total_calls: 0,
        avg_response_time: 0,
        error_rate: 0,
        period: {
          from: dateHelpers.daysAgo(30).toISOString(),
          to: dateHelpers.now().toISOString(),
        },
      });

      const result = await caller.usage.getApiUsage({
        orgId: testOrgId,
      });

      expect(result).toBeDefined();
    });
  });

  describe('Input validation', () => {
    it('should validate orgId format', async () => {
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.usage.getApiUsage({
          orgId: 'invalid-uuid',
        })
      ).rejects.toThrow();
    });

    it('should validate period values', async () => {
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.usage.getActiveUsers({
          orgId: testOrgId,
          period: 'invalid' as any,
        })
      ).rejects.toThrow();
    });

    it('should validate date ranges', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockUsageStore.getApiUsage.mockResolvedValue({
        endpoints: [],
        total_calls: 0,
        avg_response_time: 0,
        error_rate: 0,
        period: {
          from: dateHelpers.daysAgo(7).toISOString(),
          to: dateHelpers.now().toISOString(),
        },
      });

      const result = await caller.usage.getApiUsage({
        orgId: testOrgId,
        from: dateHelpers.daysAgo(7).toISOString(),
        to: dateHelpers.now().toISOString(),
      });

      expect(result).toBeDefined();
    });
  });
});
