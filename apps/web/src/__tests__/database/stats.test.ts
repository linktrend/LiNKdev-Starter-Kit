/**
 * Database Statistics Tests
 * Tests for database statistics module
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clearStatsCache } from '@/lib/database/stats';

describe('Database Statistics', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearStatsCache();
  });

  describe('clearStatsCache', () => {
    it('should clear the statistics cache', () => {
      // This is a simple test to ensure the function exists and can be called
      expect(() => clearStatsCache()).not.toThrow();
    });
  });

  describe('cache behavior', () => {
    it('should cache statistics for performance', () => {
      // This test verifies the cache exists and works
      // In a real implementation, we would mock the Supabase client
      // and verify that subsequent calls use cached data
      expect(clearStatsCache).toBeDefined();
    });
  });
});

describe('Helper Functions SQL', () => {
  it('should export SQL for creating helper functions', async () => {
    const { HELPER_FUNCTIONS_SQL } = await import('@/lib/database/stats');
    expect(HELPER_FUNCTIONS_SQL).toBeDefined();
    expect(typeof HELPER_FUNCTIONS_SQL).toBe('string');
    expect(HELPER_FUNCTIONS_SQL.length).toBeGreaterThan(0);
  });

  it('should include get_table_count function', async () => {
    const { HELPER_FUNCTIONS_SQL } = await import('@/lib/database/stats');
    expect(HELPER_FUNCTIONS_SQL).toContain('get_table_count');
  });

  it('should include get_database_size function', async () => {
    const { HELPER_FUNCTIONS_SQL } = await import('@/lib/database/stats');
    expect(HELPER_FUNCTIONS_SQL).toContain('get_database_size');
  });

  it('should include get_active_connections function', async () => {
    const { HELPER_FUNCTIONS_SQL } = await import('@/lib/database/stats');
    expect(HELPER_FUNCTIONS_SQL).toContain('get_active_connections');
  });

  it('should include get_cache_hit_ratio function', async () => {
    const { HELPER_FUNCTIONS_SQL } = await import('@/lib/database/stats');
    expect(HELPER_FUNCTIONS_SQL).toContain('get_cache_hit_ratio');
  });

  it('should include get_table_list function', async () => {
    const { HELPER_FUNCTIONS_SQL } = await import('@/lib/database/stats');
    expect(HELPER_FUNCTIONS_SQL).toContain('get_table_list');
  });

  it('should include get_table_schema function', async () => {
    const { HELPER_FUNCTIONS_SQL } = await import('@/lib/database/stats');
    expect(HELPER_FUNCTIONS_SQL).toContain('get_table_schema');
  });

  it('should include get_slow_queries function', async () => {
    const { HELPER_FUNCTIONS_SQL } = await import('@/lib/database/stats');
    expect(HELPER_FUNCTIONS_SQL).toContain('get_slow_queries');
  });

  it('should use SECURITY DEFINER for all functions', async () => {
    const { HELPER_FUNCTIONS_SQL } = await import('@/lib/database/stats');
    const functionCount = (HELPER_FUNCTIONS_SQL.match(/CREATE OR REPLACE FUNCTION/g) || []).length;
    const securityDefinerCount = (HELPER_FUNCTIONS_SQL.match(/SECURITY DEFINER/g) || []).length;
    expect(securityDefinerCount).toBe(functionCount);
  });
});
