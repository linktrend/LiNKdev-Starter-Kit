// Scheduling & Notifications Types

export type ReminderStatus = 'pending' | 'sent' | 'completed' | 'snoozed' | 'cancelled';
export type ReminderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Reminder {
  id: string;
  org_id: string;
  record_id?: string;
  title: string;
  notes?: string;
  due_at?: string;
  status: ReminderStatus;
  priority: ReminderPriority;
  created_by: string;
  created_at: string;
  updated_at: string;
  snoozed_until?: string;
  completed_at?: string;
  sent_at?: string;
  // Relations
  record?: any; // RecordData from records module
}

export interface Schedule {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  cron?: string;
  rule?: Record<string, any>;
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationEvent {
  id: string;
  org_id: string;
  event: string;
  payload: Record<string, any>;
  created_at: string;
  delivered_at?: string;
  attempt_count: number;
  error?: string;
  next_retry_at?: string;
}

// Input types for API
export interface CreateReminderInput {
  org_id: string;
  record_id?: string;
  title: string;
  notes?: string;
  due_at?: string;
  priority?: ReminderPriority;
}

export interface UpdateReminderInput {
  id: string;
  title?: string;
  notes?: string;
  due_at?: string;
  priority?: ReminderPriority;
  status?: ReminderStatus;
}

export interface SnoozeReminderInput {
  id: string;
  minutes: number;
}

export interface CompleteReminderInput {
  id: string;
}

export interface CreateScheduleInput {
  org_id: string;
  name: string;
  description?: string;
  cron?: string;
  rule?: Record<string, any>;
}

export interface UpdateScheduleInput {
  id: string;
  name?: string;
  description?: string;
  cron?: string;
  rule?: Record<string, any>;
  active?: boolean;
}

export interface ListRemindersInput {
  org_id: string;
  status?: ReminderStatus;
  from?: string;
  to?: string;
  q?: string; // search query
  limit?: number;
  offset?: number;
}

export interface ListSchedulesInput {
  org_id: string;
  active?: boolean;
}

// Event types for analytics
export interface SchedulingAnalyticsEvent {
  event: 'reminder_created' | 'reminder_updated' | 'reminder_completed' | 'reminder_snoozed' | 'reminder_sent' | 'reminder_cancelled' | 'schedule_created' | 'schedule_updated' | 'schedule_deleted' | 'notification_enqueued';
  properties: {
    reminder_id?: string;
    schedule_id?: string;
    org_id: string;
    user_id: string;
    priority?: ReminderPriority;
    status?: ReminderStatus;
    event_type?: string;
  };
}

// Notification event types
export interface NotificationEventPayload {
  reminder_id?: string;
  schedule_id?: string;
  title: string;
  message: string;
  due_at?: string;
  priority: ReminderPriority;
  org_id: string;
  user_id: string;
  metadata?: Record<string, any>;
}

// Webhook types
export interface WebhookPayload {
  event: string;
  payload: NotificationEventPayload;
  timestamp: string;
  signature: string;
}

// Form types
export interface ReminderFormData {
  title: string;
  notes?: string;
  due_at?: string;
  priority: ReminderPriority;
  record_id?: string;
}

export interface ScheduleFormData {
  name: string;
  description?: string;
  cron?: string;
  rule?: Record<string, any>;
  active: boolean;
}

// Utility types
export interface ReminderFilters {
  status?: ReminderStatus;
  priority?: ReminderPriority;
  from?: Date;
  to?: Date;
  search?: string;
}

export interface ReminderStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  due_today: number;
}
