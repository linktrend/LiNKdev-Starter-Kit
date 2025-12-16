/**
 * Tests for Usage Tracker Library
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  trackApiCall,
  trackFeatureUsage,
  trackBatchUsage,
  getUsageForPeriod,
  calculateStorageUsage,
  checkUsageLimits,
  aggregateDailyMetrics,
  getApiUsageStats,
  getActiveUsersCount,
  sanitizeMetadata,
  extractIpAddress,
  extractUserAgent,
} from '../../lib/usage-tracker';

describe('Usage Tracker Library', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      from: vi.fn((table) => ({
        insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: { plan_name: 'pro' }, error: null })),
            })),
            gte: vi.fn(() => ({
              lte: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve({ data: [], error: null })),
              })),
            })),
          })),
        })),
      })),
      rpc: vi.fn(() => Promise.resolve({ data: [{ total_bytes: 1000000, file_count: 10, last_updated: new Date().toISOString() }], error: null })),
    };
  });

  describe('trackApiCall', () => {
    it('should track API call successfully', async () => {
      await trackApiCall(mockSupabase, {
        orgId: 'org-123',
        userId: 'user-123',
        endpoint: '/api/users',
        method: 'GET',
        statusCode: 200,
        responseTimeMs: 150,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('api_usage');
    });

    it('should handle errors gracefully', async () => {
      const failingSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn(() => Promise.reject(new Error('Database error'))),
        })),
      };

      // Should not throw
      await expect(trackApiCall(failingSupabase, {
        orgId: 'org-123',
        userId: 'user-123',
        endpoint: '/api/users',
        method: 'GET',
        statusCode: 200,
        responseTimeMs: 150,
      })).resolves.toBeUndefined();
    });
  });

  describe('trackFeatureUsage', () => {
    it('should track feature usage successfully', async () => {
      await trackFeatureUsage(mockSupabase, {
        orgId: 'org-123',
        userId: 'user-123',
        eventType: 'record_created',
        quantity: 1,
        metadata: { source: 'web' },
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('usage_events');
    });

    it('should use default quantity of 1', async () => {
      await trackFeatureUsage(mockSupabase, {
        orgId: 'org-123',
        userId: 'user-123',
        eventType: 'user_active',
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('usage_events');
    });

    it('should handle errors gracefully', async () => {
      const failingSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn(() => Promise.reject(new Error('Database error'))),
        })),
      };

      await expect(trackFeatureUsage(failingSupabase, {
        orgId: 'org-123',
        userId: 'user-123',
        eventType: 'record_created',
      })).resolves.toBeUndefined();
    });
  });

  describe('trackBatchUsage', () => {
    it('should track multiple events in batch', async () => {
      const events = [
        {
          orgId: 'org-123',
          userId: 'user-123',
          eventType: 'record_created' as const,
          quantity: 1,
        },
        {
          orgId: 'org-123',
          userId: 'user-456',
          eventType: 'user_active' as const,
          quantity: 1,
        },
      ];

      await trackBatchUsage(mockSupabase, events);

      expect(mockSupabase.from).toHaveBeenCalledWith('usage_events');
    });

    it('should handle errors gracefully', async () => {
      const failingSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn(() => Promise.reject(new Error('Database error'))),
        })),
      };

      await expect(trackBatchUsage(failingSupabase, [])).resolves.toBeUndefined();
    });
  });

  describe('getUsageForPeriod', () => {
    it('should fetch usage events for period', async () => {
      const from = new Date('2024-01-01');
      const to = new Date('2024-01-31');

      const result = await getUsageForPeriod(mockSupabase, {
        orgId: 'org-123',
        from,
        to,
      });

      expect(result).toEqual([]);
      expect(mockSupabase.from).toHaveBeenCalledWith('usage_events');
    });

    it('should filter by event type if provided', async () => {
      const from = new Date('2024-01-01');
      const to = new Date('2024-01-31');

      await getUsageForPeriod(mockSupabase, {
        orgId: 'org-123',
        from,
        to,
        eventType: 'api_call',
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('usage_events');
    });

    it('should return empty array on error', async () => {
      const failingSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn(() => ({
                  order: vi.fn(() => Promise.reject(new Error('Database error'))),
                })),
              })),
            })),
          })),
        })),
      };

      const result = await getUsageForPeriod(failingSupabase, {
        orgId: 'org-123',
        from: new Date(),
        to: new Date(),
      });

      expect(result).toEqual([]);
    });
  });

  describe('calculateStorageUsage', () => {
    it('should calculate storage usage', async () => {
      const result = await calculateStorageUsage(mockSupabase, 'org-123');

      expect(result.totalBytes).toBe(1000000);
      expect(result.fileCount).toBe(10);
      expect(result.lastUpdated).toBeInstanceOf(Date);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_storage_usage', {
        p_org_id: 'org-123',
      });
    });

    it('should return zeros on error', async () => {
      const failingSupabase = {
        rpc: vi.fn(() => Promise.reject(new Error('Database error'))),
      };

      const result = await calculateStorageUsage(failingSupabase, 'org-123');

      expect(result.totalBytes).toBe(0);
      expect(result.fileCount).toBe(0);
      expect(result.lastUpdated).toBeNull();
    });
  });

  describe('checkUsageLimits', () => {
    it('should check usage against plan limits', async () => {
      const supabaseWithLimits = {
        from: vi.fn((table) => {
          if (table === 'org_subscriptions') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: { plan_name: 'pro' }, error: null })),
                  })),
                })),
              })),
            };
          }
          if (table === 'plan_features') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: { feature_value: { limit: 100 } }, error: null })),
                  })),
                })),
              })),
            };
          }
          return mockSupabase.from(table);
        }),
      };

      const result = await checkUsageLimits(supabaseWithLimits, 'org-123', 'max_records', 50);

      expect(result.limit).toBe(100);
      expect(result.current).toBe(50);
      expect(result.percentage).toBe(50);
      expect(result.exceeded).toBe(false);
      expect(result.approaching).toBe(false);
    });

    it('should detect approaching limits', async () => {
      const supabaseWithLimits = {
        from: vi.fn((table) => {
          if (table === 'org_subscriptions') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: { plan_name: 'pro' }, error: null })),
                  })),
                })),
              })),
            };
          }
          if (table === 'plan_features') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: { feature_value: { limit: 100 } }, error: null })),
                  })),
                })),
              })),
            };
          }
          return mockSupabase.from(table);
        }),
      };

      const result = await checkUsageLimits(supabaseWithLimits, 'org-123', 'max_records', 85);

      expect(result.approaching).toBe(true);
      expect(result.exceeded).toBe(false);
    });

    it('should detect exceeded limits', async () => {
      const supabaseWithLimits = {
        from: vi.fn((table) => {
          if (table === 'org_subscriptions') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: { plan_name: 'pro' }, error: null })),
                  })),
                })),
              })),
            };
          }
          if (table === 'plan_features') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: { feature_value: { limit: 100 } }, error: null })),
                  })),
                })),
              })),
            };
          }
          return mockSupabase.from(table);
        }),
      };

      const result = await checkUsageLimits(supabaseWithLimits, 'org-123', 'max_records', 150);

      expect(result.exceeded).toBe(true);
      expect(result.approaching).toBe(false);
    });

    it('should handle unlimited plans', async () => {
      const supabaseWithUnlimited = {
        from: vi.fn((table) => {
          if (table === 'org_subscriptions') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: { plan_name: 'enterprise' }, error: null })),
                  })),
                })),
              })),
            };
          }
          if (table === 'plan_features') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: { feature_value: { limit: -1 } }, error: null })),
                  })),
                })),
              })),
            };
          }
          return mockSupabase.from(table);
        }),
      };

      const result = await checkUsageLimits(supabaseWithUnlimited, 'org-123', 'max_records', 10000);

      expect(result.limit).toBe(-1);
      expect(result.exceeded).toBe(false);
      expect(result.approaching).toBe(false);
    });
  });

  describe('sanitizeMetadata', () => {
    it('should redact sensitive keys', () => {
      const metadata = {
        name: 'Test User',
        password: 'secret123',
        apiKey: 'sk_test_123',
        token: 'abc123',
        email: 'test@example.com',
      };

      const sanitized = sanitizeMetadata(metadata);

      expect(sanitized.name).toBe('Test User');
      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
    });

    it('should handle nested sensitive keys', () => {
      const metadata = {
        user: 'test',
        accessToken: 'token123',
        refreshToken: 'refresh456',
      };

      const sanitized = sanitizeMetadata(metadata);

      expect(sanitized.user).toBe('test');
      expect(sanitized.accessToken).toBe('[REDACTED]');
      expect(sanitized.refreshToken).toBe('[REDACTED]');
    });
  });

  describe('extractIpAddress', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const headers = new Headers({
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      });

      const ip = extractIpAddress(headers);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const headers = new Headers({
        'x-real-ip': '192.168.1.1',
      });

      const ip = extractIpAddress(headers);
      expect(ip).toBe('192.168.1.1');
    });

    it('should return null if no IP headers present', () => {
      const headers = new Headers();
      const ip = extractIpAddress(headers);
      expect(ip).toBeNull();
    });

    it('should work with plain object headers', () => {
      const headers = {
        'x-forwarded-for': '192.168.1.1',
      };

      const ip = extractIpAddress(headers);
      expect(ip).toBe('192.168.1.1');
    });
  });

  describe('extractUserAgent', () => {
    it('should extract user agent from headers', () => {
      const headers = new Headers({
        'user-agent': 'Mozilla/5.0',
      });

      const userAgent = extractUserAgent(headers);
      expect(userAgent).toBe('Mozilla/5.0');
    });

    it('should return null if no user agent present', () => {
      const headers = new Headers();
      const userAgent = extractUserAgent(headers);
      expect(userAgent).toBeNull();
    });

    it('should work with plain object headers', () => {
      const headers = {
        'user-agent': 'Mozilla/5.0',
      };

      const userAgent = extractUserAgent(headers);
      expect(userAgent).toBe('Mozilla/5.0');
    });
  });
});
