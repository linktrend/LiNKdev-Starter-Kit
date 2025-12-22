import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestContext } from '../helpers/middleware-helpers';
import { TEST_IDS, createMockRecord } from '../helpers/fixtures';

vi.mock('../../utils/usage', () => ({
  logUsageEvent: vi.fn(),
}));

describe('Records Router', () => {
  describe('offline mode', () => {
    let caller: any;
    let recordsStoreMock: any;
    let appRouter: any;

    beforeEach(async () => {
      vi.resetModules();
      vi.resetAllMocks();
      process.env.TEMPLATE_OFFLINE = '1';
      process.env.NEXT_PUBLIC_SUPABASE_URL = '';

      const rootModule = await import('../../root');
      appRouter = rootModule.appRouter;

      recordsStoreMock = {
        createRecord: vi.fn(),
        listRecords: vi.fn(),
        updateRecord: vi.fn(),
        deleteRecord: vi.fn(),
      };

      (global as any).recordsStore = recordsStoreMock;
      (global as any).assertEntitlement = vi.fn().mockResolvedValue(undefined);
      (global as any).assertWithinLimit = vi.fn().mockResolvedValue(undefined);

      const { ctx } = createTestContext({
        user: { id: TEST_IDS.userOwner },
        orgId: TEST_IDS.orgPrimary,
        userRole: 'owner',
      });

      caller = appRouter.createCaller(ctx);
    });

    describe('createRecord', () => {
      it('creates a new record offline', async () => {
        const record = createMockRecord();
        recordsStoreMock.createRecord.mockReturnValue(record);

        const result = await caller.records.createRecord({
          type_id: 'type-1',
          org_id: TEST_IDS.orgPrimary,
          user_id: TEST_IDS.userOwner,
          data: { title: 'Test Record' },
        });

        expect(result.id).toBe(record.id);
        expect(recordsStoreMock.createRecord).toHaveBeenCalled();
      });

      it('validates required fields', async () => {
        await expect(caller.records.createRecord({} as any)).rejects.toThrow();
      });

      it('rejects unauthorized creation', async () => {
        const { ctx } = createTestContext({
          user: null as any,
          orgId: TEST_IDS.orgPrimary,
          userRole: 'owner',
        });

        const unauthorizedCaller = appRouter.createCaller(ctx);

        await expect(
          unauthorizedCaller.records.createRecord({
            type_id: 'type-1',
            data: {},
          } as any),
        ).rejects.toThrow('You must be logged in to access this resource');
      });

      it('rejects creation with missing required fields', async () => {
        await expect(
          caller.records.createRecord({
            type_id: '',
            org_id: TEST_IDS.orgPrimary,
            user_id: TEST_IDS.userOwner,
            data: {},
          }),
        ).rejects.toThrow();
      });

      it('rejects creation for non-member user', async () => {
        await expect(
          caller.records.createRecord({
            type_id: 'type-1',
            org_id: TEST_IDS.orgSecondary,
            user_id: TEST_IDS.userOwner,
            data: { title: 'Test' },
          }),
        ).rejects.toThrow();
      });

      it('handles database error during creation', async () => {
        recordsStoreMock.createRecord.mockImplementation(() => {
          throw new Error('Database error');
        });

        await expect(
          caller.records.createRecord({
            type_id: 'type-1',
            org_id: TEST_IDS.orgPrimary,
            user_id: TEST_IDS.userOwner,
            data: { title: 'Test' },
          }),
        ).rejects.toThrow('Database error');
      });
    });

    describe('listRecords', () => {
      it('lists records with filters', async () => {
        const record = createMockRecord({ type_id: 'type-1' });
        recordsStoreMock.listRecords.mockReturnValue({
          records: [record],
          total: 1,
          has_more: false,
        });

        const result = await caller.records.listRecords({
          type_id: 'type-1',
          limit: 10,
          offset: 0,
        });

        expect(result.records).toHaveLength(1);
        expect(result.total).toBe(1);
      });

      it('returns empty array for org with no records', async () => {
        recordsStoreMock.listRecords.mockReturnValue({
          records: [],
          total: 0,
          has_more: false,
        });

        const result = await caller.records.listRecords({
          org_id: TEST_IDS.orgPrimary,
          limit: 10,
          offset: 0,
        });

        expect(result.records).toEqual([]);
        expect(result.total).toBe(0);
      });

      it('handles invalid pagination parameters', async () => {
        await expect(
          caller.records.listRecords({
            org_id: TEST_IDS.orgPrimary,
            limit: -1,
            offset: 0,
          }),
        ).rejects.toThrow();
      });
    });

    describe('updateRecord', () => {
      it('updates an existing record', async () => {
        const updated = createMockRecord({
          id: TEST_IDS.record1,
          data: { updated: true },
        });
        recordsStoreMock.updateRecord.mockReturnValue(updated);

        const result = await caller.records.updateRecord({
          id: TEST_IDS.record1,
          data: { updated: true },
        });

        expect(result.id).toBe(TEST_IDS.record1);
        expect(result.data).toEqual({ updated: true });
      });

      it('rejects update with invalid record ID', async () => {
        recordsStoreMock.updateRecord.mockImplementation(() => {
          throw new Error('Invalid record ID');
        });

        await expect(
          caller.records.updateRecord({
            id: 'invalid-uuid',
            data: { title: 'Updated' },
          }),
        ).rejects.toThrow();
      });

      it('rejects update by non-owner user', async () => {
        const { ctx } = createTestContext({
          user: { id: TEST_IDS.userMember },
          orgId: TEST_IDS.orgPrimary,
          userRole: 'member',
        });
        const memberCaller = appRouter.createCaller(ctx);

        recordsStoreMock.updateRecord.mockImplementation(() => {
          throw new Error('Permission denied');
        });

        await expect(
          memberCaller.records.updateRecord({
            id: TEST_IDS.record1,
            data: { title: 'Updated' },
          }),
        ).rejects.toThrow();
      });

      it('handles database error during update', async () => {
        recordsStoreMock.updateRecord.mockImplementation(() => {
          throw new Error('Update failed');
        });

        await expect(
          caller.records.updateRecord({
            id: TEST_IDS.record1,
            data: { title: 'Updated' },
          }),
        ).rejects.toThrow('Update failed');
      });
    });

    describe('deleteRecord', () => {
      it('deletes a record with correct permissions', async () => {
        recordsStoreMock.deleteRecord.mockReturnValue(true);

        const result = await caller.records.deleteRecord({
          id: TEST_IDS.record1,
        });

        expect(result.success).toBe(true);
        expect(recordsStoreMock.deleteRecord).toHaveBeenCalledWith(TEST_IDS.record1);
      });

      it('rejects deletion of non-existent record', async () => {
        recordsStoreMock.deleteRecord.mockImplementation(() => {
          throw new Error('Record not found');
        });

        await expect(
          caller.records.deleteRecord({
            id: 'non-existent-id',
          }),
        ).rejects.toThrow();
      });

      it('rejects deletion by viewer role', async () => {
        const { ctx } = createTestContext({
          user: { id: TEST_IDS.userViewer },
          orgId: TEST_IDS.orgPrimary,
          userRole: 'viewer',
        });
        const viewerCaller = appRouter.createCaller(ctx);

        recordsStoreMock.deleteRecord.mockImplementation(() => {
          throw new Error('Insufficient role');
        });

        await expect(
          viewerCaller.records.deleteRecord({
            id: TEST_IDS.record1,
          }),
        ).rejects.toThrow();
      });
    });
  });

  describe('online mode', () => {
    let caller: any;
    let supabaseMock: ReturnType<typeof createTestContext>['supabaseMock'];
    let appRouter: any;

    beforeEach(async () => {
      vi.resetModules();
      vi.resetAllMocks();
      process.env.TEMPLATE_OFFLINE = '0';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';

      const rootModule = await import('../../root');
      appRouter = rootModule.appRouter;

      const { ctx, supabaseMock: mock } = createTestContext({
        user: { id: TEST_IDS.userOwner },
        orgId: TEST_IDS.orgPrimary,
        userRole: 'owner',
      });

      supabaseMock = mock;
      caller = appRouter.createCaller(ctx);
    });

    it('creates a new record online', async () => {
      const record = createMockRecord();
      const recordsTable = supabaseMock.getTable('records');
      recordsTable.__queueSingleResponse({ data: record, error: null });

      const result = await caller.records.createRecord({
        type_id: record.type_id,
        org_id: record.org_id,
        user_id: record.user_id,
        data: record.data,
      });

      expect(result.id).toBe(record.id);
    });

    it('handles database error during online creation', async () => {
      const recordsTable = supabaseMock.getTable('records');
      recordsTable.__queueSingleResponse({
        data: null,
        error: { message: 'Insert failed', code: '23505' },
      });

      await expect(
        caller.records.createRecord({
          type_id: 'type-1',
          org_id: TEST_IDS.orgPrimary,
          user_id: TEST_IDS.userOwner,
          data: { title: 'Test' },
        }),
      ).rejects.toThrow();
    });

    it('lists records online', async () => {
      const record = createMockRecord();
      const recordsTable = supabaseMock.getTable('records');
      recordsTable.__queueEqResponse({ data: [record], error: null, count: 1 });

      const result = await caller.records.listRecords({
        org_id: TEST_IDS.orgPrimary,
        limit: 10,
        offset: 0,
      });

      expect(result.records).toEqual([record]);
      expect(result.total).toBe(1);
    });

    it('rejects list request on error', async () => {
      const recordsTable = supabaseMock.getTable('records');
      recordsTable.__queueEqResponse({ data: null, error: { message: 'List failed' } });

      await expect(
        caller.records.listRecords({
          org_id: TEST_IDS.orgPrimary,
          limit: 10,
          offset: 0,
        }),
      ).rejects.toThrow();
    });

    it('updates a record online', async () => {
      const updated = createMockRecord({ id: TEST_IDS.record1, data: { updated: true } });
      const recordsTable = supabaseMock.getTable('records');
      recordsTable.__queueEqResponse({ data: updated, error: null });
      recordsTable.__queueSingleResponse({ data: updated, error: null });

      const result = await caller.records.updateRecord({
        id: TEST_IDS.record1,
        data: { updated: true },
      });

      expect(result.data).toEqual({ updated: true });
    });

    it('handles online update errors', async () => {
      const recordsTable = supabaseMock.getTable('records');
      recordsTable.__queueEqResponse({ data: null, error: { message: 'Update failed' } });
      recordsTable.__queueSingleResponse({ data: null, error: { message: 'Update failed' } });

      await expect(
        caller.records.updateRecord({
          id: TEST_IDS.record1,
          data: { updated: true },
        }),
      ).rejects.toThrow();
    });

    it('deletes a record online', async () => {
      const recordsTable = supabaseMock.getTable('records');
      recordsTable.__queueEqResponse({ data: null, error: null });

      const result = await caller.records.deleteRecord({
        id: TEST_IDS.record1,
      });

      expect(result.success).toBe(true);
    });

    it('handles online deletion error', async () => {
      const recordsTable = supabaseMock.getTable('records');
      recordsTable.__queueEqResponse({ data: null, error: { message: 'Delete failed' } });

      await expect(
        caller.records.deleteRecord({
          id: TEST_IDS.record1,
        }),
      ).rejects.toThrow();
    });
  });
});
