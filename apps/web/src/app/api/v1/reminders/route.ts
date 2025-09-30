import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse, createErrorResponse } from '@/server/rest/errors';
import { withRateLimit, getRateLimitConfigForEndpoint } from '@/server/rest/ratelimit';
import { authenticateRequest, isOfflineMode, createMockAuthContext } from '@/server/rest/auth';
import { 
  CreateReminderRequestSchema,
  ListRemindersQuerySchema,
  validateBody,
  validateQuery,
  formatValidationError,
  CreateReminderRequest,
  ReminderResponse,
  ListRemindersQuery
} from '@/server/rest/validators';
import { createPaginatedResponse, extractPaginationParams } from '@/server/rest/pagination';
import { appRouter } from '@starter/api';

// GET /api/v1/reminders - List reminders with filters
export const GET = withErrorHandling(
  withRateLimit(async (request: NextRequest): Promise<NextResponse> => {
    // Authenticate request
    const auth = isOfflineMode() 
      ? createMockAuthContext('org-1')
      : await authenticateRequest(request);

    // Extract and validate query parameters
    const url = new URL(request.url);
    const queryValidation = validateQuery(ListRemindersQuerySchema, url.searchParams);
    if (!queryValidation.success) {
      const error = formatValidationError(queryValidation.error);
      return createErrorResponse('INVALID_REQUEST', error.message, error.details);
    }

    const query: ListRemindersQuery = {
      ...queryValidation.data,
      limit: queryValidation.data.limit ?? 50,
    };
    const pagination = extractPaginationParams(url.searchParams);

    // Create tRPC caller
    const caller = appRouter.createCaller({
      user: auth.user,
      supabase: auth.supabase,
      posthog: null,
      headers: request.headers,
    });

    try {
      // Call tRPC procedure
      const result = await caller.scheduling.listReminders({
        org_id: query.org_id || auth.orgId,
        ...(query.record_id && { record_id: query.record_id }),
        status: query.status,
        ...(query.priority && { priority: query.priority }),
        q: query.q,
        limit: query.limit,
        offset: 0, // Cursor-based pagination
      });

      // Transform to REST response format
      const response: ReminderResponse[] = result.reminders.map((reminder: any) => ({
        id: reminder.id,
        org_id: reminder.org_id,
        record_id: reminder.record_id,
        title: reminder.title,
        notes: reminder.notes,
        due_at: reminder.due_at,
        status: reminder.status,
        priority: reminder.priority,
        created_by: reminder.created_by,
        created_at: reminder.created_at,
        updated_at: reminder.updated_at,
        snoozed_until: reminder.snoozed_until,
        completed_at: reminder.completed_at,
        sent_at: reminder.sent_at,
      }));

      return createSuccessResponse(createPaginatedResponse(
        response,
        pagination.limit,
        pagination.cursor,
        result.total
      ));
    } catch (error) {
      console.error('Error listing reminders:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Failed to list reminders');
    }
  }, getRateLimitConfigForEndpoint('GET', '/api/v1/reminders'))
);

// POST /api/v1/reminders - Create reminder
export const POST = withErrorHandling(
  withRateLimit(async (request: NextRequest): Promise<NextResponse> => {
    // Authenticate request
    const auth = isOfflineMode() 
      ? createMockAuthContext('org-1')
      : await authenticateRequest(request);

    // Validate request body
    const bodyValidation = await validateBody(CreateReminderRequestSchema, request);
    if (!bodyValidation.success) {
      const error = formatValidationError(bodyValidation.error);
      return createErrorResponse('INVALID_REQUEST', error.message, error.details);
    }

    const body: CreateReminderRequest = {
      ...bodyValidation.data,
      priority: bodyValidation.data.priority ?? 'medium',
    };

    // Create tRPC caller
    const caller = appRouter.createCaller({
      user: auth.user,
      supabase: auth.supabase,
      posthog: null,
      headers: request.headers,
    });

    try {
      // Call tRPC procedure
      const reminder = await caller.scheduling.createReminder({
        org_id: body.org_id || auth.orgId,
        record_id: body.record_id,
        title: body.title,
        notes: body.notes,
        due_at: body.due_at,
        priority: body.priority,
      });

      // Transform to REST response format
      const response: ReminderResponse = {
        id: reminder.id,
        org_id: reminder.org_id,
        record_id: reminder.record_id,
        title: reminder.title,
        notes: reminder.notes,
        due_at: reminder.due_at,
        status: reminder.status,
        priority: reminder.priority,
        created_by: reminder.created_by,
        created_at: reminder.created_at,
        updated_at: reminder.updated_at,
        snoozed_until: reminder.snoozed_until,
        completed_at: reminder.completed_at,
        sent_at: reminder.sent_at,
      };

      return createSuccessResponse(response, 201);
    } catch (error) {
      console.error('Error creating reminder:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Failed to create reminder');
    }
  }, getRateLimitConfigForEndpoint('POST', '/api/v1/reminders'))
);
