import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse, createErrorResponse, createNotFoundError } from '@/server/rest/errors';
import { withRateLimit, getRateLimitConfigForEndpoint } from '@/server/rest/ratelimit';
import { authenticateRequest, isOfflineMode, createMockAuthContext } from '@/server/rest/auth';
import { 
  validatePath,
  formatValidationError,
  ReminderResponse,
  UUIDSchema
} from '@/server/rest/validators';
import { z } from 'zod';
import { appRouter } from '@/server/api/root';

// POST /api/v1/reminders/[id]/complete - Mark reminder as complete
export const POST = withErrorHandling(
  withRateLimit(async (request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> => {
    // Authenticate request
    const auth = isOfflineMode() 
      ? createMockAuthContext('org-1')
      : await authenticateRequest(request);

    // Validate path parameters
    const pathValidation = validatePath(z.object({ id: UUIDSchema }), params);
    if (!pathValidation.success) {
      const error = formatValidationError(pathValidation.error);
      return createErrorResponse('INVALID_REQUEST', error.message, error.details);
    }

    const { id } = pathValidation.data;

    // Create tRPC caller
    const caller = appRouter.createCaller({
      user: auth.user,
      supabase: auth.supabase,
      posthog: null,
      headers: request.headers,
    });

    try {
      // Call tRPC procedure
      const reminder = await caller.scheduling.completeReminder({ id });

      if (!reminder) {
        return createNotFoundError('Reminder', id);
      }

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

      return createSuccessResponse(response);
    } catch (error) {
      console.error('Error completing reminder:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Failed to complete reminder');
    }
  }, getRateLimitConfigForEndpoint('POST', '/api/v1/reminders/[id]/complete'))
);
