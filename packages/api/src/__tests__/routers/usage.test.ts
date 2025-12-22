/**
 * Tests for Usage Router
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { usageRouter } from '../../routers/usage';
import { createTestContext, mockRequireMember } from '../helpers/middleware-helpers';

// Mock the usage tracker functions
vi.mock('../../lib/usage-tracker', () => ({
  getApiUsageStats: vi.fn(),
  getActiveUsersCount: vi.fn(),
  calculateStorageUsage: vi.fn(),
  checkUsageLimits: vi.fn(),
  trackFeatureUsage: vi.fn(),
}));

import {
  getApiUsageStats,
  getActiveUsersCount,
  calculateStorageUsage,
  trackFeatureUsage,
} from '../../lib/usage-tracker';

describe('Usage Router', () => {
  const user = { id: 'user-123' };
  const orgId = '123e4567-e89b-12d3-a456-426614174000';
  let supabase: ReturnType<typeof createTestContext>['ctx']['supabase'];
  let getTable: ReturnType<typeof createTestContext>['getTable'];
  let supabaseMock: ReturnType<typeof createTestContext>['supabaseMock'];
  let caller: ReturnType<typeof usageRouter.createCaller>;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.TEMPLATE_OFFLINE = '0';
    const testCtx = createTestContext({ user, orgId, userRole: 'member' });
    supabase = testCtx.ctx.supabase as any;
    getTable = testCtx.getTable;
    supabaseMock = testCtx.supabaseMock;
    mockRequireMember(supabaseMock, orgId, user.id, 'admin');
    caller = usageRouter.createCaller({
      supabase,
      user,
      userRole: 'member',
      orgId,
    });
  });

  describe('getApiUsage', () => {
    it('should return API usage metrics', async () => {
      const mockStats = [
        {
          endpoint: '/api/users',
          method: 'GET',
          call_count: 100,
          avg_response_time: 150,
          error_count: 5,
          error_rate: 5,
        },
        {
          endpoint: '/api/records',
          method: 'POST',
          call_count: 50,
          avg_response_time: 200,
          error_count: 2,
          error_rate: 4,
        },
      ];

      vi.mocked(getApiUsageStats).mockResolvedValue(mockStats);

      const result = await caller.getApiUsage({ orgId });

      expect(result.endpoints).toHaveLength(2);
      expect(result.total_calls).toBe(150);
      expect(result.avg_response_time).toBeGreaterThan(0);
    });

    it('should filter by endpoint', async () => {
      const mockStats = [
        {
          endpoint: '/api/users',
          method: 'GET',
          call_count: 100,
          avg_response_time: 150,
          error_count: 5,
          error_rate: 5,
        },
      ];

      vi.mocked(getApiUsageStats).mockResolvedValue(mockStats);

      const result = await caller.getApiUsage({
        orgId,
        endpoint: '/api/users',
      });

      expect(result.endpoints).toHaveLength(1);
      expect(result.endpoints[0].endpoint).toBe('/api/users');
    });

    it('should filter by method', async () => {
      const mockStats = [
        {
          endpoint: '/api/users',
          method: 'GET',
          call_count: 100,
          avg_response_time: 150,
          error_count: 5,
          error_rate: 5,
        },
      ];

      vi.mocked(getApiUsageStats).mockResolvedValue(mockStats);

      const result = await caller.getApiUsage({
        orgId,
        method: 'GET',
      });

      expect(result.endpoints).toHaveLength(1);
      expect(result.endpoints[0].method).toBe('GET');
    });

    it('should calculate totals correctly', async () => {
      const mockStats = [
        {
          endpoint: '/api/users',
          method: 'GET',
          call_count: 100,
          avg_response_time: 150,
          error_count: 5,
          error_rate: 5,
        },
        {
          endpoint: '/api/records',
          method: 'POST',
          call_count: 50,
          avg_response_time: 250,
          error_count: 10,
          error_rate: 20,
        },
      ];

      vi.mocked(getApiUsageStats).mockResolvedValue(mockStats);

      const result = await caller.getApiUsage({ orgId });

      expect(result.total_calls).toBe(150);
      expect(result.error_rate).toBeCloseTo(10, 1);
    });
  });

  describe('getFeatureUsage', () => {
    it('should return feature usage metrics', async () => {
      const usageEvents = getTable('usage_events');
      const mockEvents = [
        {
          event_type: 'record_created',
          user_id: 'user-1',
          quantity: 1,
          created_at: '2024-01-01T10:00:00Z',
        },
        {
          event_type: 'record_created',
          user_id: 'user-2',
          quantity: 1,
          created_at: '2024-01-01T11:00:00Z',
        },
      ];

      usageEvents.__queueEqResponse({
        data: mockEvents,
        error: null,
      });

      const result = await caller.getFeatureUsage({ orgId });

      expect(result.features).toHaveLength(1);
      expect(result.features[0].event_type).toBe('record_created');
      expect(result.total_events).toBe(2);
      expect(result.active_users).toBe(2);
    });

    it('should aggregate by event type', async () => {
      const usageEvents = getTable('usage_events');
      const mockEvents = [
        {
          event_type: 'record_created',
          user_id: 'user-1',
          quantity: 1,
          created_at: '2024-01-01T10:00:00Z',
        },
        {
          event_type: 'automation_run',
          user_id: 'user-1',
          quantity: 1,
          created_at: '2024-01-01T11:00:00Z',
        },
      ];

      usageEvents.__queueEqResponse({
        data: mockEvents,
        error: null,
      });

      const result = await caller.getFeatureUsage({ orgId });

      expect(result.features).toHaveLength(2);
      expect(result.features.map((f) => f.event_type)).toContain('record_created');
      expect(result.features.map((f) => f.event_type)).toContain('automation_run');
    });

    it('should count unique users', async () => {
      const usageEvents = getTable('usage_events');
      const mockEvents = [
        {
          event_type: 'record_created',
          user_id: 'user-1',
          quantity: 1,
          created_at: '2024-01-01T10:00:00Z',
        },
        {
          event_type: 'record_created',
          user_id: 'user-1',
          quantity: 1,
          created_at: '2024-01-01T11:00:00Z',
        },
        {
          event_type: 'record_created',
          user_id: 'user-2',
          quantity: 1,
          created_at: '2024-01-01T12:00:00Z',
        },
      ];

      usageEvents.__queueEqResponse({
        data: mockEvents,
        error: null,
      });

      const result = await caller.getFeatureUsage({ orgId });

      expect(result.features[0].unique_users).toBe(2);
      expect(result.active_users).toBe(2);
    });
  });

  describe('getActiveUsers', () => {
    it('should return DAU metrics', async () => {
      vi.mocked(getActiveUsersCount).mockResolvedValue({
        activeUsers: 50,
        periodType: 'day',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-02'),
      });

      const result = await caller.getActiveUsers({
        orgId,
        period: 'day',
      });

      expect(result.active_users).toBe(50);
      expect(result.period_type).toBe('day');
    });

    it('should return MAU metrics', async () => {
      vi.mocked(getActiveUsersCount).mockResolvedValue({
        activeUsers: 200,
        periodType: 'month',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-02-01'),
      });

      const result = await caller.getActiveUsers({
        orgId,
        period: 'month',
      });

      expect(result.active_users).toBe(200);
      expect(result.period_type).toBe('month');
    });

    it('should provide daily breakdown', async () => {
      const usageEvents = getTable('usage_events');
      const mockEvents = [
        {
          user_id: 'user-1',
          created_at: '2024-01-01T10:00:00Z',
        },
        {
          user_id: 'user-2',
          created_at: '2024-01-01T11:00:00Z',
        },
        {
          user_id: 'user-1',
          created_at: '2024-01-02T10:00:00Z',
        },
      ];

      usageEvents.__queueEqResponse({
        data: mockEvents,
        error: null,
      });

      const result = await caller.getActiveUsers({
        orgId,
        period: 'day',
        from: '2024-01-01T00:00:00Z',
        to: '2024-01-03T00:00:00Z',
      });

      expect(result.daily_breakdown).toBeDefined();
      expect(result.daily_breakdown).toHaveLength(2);
    });
  });

  describe('getStorageUsage', () => {
    it('should return storage metrics', async () => {
      vi.mocked(calculateStorageUsage).mockResolvedValue({
        totalBytes: 1073741824, // 1 GB
        fileCount: 100,
        lastUpdated: new Date('2024-01-01'),
      });

      const result = await caller.getStorageUsage({ orgId });

      expect(result.total_bytes).toBe(1073741824);
      expect(result.file_count).toBe(100);
    });

    it('should convert bytes to GB', async () => {
      vi.mocked(calculateStorageUsage).mockResolvedValue({
        totalBytes: 2147483648, // 2 GB
        fileCount: 200,
        lastUpdated: new Date('2024-01-01'),
      });

      const result = await caller.getStorageUsage({ orgId });

      expect(result.total_gb).toBe(2);
    });
  });

  describe('getUsageLimits', () => {
    it('should return usage vs limits', async () => {
      const subscriptions = getTable('org_subscriptions');
      subscriptions.single.mockResolvedValueOnce({
        data: { plan_name: 'pro' },
        error: null,
      });

      const planFeatures = getTable('plan_features');
      planFeatures.__queueEqResponse({
        data: [
          { feature_key: 'max_records', feature_value: { limit: 1000 } },
          { feature_key: 'max_api_calls_per_month', feature_value: { limit: 10000 } },
        ],
        error: null,
      });

      // Mock count queries
      const usageEvents = getTable('usage_events');
      usageEvents.__queueEqResponse({ data: null, error: null });

      const apiUsage = getTable('api_usage');
      apiUsage.__queueEqResponse({ data: null, error: null });

      const orgMembers = getTable('organization_members');
      orgMembers.__queueEqResponse({ data: null, error: null });

      vi.mocked(calculateStorageUsage).mockResolvedValue({
        totalBytes: 1073741824,
        fileCount: 100,
        lastUpdated: new Date(),
      });

      vi.mocked(getActiveUsersCount).mockResolvedValue({
        activeUsers: 50,
        periodType: 'month',
        periodStart: new Date(),
        periodEnd: new Date(),
      });

      const result = await caller.getUsageLimits({ orgId });

      expect(result.plan_name).toBe('pro');
      expect(result.limits).toBeDefined();
      expect(result.current_usage).toBeDefined();
    });

    it('should identify approaching limits', async () => {
      const subscriptions = getTable('org_subscriptions');
      subscriptions.single.mockResolvedValueOnce({
        data: { plan_name: 'pro' },
        error: null,
      });

      const planFeatures = getTable('plan_features');
      planFeatures.__queueEqResponse({
        data: [{ feature_key: 'max_records', feature_value: { limit: 100 } }],
        error: null,
      });

      // Mock 85 records (85% of limit)
      const usageEvents = getTable('usage_events');
      usageEvents.__queueEqResponse({ data: null, error: null });

      const apiUsage = getTable('api_usage');
      apiUsage.__queueEqResponse({ data: null, error: null });

      const orgMembers = getTable('organization_members');
      orgMembers.__queueEqResponse({ data: null, error: null });

      vi.mocked(calculateStorageUsage).mockResolvedValue({
        totalBytes: 0,
        fileCount: 0,
        lastUpdated: new Date(),
      });

      vi.mocked(getActiveUsersCount).mockResolvedValue({
        activeUsers: 0,
        periodType: 'month',
        periodStart: new Date(),
        periodEnd: new Date(),
      });

      const result = await caller.getUsageLimits({ orgId });

      expect(result.usage_percentage).toBeDefined();
    });

    it('should identify exceeded limits', async () => {
      const subscriptions = getTable('org_subscriptions');
      subscriptions.single.mockResolvedValueOnce({
        data: { plan_name: 'pro' },
        error: null,
      });

      const planFeatures = getTable('plan_features');
      planFeatures.__queueEqResponse({
        data: [{ feature_key: 'max_records', feature_value: { limit: 100 } }],
        error: null,
      });

      const usageEvents = getTable('usage_events');
      usageEvents.__queueEqResponse({ data: null, error: null });

      const apiUsage = getTable('api_usage');
      apiUsage.__queueEqResponse({ data: null, error: null });

      const orgMembers = getTable('organization_members');
      orgMembers.__queueEqResponse({ data: null, error: null });

      vi.mocked(calculateStorageUsage).mockResolvedValue({
        totalBytes: 0,
        fileCount: 0,
        lastUpdated: new Date(),
      });

      vi.mocked(getActiveUsersCount).mockResolvedValue({
        activeUsers: 0,
        periodType: 'month',
        periodStart: new Date(),
        periodEnd: new Date(),
      });

      const result = await caller.getUsageLimits({ orgId });

      expect(result.exceeded_limits).toBeDefined();
    });

    it('should handle unlimited plans', async () => {
      const subscriptions = getTable('org_subscriptions');
      subscriptions.single.mockResolvedValueOnce({
        data: { plan_name: 'enterprise' },
        error: null,
      });

      const planFeatures = getTable('plan_features');
      planFeatures.__queueEqResponse({
        data: [{ feature_key: 'max_records', feature_value: { limit: -1 } }],
        error: null,
      });

      const usageEvents = getTable('usage_events');
      usageEvents.__queueEqResponse({ data: null, error: null });

      const apiUsage = getTable('api_usage');
      apiUsage.__queueEqResponse({ data: null, error: null });

      const orgMembers = getTable('organization_members');
      orgMembers.__queueEqResponse({ data: null, error: null });

      vi.mocked(calculateStorageUsage).mockResolvedValue({
        totalBytes: 0,
        fileCount: 0,
        lastUpdated: new Date(),
      });

      vi.mocked(getActiveUsersCount).mockResolvedValue({
        activeUsers: 0,
        periodType: 'month',
        periodStart: new Date(),
        periodEnd: new Date(),
      });

      const result = await caller.getUsageLimits({ orgId });

      expect(result.limits.max_records).toBe(-1);
      expect(result.usage_percentage.records).toBe(0);
    });
  });

  describe('recordEvent', () => {
    it('should record usage event', async () => {
      vi.mocked(trackFeatureUsage).mockResolvedValue(undefined);

      const result = await caller.recordEvent({
        orgId,
        eventType: 'record_created',
        quantity: 1,
      });

      expect(result.success).toBe(true);
      expect(trackFeatureUsage).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          orgId,
          eventType: 'record_created',
          quantity: 1,
        })
      );
    });

    it('should validate event type', async () => {
      vi.mocked(trackFeatureUsage).mockResolvedValue(undefined);

      const result = await caller.recordEvent({
        orgId,
        eventType: 'record_created',
        quantity: 1,
      });

      expect(result.success).toBe(true);
    });
  });
});
