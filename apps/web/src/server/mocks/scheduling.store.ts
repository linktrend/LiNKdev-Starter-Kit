// Offline fallback store for Scheduling & Notifications module
// Used when TEMPLATE_OFFLINE=1 or Supabase is not configured

import { 
  Reminder, 
  Schedule, 
  NotificationEvent, 
  CreateReminderInput, 
  UpdateReminderInput, 
  SnoozeReminderInput, 
  CompleteReminderInput,
  CreateScheduleInput,
  UpdateScheduleInput,
  ListRemindersInput,
  ListSchedulesInput,
  ReminderStatus,
  ReminderPriority,
  NotificationEventPayload
} from '@/types/scheduling';

interface SchedulingStore {
  reminders: Map<string, Reminder>;
  schedules: Map<string, Schedule>;
  notifications: NotificationEvent[];
}

class InMemorySchedulingStore {
  private store: SchedulingStore = {
    reminders: new Map(),
    schedules: new Map(),
    notifications: [],
  };

  // Reminders Management
  createReminder(input: CreateReminderInput, createdBy: string): Reminder {
    const reminder: Reminder = {
      id: `reminder-${Date.now()}`,
      org_id: input.org_id,
      record_id: input.record_id,
      title: input.title,
      notes: input.notes,
      due_at: input.due_at,
      status: 'pending',
      priority: input.priority || 'medium',
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.store.reminders.set(reminder.id, reminder);
    console.log('SCHEDULING MODULE: offline fallback - created reminder', reminder.id);
    return reminder;
  }

  getReminder(id: string): Reminder | null {
    return this.store.reminders.get(id) || null;
  }

  listReminders(input: ListRemindersInput): { reminders: Reminder[]; total: number; has_more: boolean } {
    let reminders = Array.from(this.store.reminders.values())
      .filter(r => r.org_id === input.org_id);
    
    // Filter by status
    if (input.status) {
      reminders = reminders.filter(r => r.status === input.status);
    }
    
    // Filter by date range
    if (input.from) {
      const fromDate = new Date(input.from);
      reminders = reminders.filter(r => !r.due_at || new Date(r.due_at) >= fromDate);
    }
    if (input.to) {
      const toDate = new Date(input.to);
      reminders = reminders.filter(r => !r.due_at || new Date(r.due_at) <= toDate);
    }
    
    // Search
    if (input.q) {
      const searchLower = input.q.toLowerCase();
      reminders = reminders.filter(r => 
        r.title.toLowerCase().includes(searchLower) ||
        (r.notes && r.notes.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by due_at (ascending), then by created_at (descending)
    reminders.sort((a, b) => {
      if (a.due_at && b.due_at) {
        return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
      }
      if (a.due_at && !b.due_at) return -1;
      if (!a.due_at && b.due_at) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    const total = reminders.length;
    const limit = input.limit || 50;
    const offset = input.offset || 0;
    const paginatedReminders = reminders.slice(offset, offset + limit);
    
    return {
      reminders: paginatedReminders,
      total,
      has_more: offset + limit < total,
    };
  }

  updateReminder(id: string, updates: UpdateReminderInput): Reminder | null {
    const reminder = this.store.reminders.get(id);
    if (!reminder) return null;
    
    const updated = { 
      ...reminder, 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    this.store.reminders.set(id, updated);
    console.log('SCHEDULING MODULE: offline fallback - updated reminder', id);
    return updated;
  }

  snoozeReminder(id: string, minutes: number): Reminder | null {
    const reminder = this.store.reminders.get(id);
    if (!reminder) return null;
    
    const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000);
    const updated = {
      ...reminder,
      status: 'snoozed' as ReminderStatus,
      snoozed_until: snoozedUntil.toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.store.reminders.set(id, updated);
    console.log('SCHEDULING MODULE: offline fallback - snoozed reminder', id, 'until', snoozedUntil);
    return updated;
  }

  completeReminder(id: string): Reminder | null {
    const reminder = this.store.reminders.get(id);
    if (!reminder) return null;
    
    const updated = {
      ...reminder,
      status: 'completed' as ReminderStatus,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.store.reminders.set(id, updated);
    console.log('SCHEDULING MODULE: offline fallback - completed reminder', id);
    return updated;
  }

  deleteReminder(id: string): boolean {
    const existed = this.store.reminders.has(id);
    this.store.reminders.delete(id);
    console.log('SCHEDULING MODULE: offline fallback - deleted reminder', id);
    return existed;
  }

  // Schedules Management
  createSchedule(input: CreateScheduleInput, createdBy: string): Schedule {
    const schedule: Schedule = {
      id: `schedule-${Date.now()}`,
      org_id: input.org_id,
      name: input.name,
      description: input.description,
      cron: input.cron,
      rule: input.rule,
      active: true,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.store.schedules.set(schedule.id, schedule);
    console.log('SCHEDULING MODULE: offline fallback - created schedule', schedule.id);
    return schedule;
  }

  getSchedule(id: string): Schedule | null {
    return this.store.schedules.get(id) || null;
  }

  listSchedules(input: ListSchedulesInput): Schedule[] {
    let schedules = Array.from(this.store.schedules.values())
      .filter(s => s.org_id === input.org_id);
    
    if (input.active !== undefined) {
      schedules = schedules.filter(s => s.active === input.active);
    }
    
    // Sort by created_at (descending)
    schedules.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return schedules;
  }

  updateSchedule(id: string, updates: UpdateScheduleInput): Schedule | null {
    const schedule = this.store.schedules.get(id);
    if (!schedule) return null;
    
    const updated = { 
      ...schedule, 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    this.store.schedules.set(id, updated);
    console.log('SCHEDULING MODULE: offline fallback - updated schedule', id);
    return updated;
  }

  deleteSchedule(id: string): boolean {
    const existed = this.store.schedules.has(id);
    this.store.schedules.delete(id);
    console.log('SCHEDULING MODULE: offline fallback - deleted schedule', id);
    return existed;
  }

  // Notifications Management
  emitNotificationEvent(orgId: string, event: string, payload: NotificationEventPayload): string {
    const notification: NotificationEvent = {
      id: `notification-${Date.now()}`,
      org_id: orgId,
      event,
      payload,
      created_at: new Date().toISOString(),
      attempt_count: 0,
    };
    
    this.store.notifications.push(notification);
    console.log('SCHEDULING MODULE: offline fallback - emitted notification event', event, 'for org', orgId);
    return notification.id;
  }

  getNotifications(orgId: string, limit = 50): NotificationEvent[] {
    return this.store.notifications
      .filter(n => n.org_id === orgId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  markNotificationDelivered(id: string): boolean {
    const notification = this.store.notifications.find(n => n.id === id);
    if (!notification) return false;
    
    notification.delivered_at = new Date().toISOString();
    console.log('SCHEDULING MODULE: offline fallback - marked notification delivered', id);
    return true;
  }

  // Utility methods
  getDueReminders(orgId: string): Reminder[] {
    const now = new Date();
    return Array.from(this.store.reminders.values())
      .filter(r => 
        r.org_id === orgId && 
        r.status === 'pending' && 
        r.due_at && 
        new Date(r.due_at) <= now
      );
  }

  getOverdueReminders(orgId: string): Reminder[] {
    const now = new Date();
    return Array.from(this.store.reminders.values())
      .filter(r => 
        r.org_id === orgId && 
        r.status === 'pending' && 
        r.due_at && 
        new Date(r.due_at) < now
      );
  }

  getReminderStats(orgId: string) {
    const reminders = Array.from(this.store.reminders.values())
      .filter(r => r.org_id === orgId);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    return {
      total: reminders.length,
      pending: reminders.filter(r => r.status === 'pending').length,
      completed: reminders.filter(r => r.status === 'completed').length,
      overdue: reminders.filter(r => 
        r.status === 'pending' && 
        r.due_at && 
        new Date(r.due_at) < now
      ).length,
      due_today: reminders.filter(r => 
        r.status === 'pending' && 
        r.due_at && 
        new Date(r.due_at) >= today && 
        new Date(r.due_at) < tomorrow
      ).length,
    };
  }

  // Seed with sample data for development
  seedSampleData(orgId: string, userId: string): void {
    console.log('SCHEDULING MODULE: offline fallback - seeding sample data');
    
    // Create sample reminders
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    this.createReminder({
      org_id: orgId,
      title: 'Review quarterly report',
      notes: 'Check the Q4 financial report before the board meeting',
      due_at: tomorrow.toISOString(),
      priority: 'high',
    }, userId);
    
    this.createReminder({
      org_id: orgId,
      title: 'Team standup meeting',
      notes: 'Daily standup at 9 AM',
      due_at: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      priority: 'medium',
    }, userId);
    
    this.createReminder({
      org_id: orgId,
      title: 'Client follow-up call',
      notes: 'Follow up with Acme Corp about the proposal',
      due_at: nextWeek.toISOString(),
      priority: 'medium',
    }, userId);
    
    this.createReminder({
      org_id: orgId,
      title: 'Update project documentation',
      notes: 'Update the API documentation for the new features',
      due_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago (overdue)
      priority: 'low',
    }, userId);
    
    // Create sample schedules
    this.createSchedule({
      org_id: orgId,
      name: 'Daily Standup',
      description: 'Daily team standup meeting',
      cron: '0 9 * * 1-5', // Every weekday at 9 AM
    }, userId);
    
    this.createSchedule({
      org_id: orgId,
      name: 'Weekly Report',
      description: 'Generate weekly progress report',
      cron: '0 17 * * 5', // Every Friday at 5 PM
    }, userId);
    
    this.createSchedule({
      org_id: orgId,
      name: 'Monthly Review',
      description: 'Monthly team performance review',
      rule: { type: 'monthly', day: 1, time: '10:00' },
    }, userId);
  }
}

// Singleton instance
export const schedulingStore = new InMemorySchedulingStore();
