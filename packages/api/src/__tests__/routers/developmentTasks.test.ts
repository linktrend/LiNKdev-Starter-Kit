import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestContext } from '../helpers/middleware-helpers';
import { TEST_IDS, createMockTask } from '../helpers/fixtures';

describe('DevelopmentTasks Router', () => {
  let caller: any;
  let supabaseMock: ReturnType<typeof createTestContext>['supabaseMock'];
  let rootModule: any;

  const seedMembership = () => {
    const members = supabaseMock.getTable('organization_members');
    members.__queueEqResponse({ data: [{ id: 'member-1' }], error: null });
    members.__queueEqResponse({ data: [{ id: 'member-1' }], error: null });
    members.__queueSingleResponse({ data: { id: 'member-1' }, error: null });
  };

  beforeEach(async () => {
    process.env.TEMPLATE_OFFLINE = '0';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    vi.resetModules();
    rootModule = await import('../../root');
    const { appRouter } = rootModule;

    const { ctx, supabaseMock: mock } = createTestContext({
      user: { id: TEST_IDS.userOwner },
      orgId: TEST_IDS.orgPrimary,
      userRole: 'owner',
    });

    supabaseMock = mock;
    caller = appRouter.createCaller({ ...ctx, orgId: TEST_IDS.orgPrimary });
  });

  describe('list', () => {
    it('lists development tasks with status filter', async () => {
      seedMembership();
      const tasks = [createMockTask({ status: 'todo' })];
      const tasksTable = supabaseMock.getTable('development_tasks');
      tasksTable.__queueEqResponse({ data: tasks, error: null, count: tasks.length }); // org filter
      tasksTable.__queueEqResponse({ data: tasks, error: null, count: tasks.length }); // status filter

      const result = await caller.developmentTasks.list({
        org_id: TEST_IDS.orgPrimary,
        status: 'todo',
        limit: 10,
        offset: 0,
        sort_by: 'updated_at',
        sort_order: 'desc',
      });

      expect(result.tasks).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('returns empty array when no tasks exist', async () => {
      seedMembership();
      const tasksTable = supabaseMock.getTable('development_tasks');
      tasksTable.__queueEqResponse({ data: [], error: null, count: 0 });
      tasksTable.__queueEqResponse({ data: [], error: null, count: 0 });

      const result = await caller.developmentTasks.list({
        org_id: TEST_IDS.orgPrimary,
        limit: 10,
        offset: 0,
      });

      expect(result.tasks).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('handles invalid sort parameters', async () => {
      await expect(
        caller.developmentTasks.list({
          org_id: TEST_IDS.orgPrimary,
          limit: 10,
          offset: 0,
          sort_by: 'invalid_column' as any,
        }),
      ).rejects.toThrow();
    });

    it('rejects list request by non-member', async () => {
      await expect(
        caller.developmentTasks.list({
          org_id: TEST_IDS.orgSecondary,
          limit: 10,
          offset: 0,
        }),
      ).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('creates development task online', async () => {
      seedMembership();
      const tasksTable = supabaseMock.getTable('development_tasks');
      const task = createMockTask();
      tasksTable.__queueSingleResponse({ data: task, error: null });

      const result = await caller.developmentTasks.create({
        org_id: TEST_IDS.orgPrimary,
        title: 'Test Task',
        description: 'Test description',
        priority: 'normal',
        status: 'todo',
        metadata: {},
      });

      expect(result.id).toBe(task.id);
      expect(result.title).toBe('Test Task');
    });

    it('validates task data', async () => {
      await expect(
        caller.developmentTasks.create({
          org_id: TEST_IDS.orgPrimary,
          title: '',
          description: 'Test',
        } as any),
      ).rejects.toThrow();
    });

    it('rejects creation with empty title', async () => {
      await expect(
        caller.developmentTasks.create({
          title: '',
          description: 'Test',
          org_id: TEST_IDS.orgPrimary,
          priority: 'normal',
        }),
      ).rejects.toThrow();
    });

    it('rejects creation with invalid priority', async () => {
      await expect(
        caller.developmentTasks.create({
          title: 'Test Task',
          description: 'Test',
          org_id: TEST_IDS.orgPrimary,
          priority: 'invalid' as any,
        }),
      ).rejects.toThrow();
    });

    it('rejects creation by non-member user', async () => {
      await expect(
        caller.developmentTasks.create({
          title: 'Test Task',
          description: 'Test',
          org_id: TEST_IDS.orgSecondary,
          priority: 'medium',
        }),
      ).rejects.toThrow();
    });

    it('handles database error during creation', async () => {
      seedMembership();
      const tasksTable = supabaseMock.getTable('development_tasks');
      tasksTable.__queueEqResponse({ data: null, error: { message: 'Insert failed', code: '23505' } });
      tasksTable.__queueSingleResponse({ data: null, error: { message: 'Insert failed', code: '23505' } });

      await expect(
        caller.developmentTasks.create({
          title: 'Test Task',
          description: 'Test',
          org_id: TEST_IDS.orgPrimary,
          priority: 'medium',
        }),
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('updates task status', async () => {
      const tasksTable = supabaseMock.getTable('development_tasks');
      tasksTable.__queueEqResponse({ data: { org_id: TEST_IDS.orgPrimary }, error: null });
      tasksTable.__queueSingleResponse({ data: { org_id: TEST_IDS.orgPrimary }, error: null });
      seedMembership();
      const updated = createMockTask({ status: 'done' });
      tasksTable.__queueEqResponse({ data: updated, error: null });
      tasksTable.__queueSingleResponse({ data: updated, error: null });

      const result = await caller.developmentTasks.update({
        id: TEST_IDS.task1,
        status: 'done',
      });

      expect(result.status).toBe('done');
    });

    it('rejects update of non-existent task', async () => {
      const tasksTable = supabaseMock.getTable('development_tasks');
      tasksTable.__queueEqResponse({ data: null, error: { message: 'Not found' } });

      await expect(
        caller.developmentTasks.update({
          id: 'non-existent-id',
          status: 'completed',
        }),
      ).rejects.toThrow();
    });

    it('rejects update with invalid status', async () => {
      await expect(
        caller.developmentTasks.update({
          id: TEST_IDS.task1,
          status: 'invalid-status' as any,
        }),
      ).rejects.toThrow();
    });

    it('rejects update by viewer role', async () => {
      const { ctx } = createTestContext({
        user: { id: TEST_IDS.userViewer },
        orgId: TEST_IDS.orgPrimary,
        userRole: 'viewer',
      });
      const viewerCaller = rootModule.appRouter.createCaller({
        ...ctx,
        orgId: TEST_IDS.orgPrimary,
      });

      await expect(
        viewerCaller.developmentTasks.update({
          id: TEST_IDS.task1,
          status: 'completed',
        }),
      ).rejects.toThrow();
    });

    it('handles database error during update', async () => {
      const tasksTable = supabaseMock.getTable('development_tasks');
      tasksTable.__queueEqResponse({ data: { org_id: TEST_IDS.orgPrimary }, error: null });
      seedMembership();
      tasksTable.__queueEqResponse({ data: null, error: { message: 'Update failed', code: '23503' } });
      tasksTable.__queueSingleResponse({ data: null, error: { message: 'Update failed', code: '23503' } });

      await expect(
        caller.developmentTasks.update({
          id: TEST_IDS.task1,
          status: 'completed',
        }),
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('deletes task when member', async () => {
      const tasksTable = supabaseMock.getTable('development_tasks');
      tasksTable.__queueEqResponse({ data: { org_id: TEST_IDS.orgPrimary }, error: null });
      tasksTable.__queueSingleResponse({ data: { org_id: TEST_IDS.orgPrimary }, error: null });
      seedMembership();
      tasksTable.__queueEqResponse({ data: null, error: null });

      const result = await caller.developmentTasks.delete({
        id: TEST_IDS.task1,
      });

      expect(result.success).toBe(true);
    });

    it('rejects deletion of non-existent task', async () => {
      const tasksTable = supabaseMock.getTable('development_tasks');
      tasksTable.__queueEqResponse({ data: null, error: { message: 'Not found' } });

      await expect(
        caller.developmentTasks.delete({
          id: 'non-existent-id',
        }),
      ).rejects.toThrow();
    });

    it('rejects deletion by member role (requires admin)', async () => {
      const { ctx } = createTestContext({
        user: { id: TEST_IDS.userMember },
        orgId: TEST_IDS.orgPrimary,
        userRole: 'member',
      });
      const memberCaller = rootModule.appRouter.createCaller({
        ...ctx,
        orgId: TEST_IDS.orgPrimary,
      });
      const tasksTable = supabaseMock.getTable('development_tasks');
      tasksTable.__queueEqResponse({ data: { org_id: TEST_IDS.orgPrimary }, error: null });
      tasksTable.__queueSingleResponse({ data: { org_id: TEST_IDS.orgPrimary }, error: null });

      await expect(
        memberCaller.developmentTasks.delete({
          id: TEST_IDS.task1,
        }),
      ).rejects.toThrow();
    });

    it('handles database error during deletion', async () => {
      const tasksTable = supabaseMock.getTable('development_tasks');
      tasksTable.__queueEqResponse({ data: { org_id: TEST_IDS.orgPrimary }, error: null });
      seedMembership();
      tasksTable.__queueEqResponse({ data: null, error: { message: 'Delete failed', code: '23503' } });

      await expect(
        caller.developmentTasks.delete({
          id: TEST_IDS.task1,
        }),
      ).rejects.toThrow();
    });
  });
});
