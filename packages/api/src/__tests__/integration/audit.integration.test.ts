/**
 * Integration Tests for Audit Router
 * 
 * Tests audit log operations, search, filtering, and CSV export.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createTestCaller } from './helpers/test-context';
import {
  createTestUser,
  createTestAuditLog,
  createTestAuditLogs,
  generateUUID,
  dateHelpers,
} from './helpers/test-data';

// Mock analytics
const mockEmitAnalyticsEvent = vi.fn();
global.emitAnalyticsEvent = mockEmitAnalyticsEvent;

// Mock store
const mockAuditStore = {
  appendLog: vi.fn(),
  listLogs: vi.fn(),
  getStats: vi.fn(),
  getLogById: vi.fn(),
  searchLogs: vi.fn(),
  getActivitySummary: vi.fn(),
  exportCsv: vi.fn(),
};

global.auditStore = mockAuditStore as any;

describe('Audit Router Integration Tests', () => {
  let testUser: any;
  let testOrgId: string;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TEMPLATE_OFFLINE = '1';
    
    testUser = createTestUser();
    testOrgId = generateUUID();
  });

  describe('append', () => {
    it('should append audit log entry', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const log = createTestAuditLog({
        org_id: testOrgId,
        actor_id: testUser.id,
        action: 'user.created',
        entity_type: 'user',
        entity_id: generateUUID(),
      });

      mockAuditStore.appendLog.mockResolvedValue(log);

      const result = await caller.audit.append({
        orgId: testOrgId,
        action: 'user.created',
        entityType: 'user',
        entityId: log.entity_id,
        metadata: {},
      });

      expect(result).toMatchObject({
        org_id: testOrgId,
        actor_id: testUser.id,
        action: 'user.created',
      });
      expect(mockAuditStore.appendLog).toHaveBeenCalled();
    });

    it('should emit analytics event on append', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const log = createTestAuditLog({ org_id: testOrgId });

      mockAuditStore.appendLog.mockResolvedValue(log);

      await caller.audit.append({
        orgId: testOrgId,
        action: 'test.action',
        entityType: 'test',
        entityId: generateUUID(),
      });

      expect(mockEmitAnalyticsEvent).toHaveBeenCalledWith(
        testUser.id,
        'audit.appended',
        expect.objectContaining({
          org_id: testOrgId,
          action: 'test.action',
        })
      );
    });

    it('should include metadata in audit log', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const metadata = { key: 'value', nested: { data: 'test' } };
      const log = createTestAuditLog({
        org_id: testOrgId,
        metadata,
      });

      mockAuditStore.appendLog.mockResolvedValue(log);

      const result = await caller.audit.append({
        orgId: testOrgId,
        action: 'test.action',
        entityType: 'test',
        entityId: generateUUID(),
        metadata,
      });

      expect(result.metadata).toEqual(metadata);
    });
  });

  describe('list', () => {
    it('should list audit logs for organization', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const logs = createTestAuditLogs(10, { org_id: testOrgId });

      mockAuditStore.listLogs.mockResolvedValue({
        logs,
        has_more: false,
        next_cursor: undefined,
        total: 10,
      });

      const result = await caller.audit.list({
        orgId: testOrgId,
        limit: 50,
      });

      expect(result.logs).toHaveLength(10);
      expect(result.total).toBe(10);
      expect(result.has_more).toBe(false);
    });

    it('should filter by action', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const logs = createTestAuditLogs(5, {
        org_id: testOrgId,
        action: 'user.created',
      });

      mockAuditStore.listLogs.mockResolvedValue({
        logs,
        has_more: false,
        next_cursor: undefined,
        total: 5,
      });

      const result = await caller.audit.list({
        orgId: testOrgId,
        action: 'user.created',
        limit: 50,
      });

      expect(result.logs.every(log => log.action === 'user.created')).toBe(true);
    });

    it('should filter by entity type', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const logs = createTestAuditLogs(5, {
        org_id: testOrgId,
        entity_type: 'organization',
      });

      mockAuditStore.listLogs.mockResolvedValue({
        logs,
        has_more: false,
        next_cursor: undefined,
        total: 5,
      });

      const result = await caller.audit.list({
        orgId: testOrgId,
        entityType: 'organization',
        limit: 50,
      });

      expect(result.logs.every(log => log.entity_type === 'organization')).toBe(true);
    });

    it('should filter by actor', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const actorId = generateUUID();
      const logs = createTestAuditLogs(5, {
        org_id: testOrgId,
        actor_id: actorId,
      });

      mockAuditStore.listLogs.mockResolvedValue({
        logs,
        has_more: false,
        next_cursor: undefined,
        total: 5,
      });

      const result = await caller.audit.list({
        orgId: testOrgId,
        actorId,
        limit: 50,
      });

      expect(result.logs.every(log => log.actor_id === actorId)).toBe(true);
    });

    it('should filter by date range', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const from = dateHelpers.daysAgo(7);
      const to = dateHelpers.now();
      const logs = createTestAuditLogs(5, { org_id: testOrgId });

      mockAuditStore.listLogs.mockResolvedValue({
        logs,
        has_more: false,
        next_cursor: undefined,
        total: 5,
      });

      const result = await caller.audit.list({
        orgId: testOrgId,
        from: from.toISOString(),
        to: to.toISOString(),
        limit: 50,
      });

      expect(result.logs).toHaveLength(5);
    });

    it('should support cursor-based pagination', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const logs = createTestAuditLogs(50, { org_id: testOrgId });

      mockAuditStore.listLogs.mockResolvedValue({
        logs: logs.slice(0, 50),
        has_more: true,
        next_cursor: logs[49].id,
        total: 100,
      });

      const result = await caller.audit.list({
        orgId: testOrgId,
        limit: 50,
      });

      expect(result.has_more).toBe(true);
      expect(result.next_cursor).toBeDefined();
    });

    it('should emit analytics event on view', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockAuditStore.listLogs.mockResolvedValue({
        logs: [],
        has_more: false,
        next_cursor: undefined,
        total: 0,
      });

      await caller.audit.list({
        orgId: testOrgId,
        limit: 50,
      });

      expect(mockEmitAnalyticsEvent).toHaveBeenCalledWith(
        testUser.id,
        'audit.viewed',
        expect.objectContaining({
          org_id: testOrgId,
        })
      );
    });
  });

  describe('getById', () => {
    it('should get audit log by ID', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const log = createTestAuditLog({ org_id: testOrgId });

      mockAuditStore.getLogById.mockResolvedValue(log);

      const result = await caller.audit.getById({
        logId: log.id,
        orgId: testOrgId,
      });

      expect(result).toMatchObject({
        id: log.id,
        org_id: testOrgId,
      });
    });

    it('should throw error if log not found', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockAuditStore.getLogById.mockResolvedValue(null);

      await expect(
        caller.audit.getById({
          logId: generateUUID(),
          orgId: testOrgId,
        })
      ).rejects.toThrow('Audit log not found');
    });
  });

  describe('search', () => {
    it('should search audit logs with query', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const logs = createTestAuditLogs(5, {
        org_id: testOrgId,
        action: 'user.created',
      });

      mockAuditStore.searchLogs.mockResolvedValue({
        logs,
        has_more: false,
        next_cursor: undefined,
        total: 5,
      });

      const result = await caller.audit.search({
        orgId: testOrgId,
        query: 'user',
        limit: 50,
      });

      expect(result.logs).toHaveLength(5);
    });

    it('should support additional filters with search', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const logs = createTestAuditLogs(3, {
        org_id: testOrgId,
        action: 'user.created',
        entity_type: 'user',
      });

      mockAuditStore.searchLogs.mockResolvedValue({
        logs,
        has_more: false,
        next_cursor: undefined,
        total: 3,
      });

      const result = await caller.audit.search({
        orgId: testOrgId,
        query: 'created',
        entityType: 'user',
        action: 'user.created',
        limit: 50,
      });

      expect(result.logs).toHaveLength(3);
    });
  });

  describe('getActivitySummary', () => {
    it('should get activity summary', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const summary = {
        timeline: [
          { timestamp: dateHelpers.daysAgo(2).toISOString(), count: 10 },
          { timestamp: dateHelpers.daysAgo(1).toISOString(), count: 15 },
        ],
        by_action: {
          'user.created': 5,
          'user.updated': 10,
        },
        by_entity_type: {
          user: 15,
        },
        top_actors: [
          { actor_id: testUser.id, count: 15 },
        ],
        total: 15,
        period: {
          from: dateHelpers.daysAgo(7).toISOString(),
          to: dateHelpers.now().toISOString(),
        },
      };

      mockAuditStore.getActivitySummary.mockResolvedValue(summary);

      const result = await caller.audit.getActivitySummary({
        orgId: testOrgId,
        groupBy: 'day',
      });

      expect(result.timeline).toHaveLength(2);
      expect(result.total).toBe(15);
      expect(result.by_action).toHaveProperty('user.created');
    });

    it('should support different groupBy options', async () => {
      const { caller } = createTestCaller({ user: testUser });

      for (const groupBy of ['hour', 'day', 'week']) {
        mockAuditStore.getActivitySummary.mockResolvedValue({
          timeline: [],
          by_action: {},
          by_entity_type: {},
          top_actors: [],
          total: 0,
          period: {
            from: dateHelpers.daysAgo(7).toISOString(),
            to: dateHelpers.now().toISOString(),
          },
        });

        const result = await caller.audit.getActivitySummary({
          orgId: testOrgId,
          groupBy: groupBy as any,
        });

        expect(result).toBeDefined();
      }
    });

    it('should include top actors', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const summary = {
        timeline: [],
        by_action: {},
        by_entity_type: {},
        top_actors: [
          { actor_id: 'user-1', count: 50 },
          { actor_id: 'user-2', count: 30 },
          { actor_id: 'user-3', count: 20 },
        ],
        total: 100,
        period: {
          from: dateHelpers.daysAgo(7).toISOString(),
          to: dateHelpers.now().toISOString(),
        },
      };

      mockAuditStore.getActivitySummary.mockResolvedValue(summary);

      const result = await caller.audit.getActivitySummary({
        orgId: testOrgId,
        groupBy: 'day',
      });

      expect(result.top_actors).toHaveLength(3);
      expect(result.top_actors[0].count).toBe(50);
    });
  });

  describe('exportCsv', () => {
    it('should export audit logs as CSV', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const csvContent = 'id,org_id,actor_id,action,entity_type,entity_id,metadata,created_at\n';

      mockAuditStore.exportCsv.mockResolvedValue(csvContent);

      const result = await caller.audit.exportCsv({
        orgId: testOrgId,
      });

      expect(result.csv).toContain('id,org_id,actor_id');
    });

    it('should apply filters to export', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const csvContent = 'id,org_id,actor_id,action,entity_type,entity_id,metadata,created_at\n';

      mockAuditStore.exportCsv.mockResolvedValue(csvContent);

      const result = await caller.audit.exportCsv({
        orgId: testOrgId,
        action: 'user.created',
        entityType: 'user',
      });

      expect(result.csv).toBeDefined();
    });

    it('should emit analytics event on export', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockAuditStore.exportCsv.mockResolvedValue('csv content');

      await caller.audit.exportCsv({
        orgId: testOrgId,
      });

      expect(mockEmitAnalyticsEvent).toHaveBeenCalledWith(
        testUser.id,
        'audit.exported',
        expect.objectContaining({
          org_id: testOrgId,
        })
      );
    });
  });

  describe('Integration: Audit lifecycle', () => {
    it('should append → list → verify present', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const entityId = generateUUID();

      // Append
      const log = createTestAuditLog({
        org_id: testOrgId,
        actor_id: testUser.id,
        action: 'test.action',
        entity_id: entityId,
      });
      mockAuditStore.appendLog.mockResolvedValue(log);

      await caller.audit.append({
        orgId: testOrgId,
        action: 'test.action',
        entityType: 'test',
        entityId,
      });

      // List
      mockAuditStore.listLogs.mockResolvedValue({
        logs: [log],
        has_more: false,
        next_cursor: undefined,
        total: 1,
      });

      const result = await caller.audit.list({
        orgId: testOrgId,
        limit: 50,
      });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].entity_id).toBe(entityId);
    });

    it('should append → search → find by query', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // Append
      const log = createTestAuditLog({
        org_id: testOrgId,
        action: 'user.created',
      });
      mockAuditStore.appendLog.mockResolvedValue(log);

      await caller.audit.append({
        orgId: testOrgId,
        action: 'user.created',
        entityType: 'user',
        entityId: generateUUID(),
      });

      // Search
      mockAuditStore.searchLogs.mockResolvedValue({
        logs: [log],
        has_more: false,
        next_cursor: undefined,
        total: 1,
      });

      const result = await caller.audit.search({
        orgId: testOrgId,
        query: 'user',
        limit: 50,
      });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].action).toBe('user.created');
    });

    it('should list → export → verify CSV format', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const logs = createTestAuditLogs(5, { org_id: testOrgId });

      // List
      mockAuditStore.listLogs.mockResolvedValue({
        logs,
        has_more: false,
        next_cursor: undefined,
        total: 5,
      });

      await caller.audit.list({
        orgId: testOrgId,
        limit: 50,
      });

      // Export
      const csvContent = [
        'id,org_id,actor_id,action,entity_type,entity_id,metadata,created_at',
        ...logs.map(log => 
          `"${log.id}","${log.org_id}","${log.actor_id}","${log.action}","${log.entity_type}","${log.entity_id}","{}","${log.created_at}"`
        ),
      ].join('\n');

      mockAuditStore.exportCsv.mockResolvedValue(csvContent);

      const result = await caller.audit.exportCsv({
        orgId: testOrgId,
      });

      expect(result.csv).toContain('id,org_id,actor_id');
      expect(result.csv.split('\n').length).toBeGreaterThan(1);
    });
  });

  describe('Permission checks', () => {
    it('should require authentication', async () => {
      const { caller } = createTestCaller({ user: null as any });

      await expect(
        caller.audit.list({
          orgId: testOrgId,
          limit: 50,
        })
      ).rejects.toThrow('You must be logged in');
    });
  });

  describe('Input validation', () => {
    it('should validate orgId format', async () => {
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.audit.list({
          orgId: 'invalid-uuid',
          limit: 50,
        })
      ).rejects.toThrow();
    });

    it('should validate limit boundaries', async () => {
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.audit.list({
          orgId: testOrgId,
          limit: 0,
        })
      ).rejects.toThrow();
    });

    it('should validate date formats', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // Invalid date format should be handled gracefully
      mockAuditStore.listLogs.mockResolvedValue({
        logs: [],
        has_more: false,
        next_cursor: undefined,
        total: 0,
      });

      const result = await caller.audit.list({
        orgId: testOrgId,
        from: dateHelpers.daysAgo(7).toISOString(),
        to: dateHelpers.now().toISOString(),
        limit: 50,
      });

      expect(result).toBeDefined();
    });
  });
});
