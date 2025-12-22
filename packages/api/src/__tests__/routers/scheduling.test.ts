import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { schedulingRouter } from '../../routers/scheduling';
import * as usageUtils from '../../utils/usage';

process.env.TEMPLATE_OFFLINE = '1';
process.env.NEXT_PUBLIC_SUPABASE_URL = '';

vi.mock('../../middleware/audit', () => ({
  auditCreate: () => async ({ ctx, input, next }: any) => next({ ctx, input }),
  auditUpdate: () => async ({ ctx, input, next }: any) => next({ ctx, input }),
  auditDelete: () => async ({ ctx, input, next }: any) => next({ ctx, input }),
}));

const ORG_ID = '00000000-0000-4000-8000-000000000444';
const reminder = {
  id: '00000000-0000-4000-8000-000000000555',
  org_id: ORG_ID,
  title: 'Follow up',
  priority: 'high',
  due_at: '2025-01-01T00:00:00.000Z',
  snoozed_until: '2025-01-02T00:00:00.000Z',
};
const schedule = {
  id: '00000000-0000-4000-8000-000000000666',
  org_id: ORG_ID,
  name: 'Daily digest',
};

let schedulingStore: any;
let emitReminderEvent: ReturnType<typeof vi.fn>;
let emitScheduleEvent: ReturnType<typeof vi.fn>;
let emitDueRemindersEvent: ReturnType<typeof vi.fn>;

beforeEach(() => {
  schedulingStore = {
    createReminder: vi.fn(() => reminder),
    listReminders: vi.fn(() => [reminder]),
    getReminder: vi.fn(() => reminder),
    updateReminder: vi.fn(() => ({ ...reminder, title: 'Updated' })),
    snoozeReminder: vi.fn(() => ({ ...reminder })),
    completeReminder: vi.fn(() => ({ ...reminder, status: 'completed' })),
    deleteReminder: vi.fn(() => true),
    createSchedule: vi.fn(() => schedule),
    listSchedules: vi.fn(() => [schedule]),
    updateSchedule: vi.fn(() => ({ ...schedule, name: 'Updated schedule' })),
    getSchedule: vi.fn(() => schedule),
    deleteSchedule: vi.fn(() => true),
    getReminderStats: vi.fn(() => ({ total: 5, pending: 3, completed: 2, overdue: 1, due_today: 1 })),
    getDueReminders: vi.fn(() => [reminder]),
  };

  emitReminderEvent = vi.fn();
  emitScheduleEvent = vi.fn();
  emitDueRemindersEvent = vi.fn();

  Object.assign(globalThis as any, {
    schedulingStore,
    emitReminderEvent,
    emitScheduleEvent,
    emitDueRemindersEvent,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (globalThis as any).schedulingStore;
  delete (globalThis as any).emitReminderEvent;
  delete (globalThis as any).emitScheduleEvent;
  delete (globalThis as any).emitDueRemindersEvent;
});

const createCaller = () =>
  schedulingRouter.createCaller({
    supabase: { from: vi.fn() },
    user: { id: 'user-1' },
    orgId: ORG_ID,
  });

describe('schedulingRouter (offline)', () => {
  it('creates a reminder and emits event', async () => {
    const caller = createCaller();

    const result = await caller.createReminder({
      org_id: ORG_ID,
      title: reminder.title,
      notes: 'Note',
      priority: 'high',
      due_at: reminder.due_at,
    });

    expect(result.id).toBe(reminder.id);
    expect(schedulingStore.createReminder).toHaveBeenCalledWith(
      expect.objectContaining({ org_id: ORG_ID, title: reminder.title }),
      'user-1',
    );
    expect(emitReminderEvent).toHaveBeenCalledWith(
      expect.anything(),
      ORG_ID,
      'reminder_created',
      reminder.id,
      reminder.title,
      reminder.priority,
      reminder.due_at,
    );
  });

  it('updates and completes reminder variants', async () => {
    const caller = createCaller();

    const updated = await caller.updateReminder({ id: reminder.id, title: 'Updated' });
    expect(updated.title).toBe('Updated');
    expect(emitReminderEvent).toHaveBeenCalledWith(
      expect.anything(),
      ORG_ID,
      'reminder_updated',
      reminder.id,
      expect.any(String),
      expect.any(String),
      expect.any(String),
    );

    const snoozed = await caller.snoozeReminder({ id: reminder.id, minutes: 60 });
    expect(snoozed?.id).toBe(reminder.id);
    expect(emitReminderEvent).toHaveBeenCalledWith(
      expect.anything(),
      ORG_ID,
      'reminder_snoozed',
      reminder.id,
      reminder.title,
      reminder.priority,
      reminder.snoozed_until,
    );

    const completed = await caller.completeReminder({ id: reminder.id });
    expect(completed?.status).toBe('completed');
    expect(emitReminderEvent).toHaveBeenCalledWith(
      expect.anything(),
      ORG_ID,
      'reminder_completed',
      reminder.id,
      reminder.title,
      reminder.priority,
    );
  });

  it('lists, fetches, and deletes reminders', async () => {
    const caller = createCaller();

    const list = await caller.listReminders({ org_id: ORG_ID, limit: 10, offset: 0 });
    expect(list).toEqual([reminder]);

    const fetched = await caller.getReminder({ id: reminder.id });
    expect(fetched.id).toBe(reminder.id);

    const deleted = await caller.deleteReminder({ id: reminder.id });
    expect(deleted).toBe(true);
  });

  it('creates and updates schedules', async () => {
    const caller = createCaller();

    const created = await caller.createSchedule({
      org_id: ORG_ID,
      name: schedule.name,
      description: 'desc',
      cron: '* * * * *',
    });
    expect(created.id).toBe(schedule.id);
    expect(emitScheduleEvent).toHaveBeenCalledWith(
      expect.anything(),
      ORG_ID,
      'schedule_created',
      schedule.id,
      schedule.name,
    );

    const updated = await caller.updateSchedule({ id: schedule.id, name: 'Updated schedule' });
    expect(updated.name).toBe('Updated schedule');
    expect(emitScheduleEvent).toHaveBeenCalledWith(
      expect.anything(),
      ORG_ID,
      'schedule_updated',
      schedule.id,
      expect.any(String),
    );

    const listed = await caller.listSchedules({ org_id: ORG_ID, limit: 5, offset: 0 });
    expect(listed).toEqual([schedule]);
  });

  it('deletes schedules and emits event', async () => {
    const caller = createCaller();

    const result = await caller.deleteSchedule({ id: schedule.id });

    expect(result).toEqual({ success: true });
    expect(emitScheduleEvent).toHaveBeenCalledWith(
      expect.anything(),
      ORG_ID,
      'schedule_deleted',
      schedule.id,
      schedule.name,
    );
  });

  it('returns reminder stats and emits due reminders', async () => {
    const logUsageSpy = vi.spyOn(usageUtils, 'logUsageEvent');
    const caller = createCaller();

    const stats = await caller.getReminderStats({ org_id: ORG_ID });
    expect(stats.total).toBe(5);

    const due = await caller.emitDueReminders({ org_id: ORG_ID });
    expect(due).toEqual({ count: 1 });
    expect(emitDueRemindersEvent).toHaveBeenCalledWith(expect.anything(), ORG_ID, 1);
    expect(logUsageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ user: { id: 'user-1' } }),
      expect.objectContaining({ eventType: 'schedule_executed', quantity: 1 }),
    );
  });
});
