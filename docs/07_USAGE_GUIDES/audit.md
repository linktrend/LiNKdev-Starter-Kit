# Audit Logs Module

Immutable, org-scoped audit trail for tracking all activity within your organization.

## Overview

The Audit Logs module provides a comprehensive audit trail system that:
- **Immutable**: Once created, audit logs cannot be modified or deleted
- **Org-scoped**: All logs are scoped to specific organizations
- **Searchable**: Full-text search across actions, entities, and metadata
- **Exportable**: CSV export for compliance and analysis
- **Offline-capable**: Works in template mode without external dependencies

## Data Model

### audit_logs Table

```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### Immutability Guarantees

- **No UPDATE operations**: Database triggers prevent any updates to audit logs
- **No DELETE operations**: Database triggers prevent any deletions
- **Append-only**: New entries can only be added, never modified
- **Corrections**: If an error needs to be corrected, create a new audit log entry

## API Reference

### tRPC Procedures

#### `audit.append`
Append a new audit log entry (server-only).

```typescript
await api.audit.append.mutate({
  orgId: 'org-123',
  action: 'created',
  entityType: 'record',
  entityId: 'record-456',
  metadata: { name: 'New Record' }
});
```

#### `audit.list`
List audit logs with filtering and pagination.

```typescript
const { data } = api.audit.list.useQuery({
  orgId: 'org-123',
  q: 'search query',
  entityType: 'record',
  action: 'created',
  actorId: 'user-789',
  from: '2024-01-01T00:00:00Z',
  to: '2024-01-31T23:59:59Z',
  cursor: 'next-page-cursor',
  limit: 50
});
```

#### `audit.stats`
Get audit statistics for an organization.

```typescript
const { data } = api.audit.stats.useQuery({
  orgId: 'org-123',
  window: 'day' // 'hour', 'day', 'week', 'month'
});
```

#### `audit.exportCsv`
Export audit logs as CSV.

```typescript
const exportCsv = api.audit.exportCsv.useMutation();

const result = await exportCsv.mutateAsync({
  orgId: 'org-123',
  q: 'search query',
  entityType: 'record',
  action: 'created',
  from: '2024-01-01T00:00:00Z',
  to: '2024-01-31T23:59:59Z'
});

// Download CSV
const blob = new Blob([result.csv], { type: 'text/csv' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'audit-logs.csv';
a.click();
```

## Integration Hooks

### Server-side Integration

Use the provided hooks to log events from your modules:

```typescript
import { logOrgEvent, logRecordEvent, logBillingEvent } from '@/server/audit/hooks';

// In your tRPC procedure
await logOrgEvent(
  { orgId: 'org-123', actorId: ctx.user.id, supabase: ctx.supabase },
  'created',
  'org-123',
  { name: 'New Organization' }
);

await logRecordEvent(
  { orgId: 'org-123', actorId: ctx.user.id, supabase: ctx.supabase },
  'updated',
  'record-456',
  { changes: { name: 'Updated Name' } }
);
```

### Available Hooks

- `logOrgEvent()` - Organization events
- `logRecordEvent()` - Record events  
- `logReminderEvent()` - Reminder events
- `logBillingEvent()` - Billing events
- `logMemberEvent()` - Member events
- `logScheduleEvent()` - Schedule events
- `logAutomationEvent()` - Automation events

## UI Components

### AuditTable

Display audit logs in a table format with expandable details.

```typescript
import { AuditTable } from '@/components/audit/AuditTable';

<AuditTable
  logs={logs}
  isLoading={isLoading}
  onLoadMore={handleLoadMore}
  hasMore={hasMore}
/>
```

### AuditFilters

Filter and search audit logs.

```typescript
import { AuditFilters } from '@/components/audit/AuditFilters';

<AuditFilters
  filters={filters}
  onFiltersChange={handleFiltersChange}
  onExport={handleExport}
  isLoading={isExporting}
/>
```

## Entity Types and Actions

### Entity Types
- `org` - Organization
- `record` - Record
- `reminder` - Reminder
- `subscription` - Subscription
- `member` - Organization member
- `invite` - Member invitation
- `schedule` - Recurring schedule
- `automation` - Automation event

### Common Actions
- `created` - Entity was created
- `updated` - Entity was updated
- `deleted` - Entity was deleted
- `completed` - Task/reminder completed
- `cancelled` - Task/reminder cancelled
- `invited` - User was invited
- `accepted` - Invitation was accepted
- `rejected` - Invitation was rejected
- `role_changed` - User role was changed
- `removed` - User was removed
- `started` - Process started
- `stopped` - Process stopped
- `failed` - Process failed
- `succeeded` - Process succeeded

## Filtering and Search

### Search Query
The `q` parameter performs full-text search across:
- Action names
- Entity types
- Entity IDs
- Metadata content (JSON)

### Filters
- **Entity Type**: Filter by specific entity types
- **Action**: Filter by specific actions
- **Actor ID**: Filter by user who performed the action
- **Date Range**: Filter by creation date
- **Search**: Full-text search across all fields

### Pagination
- **Cursor-based**: Use `cursor` and `limit` for efficient pagination
- **Has More**: Check `has_more` to determine if more results exist
- **Next Cursor**: Use `next_cursor` for the next page

## Offline Mode

When `TEMPLATE_OFFLINE=1` or Supabase is not configured:
- Uses in-memory store with sample data
- Full API surface available
- Deterministic mock data for development
- All features work without external dependencies

## Analytics Events

The module emits these analytics events:
- `audit.appended` - When a new audit log is created
- `audit.viewed` - When audit logs are viewed
- `audit.filtered` - When filters are applied
- `audit.exported` - When CSV export is performed

## Security

### Row Level Security (RLS)
- Organization members can only view audit logs for their organization
- Only server-side code can insert audit logs
- No direct user inserts allowed

### Immutability
- Database triggers prevent updates and deletes
- Application-level checks ensure data integrity
- Corrections are handled by creating new entries

## Performance

### Indexes
- `idx_audit_logs_org_id` - Organization lookups
- `idx_audit_logs_created_at` - Time-based queries
- `idx_audit_logs_entity` - Entity type/ID lookups
- `idx_audit_logs_actor` - Actor lookups
- `idx_audit_logs_action` - Action lookups
- `idx_audit_logs_org_created` - Composite org + time queries

### Query Optimization
- Cursor-based pagination for large datasets
- Efficient filtering with proper indexes
- Statistics calculated at database level

## Example Usage

### Basic Audit Logging

```typescript
// In your tRPC procedure
const { data: record } = await api.records.createRecord.mutate({
  typeId: 'contact',
  orgId: 'org-123',
  data: { name: 'John Doe', email: 'john@example.com' }
});

// Log the creation
await api.audit.append.mutate({
  orgId: 'org-123',
  action: 'created',
  entityType: 'record',
  entityId: record.id,
  metadata: { 
    type: 'contact',
    name: 'John Doe',
    email: 'john@example.com'
  }
});
```

### Advanced Filtering

```typescript
// Get all record updates in the last week
const { data } = api.audit.list.useQuery({
  orgId: 'org-123',
  entityType: 'record',
  action: 'updated',
  from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  limit: 100
});
```

### Statistics Dashboard

```typescript
// Get daily statistics
const { data: stats } = api.audit.stats.useQuery({
  orgId: 'org-123',
  window: 'day'
});

console.log('Total events:', stats.total);
console.log('Most common action:', Object.entries(stats.by_action).sort(([,a], [,b]) => b - a)[0]);
console.log('Entity breakdown:', stats.by_entity_type);
```

## Testing

Run the audit tests:

```bash
pnpm test audit
```

The module includes comprehensive tests for:
- Offline store functionality
- Filtering and pagination
- Statistics calculation
- CSV export
- Immutability guarantees
- Error handling

## Troubleshooting

### Common Issues

1. **No audit logs appearing**: Check that the organization ID is correct and the user is a member
2. **Filter not working**: Ensure filter values match the expected format (e.g., entity types are lowercase)
3. **Export failing**: Check that the organization has audit logs and the user has permission
4. **Performance issues**: Consider adding additional indexes for your specific query patterns

### Debug Mode

Enable debug logging by setting `DEBUG=audit` in your environment variables.

## Migration

To add audit logging to existing modules:

1. Import the appropriate hook function
2. Add logging calls after successful operations
3. Include relevant metadata for context
4. Test in both online and offline modes

Example:

```typescript
// Before
const record = await createRecord(data);

// After  
const record = await createRecord(data);
await logRecordEvent(
  { orgId, actorId: ctx.user.id, supabase: ctx.supabase },
  'created',
  record.id,
  { type: record.type, name: record.name }
);
```
