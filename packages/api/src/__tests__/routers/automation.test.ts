import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { automationRouter } from '../../routers/automation';
import * as usageUtils from '../../utils/usage';

vi.mock('../../middleware/audit', () => ({
  auditCreate: () => async ({ ctx, input, next }: any) => next({ ctx, input }),
}));

const ORG_ID = '00000000-0000-4000-8000-000000000333';

const baseContext = () => ({
  supabase: { from: vi.fn() },
  user: { id: 'user-1' },
  orgId: ORG_ID,
});

let enqueueEventMock: ReturnType<typeof vi.fn>;
let processPendingEventsMock: ReturnType<typeof vi.fn>;
let getPendingEventsMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  enqueueEventMock = vi.fn();
  processPendingEventsMock = vi.fn();
  getPendingEventsMock = vi.fn();

  Object.assign(globalThis as any, {
    enqueueEvent: enqueueEventMock,
    processPendingEvents: processPendingEventsMock,
    getPendingEvents: getPendingEventsMock,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (globalThis as any).enqueueEvent;
  delete (globalThis as any).processPendingEvents;
  delete (globalThis as any).getPendingEvents;
});

function createCaller(overrides: Partial<ReturnType<typeof baseContext>> = {}) {
  return automationRouter.createCaller({ ...baseContext(), ...overrides });
}

describe('automationRouter', () => {
  it('enqueues events successfully', async () => {
    enqueueEventMock.mockResolvedValue('evt-123');
    const caller = createCaller();

    const result = await caller.enqueue({
      orgId: ORG_ID,
      event: 'user.signup',
      payload: { userId: 'user-1' },
    });

    expect(result).toEqual({
      success: true,
      eventId: 'evt-123',
      message: 'Event enqueued for delivery',
    });
    expect(enqueueEventMock).toHaveBeenCalledWith(ORG_ID, 'user.signup', { userId: 'user-1' });
  });

  it('surfaces enqueue failures', async () => {
    enqueueEventMock.mockRejectedValue(new Error('boom'));
    const caller = createCaller();

    await expect(
      caller.enqueue({
        orgId: ORG_ID,
        event: 'user.signup',
        payload: {},
      }),
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it('processes delivery ticks and logs usage', async () => {
    processPendingEventsMock.mockResolvedValue({ processed: 4, successful: 3, failed: 1 });
    const logUsageSpy = vi.spyOn(usageUtils, 'logUsageEvent');
    const caller = createCaller();

    const result = await caller.runDeliveryTick();

    expect(result.success).toBe(true);
    expect(result.processed).toBe(4);
    expect(logUsageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ user: { id: 'user-1' }, orgId: ORG_ID }),
      expect.objectContaining({
        eventType: 'automation_run',
        quantity: 3,
      }),
    );
  });

  it('returns internal error when delivery tick fails', async () => {
    processPendingEventsMock.mockRejectedValue(new Error('tick failed'));
    const caller = createCaller();

    await expect(caller.runDeliveryTick()).rejects.toBeInstanceOf(TRPCError);
  });

  it('lists pending events and filters by org', async () => {
    getPendingEventsMock.mockResolvedValue([
      { id: '1', org_id: ORG_ID },
      { id: '2', org_id: 'other-org' },
    ]);
    const caller = createCaller();

    const result = await caller.listPending({ orgId: ORG_ID, limit: 10 });

    expect(result.events).toEqual([{ id: '1', org_id: ORG_ID }]);
    expect(result.count).toBe(1);
  });

  it('handles list pending errors', async () => {
    getPendingEventsMock.mockRejectedValue(new Error('list failed'));
    const caller = createCaller();

    await expect(caller.listPending({ limit: 5, orgId: ORG_ID })).rejects.toBeInstanceOf(TRPCError);
  });

  it('returns delivery stats', async () => {
    const counts = [10, 7, 2, 1];
    const supabase = {
      from: vi.fn(() => {
        const count = counts.shift() ?? 0;
        const builder: any = { count };
        builder.select = () => builder;
        builder.eq = () => builder;
        builder.not = () => builder;
        builder.is = () => builder;
        builder.gt = () => builder;
        builder.lte = () => builder;
        return builder;
      }),
    };
    const caller = createCaller({ supabase });

    const result = await caller.getStats({ orgId: ORG_ID });

    expect(result).toEqual({
      total: 10,
      delivered: 7,
      pending: 2,
      failed: 1,
      deliveryRate: 70,
    });
  });

  it('handles stats retrieval failures', async () => {
    const supabase = {
      from: () => ({
        select: () => {
          throw new Error('stats failed');
        },
      }),
    };
    const caller = createCaller({ supabase });

    await expect(caller.getStats({})).rejects.toBeInstanceOf(TRPCError);
  });
});
