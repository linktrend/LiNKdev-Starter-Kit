# Records (Generic Entities) + CRUD Module

A flexible system for creating and managing arbitrary entities with custom fields.

## Features

- **Dynamic Record Types**: Define custom entity schemas with flexible field types
- **Custom Fields**: Support for text, number, email, date, boolean, select, and textarea fields
- **Organization Support**: Records can belong to organizations or individual users
- **Offline Mode**: Works without external services when `TEMPLATE_OFFLINE=1`
- **Full CRUD**: Create, read, update, and delete records
- **Search & Filter**: Built-in search and filtering capabilities
- **Analytics**: Automatic event tracking for record operations

## Quick Start

### 1. Define a Record Type

```typescript
// Create a contact record type
const contactType = await api.records.createRecordType.mutate({
  key: 'contact',
  display_name: 'Contact',
  description: 'Customer or business contact',
  config: {
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'company', label: 'Company', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    is_public: true,
  },
});
```

### 2. Create Records

```typescript
// Create a new contact record
const contact = await api.records.createRecord.mutate({
  type_id: contactType.id,
  org_id: 'your-org-id', // Optional
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-0123',
    company: 'Acme Corp',
    notes: 'Important client',
  },
});
```

### 3. Query Records

```typescript
// List all records of a type
const { records, total, has_more } = await api.records.listRecords.query({
  type_id: contactType.id,
  org_id: 'your-org-id',
  limit: 50,
  search: 'john',
});

// Get a specific record
const record = await api.records.getRecord.query({
  id: 'record-id',
});
```

## Field Types

| Type | Description | Validation |
|------|-------------|------------|
| `text` | Single line text | Required, min/max length |
| `email` | Email address | Email format validation |
| `url` | URL | URL format validation |
| `number` | Numeric value | Min/max values |
| `date` | Date picker | Date format (YYYY-MM-DD) |
| `boolean` | Checkbox/switch | True/false |
| `select` | Dropdown | Options array |
| `textarea` | Multi-line text | Required, min/max length |

## Field Configuration

```typescript
{
  key: 'field_name',           // Unique field identifier
  label: 'Display Name',       // User-friendly label
  type: 'text',               // Field type
  required: true,             // Whether field is required
  placeholder: 'Enter text',  // Placeholder text
  description: 'Help text',   // Field description
  options: ['A', 'B', 'C'],   // For select fields
  validation: {               // Field validation rules
    min: 3,                   // Minimum length/value
    max: 100,                 // Maximum length/value
    pattern: '^[A-Z]+$',      // Regex pattern
  }
}
```

## UI Components

### RecordForm
```tsx
import { RecordForm } from '@/components/records/RecordForm';

<RecordForm
  recordType={recordType}
  initialData={existingData} // For editing
  onSave={(data) => console.log('Saved:', data)}
  onCancel={() => router.back()}
  isEditing={false}
/>
```

### RecordTable
```tsx
import { RecordTable } from '@/components/records/RecordTable';

<RecordTable
  records={records}
  recordType={recordType}
  onEdit={(record) => editRecord(record)}
  onDelete={(record) => deleteRecord(record)}
  onView={(record) => viewRecord(record)}
  isLoading={false}
/>
```

## Pages

- `/records` - Main records dashboard
- `/records/new?type=<typeId>` - Create new record
- `/records/[id]` - View record details
- `/records/[id]/edit` - Edit record

## Offline Mode

When `TEMPLATE_OFFLINE=1` or Supabase is not configured, the module uses an in-memory store with sample data:

- Pre-configured "Contact" and "Task" record types
- Sample records for development
- Full CRUD functionality without external dependencies

## Analytics Events

The module automatically tracks these events:

- `record_type_created` - When a new record type is created
- `record_created` - When a new record is created
- `record_updated` - When a record is updated
- `record_deleted` - When a record is deleted

## Database Schema

### record_types
- `id` - UUID primary key
- `key` - Unique identifier (e.g., 'contact')
- `display_name` - Human-readable name
- `description` - Optional description
- `config` - JSONB field configuration
- `created_by` - User who created the type

### records
- `id` - UUID primary key
- `type_id` - References record_types.id
- `org_id` - Optional organization ID
- `user_id` - Optional user ID
- `created_by` - User who created the record
- `data` - JSONB field data
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## RLS Policies

- Users can only see record types they created or that are public
- Users can only see records they created or that belong to their organization
- Full CRUD permissions based on ownership and organization membership

## Example: Task Management

```typescript
// 1. Create task record type
const taskType = await api.records.createRecordType.mutate({
  key: 'task',
  display_name: 'Task',
  config: {
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', 
        options: ['todo', 'in_progress', 'done'], required: true },
      { key: 'priority', label: 'Priority', type: 'select',
        options: ['low', 'medium', 'high'] },
      { key: 'due_date', label: 'Due Date', type: 'date' },
    ],
  },
});

// 2. Create tasks
await api.records.createRecord.mutate({
  type_id: taskType.id,
  data: {
    title: 'Review proposal',
    description: 'Review the Q1 proposal and provide feedback',
    status: 'in_progress',
    priority: 'high',
    due_date: '2024-01-15',
  },
});

// 3. Query tasks
const { records: tasks } = await api.records.listRecords.query({
  type_id: taskType.id,
  search: 'proposal',
});
```

This module provides a solid foundation for building flexible data management features in your application.
