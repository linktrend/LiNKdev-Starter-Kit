// Event emitter utility for scheduling notifications
// Now uses the generic automation event emitter

import { NotificationEventPayload } from '@/types/scheduling';
import { emitAutomationEvent, emitReminderEvent as emitGenericReminderEvent, emitScheduleEvent as emitGenericScheduleEvent } from '@/utils/automation/event-emitter';

export interface EventEmitterContext {
  supabase?: any;
  posthog?: any;
  user: { id: string };
}

export async function emitNotificationEvent(
  context: EventEmitterContext,
  orgId: string,
  event: string,
  payload: NotificationEventPayload
): Promise<string> {
  // Use the generic automation event emitter
  return emitAutomationEvent(context, orgId, event, payload);
}

export async function emitReminderEvent(
  context: EventEmitterContext,
  orgId: string,
  event: 'reminder_created' | 'reminder_updated' | 'reminder_completed' | 'reminder_snoozed' | 'reminder_sent' | 'reminder_cancelled',
  reminderId: string,
  title: string,
  priority: string,
  dueAt?: string,
  metadata?: Record<string, any>
): Promise<string> {
  // Use the generic reminder event emitter
  return emitGenericReminderEvent(context, orgId, event, reminderId, title, priority, dueAt, metadata);
}

export async function emitScheduleEvent(
  context: EventEmitterContext,
  orgId: string,
  event: 'schedule_created' | 'schedule_updated' | 'schedule_deleted',
  scheduleId: string,
  name: string,
  metadata?: Record<string, any>
): Promise<string> {
  // Use the generic schedule event emitter
  return emitGenericScheduleEvent(context, orgId, event, scheduleId, name, metadata);
}

export async function emitDueRemindersEvent(
  context: EventEmitterContext,
  orgId: string,
  reminderCount: number
): Promise<string> {
  const payload: NotificationEventPayload = {
    title: 'Due Reminders',
    message: `${reminderCount} reminder${reminderCount !== 1 ? 's' : ''} are due`,
    org_id: orgId,
    user_id: context.user.id,
    priority: 'high',
    metadata: {
      event_type: 'reminder.due',
      count: reminderCount,
    },
  };

  // Use the generic automation event emitter
  return emitAutomationEvent(context, orgId, 'reminder.due', payload);
}
