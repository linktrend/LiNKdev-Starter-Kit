// REST API Validators
// Zod schemas for request/response validation

import { z } from 'zod';

// Common validation schemas
export const UUIDSchema = z.string().uuid('Invalid UUID format');
export const OrgIdSchema = z.string().uuid('Invalid organization ID');
export const UserIdSchema = z.string().uuid('Invalid user ID');
export const TimestampSchema = z.string().datetime('Invalid timestamp format');

// Pagination schemas
export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    nextCursor: z.string().optional(),
    total: z.number().optional(),
  });

// Organization schemas
export const CreateOrgRequestSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Name too long'),
});

export const OrgResponseSchema = z.object({
  id: UUIDSchema,
  name: z.string(),
  owner_id: UserIdSchema,
  created_at: TimestampSchema,
});

export const ListOrgsResponseSchema = z.array(OrgResponseSchema);

// Record schemas
export const CreateRecordRequestSchema = z.object({
  type_id: UUIDSchema,
  org_id: UUIDSchema.optional(),
  user_id: UUIDSchema.optional(),
  data: z.record(z.any()),
});

export const UpdateRecordRequestSchema = z.object({
  data: z.record(z.any()),
});

export const RecordResponseSchema = z.object({
  id: UUIDSchema,
  type_id: UUIDSchema,
  org_id: UUIDSchema.nullable(),
  user_id: UUIDSchema.nullable(),
  created_by: UserIdSchema,
  data: z.record(z.any()),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export const ListRecordsQuerySchema = z.object({
  type_id: UUIDSchema.optional(),
  org_id: UUIDSchema.optional(),
  user_id: UUIDSchema.optional(),
  q: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Reminder schemas
export const CreateReminderRequestSchema = z.object({
  org_id: UUIDSchema,
  record_id: UUIDSchema.optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  notes: z.string().optional(),
  due_at: TimestampSchema.optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export const ReminderResponseSchema = z.object({
  id: UUIDSchema,
  org_id: UUIDSchema,
  record_id: UUIDSchema.nullable(),
  title: z.string(),
  notes: z.string().nullable(),
  due_at: TimestampSchema.nullable(),
  status: z.enum(['pending', 'sent', 'completed', 'snoozed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  created_by: UserIdSchema,
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
  snoozed_until: TimestampSchema.nullable(),
  completed_at: TimestampSchema.nullable(),
  sent_at: TimestampSchema.nullable(),
});

export const ListRemindersQuerySchema = z.object({
  org_id: UUIDSchema,
  record_id: UUIDSchema.optional(),
  status: z.enum(['pending', 'sent', 'completed', 'snoozed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  q: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

// Billing schemas
export const SubscriptionResponseSchema = z.object({
  org_id: UUIDSchema,
  plan: z.string(),
  status: z.enum(['active', 'trialing', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused']),
  current_period_start: TimestampSchema,
  current_period_end: TimestampSchema,
  trial_end: TimestampSchema.nullable(),
  stripe_sub_id: z.string().nullable(),
  updated_at: TimestampSchema,
});

export const CreateCheckoutRequestSchema = z.object({
  org_id: UUIDSchema,
  plan: z.string().min(1, 'Plan is required'),
  success_url: z.string().url('Invalid success URL'),
  cancel_url: z.string().url('Invalid cancel URL'),
});

export const CheckoutResponseSchema = z.object({
  session_id: z.string(),
  url: z.string().url(),
  offline: z.boolean().optional(),
});

// Audit schemas
export const AuditLogResponseSchema = z.object({
  id: UUIDSchema,
  org_id: UUIDSchema,
  actor_id: UserIdSchema.nullable(),
  action: z.string(),
  entity_type: z.string(),
  entity_id: z.string(),
  metadata: z.record(z.any()),
  created_at: TimestampSchema,
});

export const ListAuditQuerySchema = z.object({
  org_id: UUIDSchema,
  q: z.string().optional(),
  entity_type: z.string().optional(),
  action: z.string().optional(),
  actor_id: UserIdSchema.optional(),
  from: TimestampSchema.optional(),
  to: TimestampSchema.optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

// Error schemas
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
  }),
});

// Request validation helpers
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

// Query parameter validation
export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const queryObject = Object.fromEntries(searchParams.entries());
  return validateRequest(schema, queryObject);
}

// Request body validation
export async function validateBody<T>(
  schema: z.ZodSchema<T>,
  request: Request
): Promise<{ success: true; data: T } | { success: false; error: z.ZodError }> {
  try {
    const body = await request.json();
    return validateRequest(schema, body);
  } catch (error) {
    return {
      success: false,
      error: new z.ZodError([{
        code: 'custom',
        message: 'Invalid JSON in request body',
        path: [],
      }]),
    };
  }
}

// Path parameter validation
export function validatePath<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, string | string[] | undefined>
): { success: true; data: T } | { success: false; error: z.ZodError } {
  return validateRequest(schema, params);
}

// Common validation error formatter
export function formatValidationError(error: z.ZodError): {
  code: string;
  message: string;
  details: Record<string, any>;
} {
  const fieldErrors: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(err.message);
  });

  return {
    code: 'validation_error',
    message: 'Request validation failed',
    details: {
      fields: fieldErrors,
    },
  };
}

// Type exports for use in route handlers
export type CreateOrgRequest = z.infer<typeof CreateOrgRequestSchema>;
export type OrgResponse = z.infer<typeof OrgResponseSchema>;
export type ListOrgsResponse = z.infer<typeof ListOrgsResponseSchema>;

export type CreateRecordRequest = z.infer<typeof CreateRecordRequestSchema>;
export type UpdateRecordRequest = z.infer<typeof UpdateRecordRequestSchema>;
export type RecordResponse = z.infer<typeof RecordResponseSchema>;
export type ListRecordsQuery = z.infer<typeof ListRecordsQuerySchema>;

export type CreateReminderRequest = z.infer<typeof CreateReminderRequestSchema>;
export type ReminderResponse = z.infer<typeof ReminderResponseSchema>;
export type ListRemindersQuery = z.infer<typeof ListRemindersQuerySchema>;

export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>;
export type CreateCheckoutRequest = z.infer<typeof CreateCheckoutRequestSchema>;
export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;

export type AuditLogResponse = z.infer<typeof AuditLogResponseSchema>;
export type ListAuditQuery = z.infer<typeof ListAuditQuerySchema>;

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
