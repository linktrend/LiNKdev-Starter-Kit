// Records (Generic Entities) + CRUD Types

export interface RecordType {
  id: string;
  key: string;
  display_name: string;
  description?: string;
  config: RecordTypeConfig;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RecordTypeConfig {
  fields: RecordField[];
  is_public?: boolean;
  permissions?: RecordPermissions;
  validation?: RecordValidation;
}

export interface RecordField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'url' | 'date' | 'boolean' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: string[]; // For select fields
  validation?: FieldValidation;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  custom?: string;
}

export interface RecordPermissions {
  can_create?: string[]; // Role names
  can_read?: string[];   // Role names
  can_update?: string[]; // Role names
  can_delete?: string[]; // Role names
}

export interface RecordValidation {
  schema?: Record<string, any>; // JSON Schema
  custom_rules?: string[];
}

export interface RecordData {
  id: string;
  type_id: string;
  org_id?: string;
  user_id?: string;
  created_by: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Relations
  record_type?: RecordType;
}

export interface CreateRecordTypeInput {
  key: string;
  display_name: string;
  description?: string;
  config: RecordTypeConfig;
}

export interface UpdateRecordTypeInput {
  id: string;
  display_name?: string;
  description?: string;
  config?: RecordTypeConfig;
}

export interface CreateRecordInput {
  type_id: string;
  org_id?: string;
  user_id?: string;
  data: Record<string, any>;
}

export interface UpdateRecordInput {
  id: string;
  data: Record<string, any>;
}

export interface ListRecordsInput {
  type_id?: string;
  org_id?: string;
  user_id?: string;
  limit?: number;
  offset?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface RecordFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'not_in';
  value: any;
}

export interface RecordSearchResult {
  records: RecordData[];
  total: number;
  has_more: boolean;
}

// Form generation types
export interface FormFieldProps {
  field: RecordField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export interface RecordFormData {
  [key: string]: any;
}

// Analytics events
export interface RecordAnalyticsEvent {
  event: 'record_type_created' | 'record_created' | 'record_updated' | 'record_deleted';
  properties: {
    record_type_id?: string;
    record_id?: string;
    record_type_key?: string;
    org_id?: string;
    user_id?: string;
  };
}
