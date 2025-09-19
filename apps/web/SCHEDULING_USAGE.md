# Scheduling & Notifications Module

A flexible system for managing reminders, schedules, and notifications with event-driven architecture.

## Features

- **Reminders**: Create, manage, and track one-off and recurring reminders
- **Schedules**: Define recurring schedule patterns with cron expressions or custom rules
- **Notifications**: Event-driven notification system with outbox pattern
- **Organization Support**: Reminders and schedules belong to organizations
- **Offline Mode**: Works without external services when `TEMPLATE_OFFLINE=1`
- **Event Emission**: Automatic event tracking for all operations
- **Webhook Integration**: Ready for n8n automation integration

## Quick Start

### 1. Create a Reminder

```typescript
// Create a one-off reminder
const reminder = await api.scheduling.createReminder.mutate({
  org_id: 'your-org-id',
  title: 'Review quarterly report',
  notes: 'Check the Q4 financial report before the board meeting',
  due_at: '2024-01-15T09:00:00Z',
  priority: 'high',
});

// Create a reminder linked to a record
const reminder = await api.scheduling.createReminder.mutate({
  org_id: 'your-org-id',
  record_id: 'record-123', // Link to a record
  title: 'Follow up with client',
  notes: 'Call Acme Corp about the proposal',
  due_at: '2024-01-20T14:00:00Z',
  priority: 'medium',
});
```

### 2. List and Filter Reminders

```typescript
// List all reminders for an organization
const { reminders, total, has_more } = await api.scheduling.listReminders.query({
  org_id: 'your-org-id',
  limit: 50,
});

// Filter by status
const pendingReminders = await api.scheduling.listReminders.query({
  org_id: 'your-org-id',
  status: 'pending',
});

// Search reminders
const searchResults = await api.scheduling.listReminders.query({
  org_id: 'your-org-id',
  q: 'quarterly report',
});

// Filter by date range
const upcomingReminders = await api.scheduling.listReminders.query({
  org_id: 'your-org-id',
  from: '2024-01-01T00:00:00Z',
  to: '2024-01-31T23:59:59Z',
});
```

### 3. Manage Reminders

```typescript
// Complete a reminder
await api.scheduling.completeReminder.mutate({
  id: 'reminder-123',
});

// Snooze a reminder for 1 hour
await api.scheduling.snoozeReminder.mutate({
  id: 'reminder-123',
  minutes: 60,
});

// Update a reminder
await api.scheduling.updateReminder.mutate({
  id: 'reminder-123',
  title: 'Updated reminder title',
  priority: 'urgent',
  status: 'pending',
});

// Delete a reminder
await api.scheduling.deleteReminder.mutate({
  id: 'reminder-123',
});
```

### 4. Create Schedules

```typescript
// Create a daily schedule
const schedule = await api.scheduling.createSchedule.mutate({
  org_id: 'your-org-id',
  name: 'Daily Standup',
  description: 'Daily team standup meeting',
  cron: '0 9 * * 1-5', // Every weekday at 9 AM
});

// Create a weekly schedule
const weeklySchedule = await api.scheduling.createSchedule.mutate({
  org_id: 'your-org-id',
  name: 'Weekly Report',
  description: 'Generate weekly progress report',
  cron: '0 17 * * 5', // Every Friday at 5 PM
});

// Create a custom rule-based schedule
const customSchedule = await api.scheduling.createSchedule.mutate({
  org_id: 'your-org-id',
  name: 'Monthly Review',
  description: 'Monthly team performance review',
  rule: { 
    type: 'monthly', 
    day: 1, 
    time: '10:00',
    timezone: 'UTC'
  },
});
```

### 5. Get Statistics

```typescript
// Get reminder statistics
const stats = await api.scheduling.getReminderStats.query({
  org_id: 'your-org-id',
});

console.log(stats);
// {
//   total: 25,
//   pending: 8,
//   completed: 15,
//   overdue: 2,
//   due_today: 3
// }
```

## Priority Levels

| Priority | Color | Icon | Description |
|----------|-------|------|-------------|
| `low` | Green | Clock | Low priority tasks |
| `medium` | Yellow | Clock | Normal priority tasks |
| `high` | Orange | AlertCircle | Important tasks |
| `urgent` | Red | AlertCircle | Critical tasks |

## Status Types

| Status | Description |
|--------|-------------|
| `pending` | Awaiting action |
| `sent` | Notification sent |
| `completed` | Task completed |
| `snoozed` | Temporarily postponed |
| `cancelled` | Task cancelled |

## UI Components

### ReminderForm
```tsx
import { ReminderForm } from '@/components/scheduling/ReminderForm';

<ReminderForm
  orgId="org-123"
  initialData={existingData} // For editing
  onSave={(data) => console.log('Saved:', data)}
  onCancel={() => router.back()}
  isEditing={false}
/>
```

### ReminderTable
```tsx
import { ReminderTable } from '@/components/scheduling/ReminderTable';

<ReminderTable
  reminders={reminders}
  onEdit={(reminder) => editReminder(reminder)}
  onComplete={(reminder) => completeReminder(reminder)}
  onSnooze={(reminder) => snoozeReminder(reminder)}
  onDelete={(reminder) => deleteReminder(reminder)}
  isLoading={false}
/>
```

## Pages

- `/reminders` - Main reminders dashboard with stats and table
- `/reminders/new` - Create new reminder form
- `/reminders/[id]` - View reminder details and actions
- `/reminders/[id]/edit` - Edit reminder form

## Event System

The module emits events for all operations:

### Reminder Events
- `reminder_created` - When a new reminder is created
- `reminder_updated` - When a reminder is updated
- `reminder_completed` - When a reminder is marked complete
- `reminder_snoozed` - When a reminder is snoozed
- `reminder_sent` - When a reminder notification is sent
- `reminder_cancelled` - When a reminder is cancelled

### Schedule Events
- `schedule_created` - When a new schedule is created
- `schedule_updated` - When a schedule is updated
- `schedule_deleted` - When a schedule is deleted

### Notification Events
- `notification_enqueued` - When a notification is added to the outbox

## Webhook Integration

The module provides a webhook endpoint for n8n automation:

```
POST /api/hooks/n8n
```

**Headers:**
- `x-signature`: HMAC signature for verification

**Payload:**
```json
{
  "event": "reminder_created",
  "payload": {
    "reminder_id": "rem-123",
    "title": "Review quarterly report",
    "message": "Reminder: Review quarterly report",
    "due_at": "2024-01-15T09:00:00Z",
    "priority": "high",
    "org_id": "org-123",
    "user_id": "user-456",
    "metadata": {
      "event_type": "reminder_created"
    }
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "signature": "base64-encoded-signature"
}
```

## Offline Mode

When `TEMPLATE_OFFLINE=1` or Supabase is not configured, the module uses an in-memory store with sample data:

- Pre-configured sample reminders (overdue, pending, completed)
- Sample schedules (daily, weekly, monthly)
- Full CRUD functionality without external dependencies
- Event emission logs to console

## Database Schema

### reminders
- `id` - UUID primary key
- `org_id` - Organization ID (required)
- `record_id` - Optional record ID for linking
- `title` - Reminder title
- `notes` - Optional notes
- `due_at` - Due date and time
- `status` - Current status
- `priority` - Priority level
- `created_by` - User who created the reminder
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `snoozed_until` - Snooze expiration time
- `completed_at` - Completion timestamp
- `sent_at` - Notification sent timestamp

### schedules
- `id` - UUID primary key
- `org_id` - Organization ID (required)
- `name` - Schedule name
- `description` - Optional description
- `cron` - Cron expression for recurring schedules
- `rule` - JSON rule for custom schedules
- `active` - Whether schedule is active
- `created_by` - User who created the schedule
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### notifications_outbox
- `id` - UUID primary key
- `org_id` - Organization ID
- `event` - Event type
- `payload` - Event payload (JSONB)
- `created_at` - Creation timestamp
- `delivered_at` - Delivery timestamp
- `attempt_count` - Number of delivery attempts
- `error` - Error message if delivery failed
- `next_retry_at` - Next retry timestamp

## RLS Policies

- Users can only see reminders/schedules for their organization
- Full CRUD permissions based on organization membership
- Notifications outbox is read-only for users, write-only for system

## Example: Task Management System

```typescript
// 1. Create a task reminder
const taskReminder = await api.scheduling.createReminder.mutate({
  org_id: 'team-org',
  record_id: 'task-123', // Link to a task record
  title: 'Review pull request #456',
  notes: 'Check the implementation and provide feedback',
  due_at: '2024-01-15T17:00:00Z',
  priority: 'high',
});

// 2. Create a recurring schedule for daily standups
const standupSchedule = await api.scheduling.createSchedule.mutate({
  org_id: 'team-org',
  name: 'Daily Standup',
  description: 'Daily team standup meeting',
  cron: '0 9 * * 1-5', // Every weekday at 9 AM
});

// 3. Get overdue reminders
const overdueReminders = await api.scheduling.listReminders.query({
  org_id: 'team-org',
  status: 'pending',
  to: new Date().toISOString(), // All reminders due before now
});

// 4. Complete a reminder
await api.scheduling.completeReminder.mutate({
  id: taskReminder.id,
});
```

This module provides a solid foundation for building reminder and notification systems in your application.
