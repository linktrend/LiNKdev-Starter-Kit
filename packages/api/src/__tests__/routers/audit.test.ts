/**
 * Tests for Audit Router
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { auditRouter } from '../../routers/audit';
import { createTestContext, mockRequireMember } from '../helpers/middleware-helpers';

const uuid = (suffix: number) =>
  `00000000-0000-4000-8000-${suffix.toString(16).padStart(12, '0')}`;

describe('Audit Router', () => {
  const user = { id: uuid(1) };
  const orgId = uuid(2);
  const logId = uuid(3);
  const missingLogId = uuid(999);
  const mockAuditStore = {
    getLogById: vi.fn(),
    listLogs: vi.fn(),
    searchLogs: vi.fn(),
    getStats: vi.fn(),
    getActivitySummary: vi.fn(),
    exportCsv: vi.fn(),
    appendLog: vi.fn(),
  };
  let supabase: ReturnType<typeof createTestContext>['ctx']['supabase'];
  let getTable: ReturnType<typeof createTestContext>['getTable'];
  let supabaseMock: ReturnType<typeof createTestContext>['supabaseMock'];
  let caller: ReturnType<typeof auditRouter.createCaller>;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.TEMPLATE_OFFLINE = '1';
    (global as any).emitAnalyticsEvent = vi.fn(async () => {});
    (global as any).auditStore = mockAuditStore;
    mockAuditStore.getLogById.mockReset();
    mockAuditStore.listLogs.mockReset();
    mockAuditStore.searchLogs.mockReset();
    mockAuditStore.getStats.mockReset();
    mockAuditStore.getActivitySummary.mockReset();
    mockAuditStore.exportCsv.mockReset();
    mockAuditStore.appendLog.mockReset();
    const testCtx = createTestContext({ user, orgId, userRole: undefined });
    supabase = testCtx.ctx.supabase as any;
    getTable = testCtx.getTable;
    supabaseMock = testCtx.supabaseMock;
    caller = auditRouter.createCaller({ supabase, user, orgId });
  });

  describe('getById', () => {
    it('should fetch audit log by ID', async () => {
      mockRequireMember(supabaseMock, orgId, user.id, 'admin');
      mockAuditStore.getLogById.mockReturnValueOnce({
        id: logId,
        org_id: orgId,
        actor_id: user.id,
        action: 'created',
        entity_type: 'org',
        entity_id: 'org-456',
        metadata: {},
        created_at: new Date().toISOString(),
      });

      const result = await caller.getById({ logId, orgId });

      expect(result.id).toBe(logId);
      expect(result.action).toBe('created');
      expect(mockAuditStore.getLogById).toHaveBeenCalledWith(logId, orgId);
    });

    it('should throw NOT_FOUND if log does not exist', async () => {
      mockRequireMember(supabaseMock, orgId, user.id, 'admin');

      mockAuditStore.getLogById.mockReturnValueOnce(null);

      await expect(
        caller.getById({ logId: missingLogId, orgId })
      ).rejects.toThrow('Audit log not found');
    });

    it('should verify org membership', async () => {
      process.env.TEMPLATE_OFFLINE = '0';
      const members = getTable('organization_members');
      members.__queueSingleResponse({
        data: null,
        error: { code: 'PGRST116' },
      });

      await expect(
        caller.getById({ logId, orgId })
      ).rejects.toThrow('Not a member of this organization');
      process.env.TEMPLATE_OFFLINE = '1';
    });
  });

  describe('search', () => {
    it('should search audit logs with query', async () => {
      mockRequireMember(supabaseMock, orgId, user.id, 'admin');
      const mockLogs = [
        {
          id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
          org_id: orgId,
          action: 'created',
          entity_type: 'org',
          entity_id: 'org-1',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockAuditStore.searchLogs.mockReturnValueOnce({
        logs: mockLogs,
        has_more: false,
        next_cursor: undefined,
        total: mockLogs.length,
      });

      const result = await caller.search({
        orgId,
        query: 'created',
        limit: 50,
      });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].action).toBe('created');
    });

    it('should filter by entity type', async () => {
      mockRequireMember(supabaseMock, orgId, user.id, 'admin');
      mockAuditStore.searchLogs.mockReturnValueOnce({
        logs: [],
        has_more: false,
        next_cursor: undefined,
        total: 0,
      });

      const result = await caller.search({
        orgId,
        query: 'test',
        entityType: 'record',
        limit: 50,
      });

      expect(result.logs).toHaveLength(0);
      expect(mockAuditStore.searchLogs).toHaveBeenCalled();
    });

    it('should filter by action', async () => {
      mockRequireMember(supabaseMock, orgId, user.id, 'admin');
      mockAuditStore.searchLogs.mockReturnValueOnce({
        logs: [],
        has_more: false,
        next_cursor: undefined,
        total: 0,
      });

      const result = await caller.search({
        orgId,
        query: 'test',
        action: 'updated',
        limit: 50,
      });

      expect(result.logs).toHaveLength(0);
    });

    it('should support pagination', async () => {
      mockRequireMember(supabaseMock, orgId, user.id, 'admin');
      const mockLogs = Array.from({ length: 51 }, (_, i) => ({
        id: `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa${String(i).padStart(2, '0')}`,
        org_id: orgId,
        action: 'created',
        entity_type: 'org',
        entity_id: `org-${i}`,
        created_at: new Date(Date.now() - i * 1000).toISOString(),
      }));

      mockAuditStore.searchLogs.mockReturnValueOnce({
        logs: mockLogs.slice(0, 50),
        has_more: true,
        next_cursor: mockLogs[50]?.id,
        total: mockLogs.length,
      });

      const result = await caller.search({
        orgId,
        query: 'test',
        limit: 50,
      });

      expect(result.has_more).toBe(true);
      expect(result.logs).toHaveLength(50);
      expect(result.next_cursor).toBeDefined();
    });
  });

  describe('getActivitySummary', () => {
    it('should return activity summary with timeline', async () => {
      mockRequireMember(supabaseMock, orgId, user.id, 'admin');
      mockAuditStore.getActivitySummary.mockReturnValueOnce({
        timeline: [
          { timestamp: '2024-01-01', count: 1 },
          { timestamp: '2024-01-02', count: 1 },
        ],
        by_action: { created: 1, updated: 1 },
        by_entity_type: { org: 1, record: 1 },
        top_actors: [],
        total: 2,
        period: { from: '2024-01-01T00:00:00Z', to: '2024-01-02T00:00:00Z' },
      });

      const result = await caller.getActivitySummary({
        orgId,
        from: '2024-01-01T00:00:00Z',
        to: '2024-01-02T00:00:00Z',
        groupBy: 'day',
      });

      expect(result.timeline).toBeDefined();
      expect(result.by_action).toHaveProperty('created');
      expect(result.by_action).toHaveProperty('updated');
      expect(result.total).toBe(2);
    });

    it('should group by specified period', async () => {
      mockRequireMember(supabaseMock, orgId, user.id, 'admin');
      mockAuditStore.getActivitySummary.mockReturnValueOnce({
        timeline: [{ timestamp: '2024-01-01T10:00:00Z', count: 1 }],
        by_action: { created: 1 },
        by_entity_type: { org: 1 },
        top_actors: [],
        total: 1,
        period: { from: '2024-01-01T00:00:00Z', to: '2024-01-02T00:00:00Z' },
      });

      const result = await caller.getActivitySummary({
        orgId,
        groupBy: 'hour',
      });

      expect(result.timeline).toBeDefined();
      expect(result.timeline[0].timestamp).toContain('10:00:00');
    });

    it('should calculate top actors', async () => {
      mockRequireMember(supabaseMock, orgId, user.id, 'admin');
      mockAuditStore.getActivitySummary.mockReturnValueOnce({
        timeline: [],
        by_action: { created: 2, updated: 1 },
        by_entity_type: { org: 2, record: 1 },
        top_actors: [
          { actor_id: 'user-1', count: 2 },
          { actor_id: 'user-2', count: 1 },
        ],
        total: 3,
        period: { from: '2024-01-01T00:00:00Z', to: '2024-01-02T00:00:00Z' },
      });

      const result = await caller.getActivitySummary({ orgId });

      expect(result.top_actors).toHaveLength(2);
      expect(result.top_actors[0].actor_id).toBe('user-1');
      expect(result.top_actors[0].count).toBe(2);
    });
  });

  describe('list', () => {
    it('should list audit logs with pagination', async () => {
      mockRequireMember(supabaseMock, orgId, user.id, 'admin');
      const mockLogs = [
        {
          id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
          org_id: orgId,
          action: 'created',
          entity_type: 'org',
          entity_id: 'org-1',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockAuditStore.listLogs.mockReturnValueOnce({
        logs: mockLogs,
        has_more: false,
        next_cursor: undefined,
        total: mockLogs.length,
      });

      const result = await caller.list({ orgId, limit: 50 });

      expect(result.logs).toHaveLength(1);
      expect(result.has_more).toBe(false);
      expect(mockAuditStore.listLogs).toHaveBeenCalledWith({
        orgId,
        q: undefined,
        entityType: undefined,
        action: undefined,
        actorId: undefined,
        from: undefined,
        to: undefined,
        limit: 50,
        cursor: undefined,
      });
    });

    it('should apply filters', async () => {
      mockRequireMember(supabaseMock, orgId, user.id, 'admin');
      mockAuditStore.listLogs.mockReturnValueOnce({
        logs: [],
        has_more: false,
        next_cursor: undefined,
        total: 0,
      });

      const result = await caller.list({
        orgId,
        entityType: 'record',
        action: 'created',
        limit: 50,
      });

      expect(result.logs).toHaveLength(0);
      expect(mockAuditStore.listLogs).toHaveBeenCalled();
    });
  });

  describe('stats', () => {
    it('should return aggregated statistics', async () => {
      mockRequireMember(supabaseMock, orgId, user.id, 'admin');
      mockAuditStore.getStats.mockReturnValueOnce({
        by_action: { created: 10, updated: 5 },
        by_entity_type: { org: 8, record: 7 },
        by_actor: { 'user-123': 15 },
        total: 15,
        window: 'day',
      });

      const result = await caller.stats({ orgId, window: 'day' });

      expect(result.total).toBe(15);
      expect(result.by_action.created).toBe(10);
      expect(result.by_entity_type.org).toBe(8);
      expect(mockAuditStore.getStats).toHaveBeenCalledWith({ orgId, window: 'day' });
    });
  });

  describe('exportCsv', () => {
    it('should export logs as CSV', async () => {
      mockRequireMember(supabaseMock, orgId, user.id, 'admin');
      mockAuditStore.exportCsv.mockReturnValueOnce(
        'id,org_id,actor_id,action,entity_type,entity_id,metadata,created_at\n"id","org_id","actor_id","action","entity_type","entity_id","metadata","created_at"\n"ffffffff-ffff-ffff-ffff-fffffffffff1","org-1","actor-1","created","org","org-1","{}","2024-01-01T00:00:00Z"\n',
      );

      const result = await caller.exportCsv({ orgId });

      expect(result.csv).toContain('"id","org_id","actor_id","action"');
      expect(result.csv).toContain('ffffffff-ffff-ffff-ffff-fffffffffff1');
      expect(result.csv).toContain('created');
    });

    it('should apply filters to export', async () => {
      mockRequireMember(supabaseMock, orgId, user.id, 'admin');
      mockAuditStore.exportCsv.mockReturnValueOnce(
        'id,org_id,actor_id,action,entity_type,entity_id,metadata,created_at\n',
      );

      const result = await caller.exportCsv({
        orgId,
        entityType: 'record',
        action: 'created',
      });

      expect(result.csv).toContain('id,org_id,actor_id,action');
      expect(mockAuditStore.exportCsv).toHaveBeenCalledWith({
        orgId,
        q: undefined,
        entityType: 'record',
        action: 'created',
        actorId: undefined,
        from: undefined,
        to: undefined,
      });
    });
  });

  describe('online mode', () => {
    let onlineSupabase: typeof supabase;
    let onlineSupabaseMock: typeof supabaseMock;
    let onlineCaller: typeof caller;

    beforeEach(() => {
      process.env.TEMPLATE_OFFLINE = '0';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
      (global as any).emitAnalyticsEvent = vi.fn(async () => {});
      const testCtx = createTestContext({ user, orgId, userRole: 'admin' });
      onlineSupabase = testCtx.ctx.supabase as any;
      onlineSupabaseMock = testCtx.supabaseMock;
      onlineCaller = auditRouter.createCaller({ supabase: onlineSupabase, user, orgId });
    });

    it('lists audit logs with pagination online', async () => {
      const auditTable = onlineSupabaseMock.getTable('audit_logs');
      const mockLogs = [
        { id: uuid(10), org_id: orgId, action: 'user.login', entity_type: 'user', entity_id: user.id, metadata: {}, created_at: new Date().toISOString() },
        { id: uuid(11), org_id: orgId, action: 'user.logout', entity_type: 'user', entity_id: user.id, metadata: {}, created_at: new Date().toISOString() },
      ];
      auditTable.__queueEqResponse({ data: mockLogs, error: null, count: mockLogs.length });

      const result = await onlineCaller.list({ orgId, limit: 5 });

      expect(result.logs).toHaveLength(2);
      expect(result.has_more).toBe(false);
      expect(result.total).toBe(2);
    });

    it('returns stats from RPC when online', async () => {
      const rpcResult = {
        by_action: { 'user.login': 3 },
        by_entity_type: { user: 3 },
        by_actor: { [user.id]: 3 },
        total: 3,
      };
      (onlineSupabase as any).rpc.mockResolvedValue({
        data: [rpcResult],
        error: null,
      });

      const result = await onlineCaller.stats({ orgId, window: 'day' });

      expect(result.total).toBe(3);
      expect(result.by_action['user.login']).toBe(3);
      expect(result.window).toBe('day');
    });

    it('exports audit logs to CSV online', async () => {
      const auditTable = onlineSupabaseMock.getTable('audit_logs');
      const mockLogs = [
        {
          id: uuid(12),
          org_id: orgId,
          actor_id: user.id,
          action: 'user.login',
          entity_type: 'user',
          entity_id: user.id,
          metadata: { ip: '127.0.0.1' },
          created_at: new Date().toISOString(),
        },
      ];
      auditTable.__queueEqResponse({ data: mockLogs, error: null, count: mockLogs.length });

      const result = await onlineCaller.exportCsv({ orgId });

      expect(result.csv).toContain('user.login');
      expect(result.csv).toContain(mockLogs[0].id);
    });
  });
});
