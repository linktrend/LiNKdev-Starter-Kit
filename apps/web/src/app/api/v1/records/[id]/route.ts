import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse, createErrorResponse, createNotFoundError } from '@/server/rest/errors';
import { withRateLimit, getRateLimitConfigForEndpoint } from '@/server/rest/ratelimit';
import { authenticateRequest, isOfflineMode, createMockAuthContext } from '@/server/rest/auth';
import { 
  UpdateRecordRequestSchema,
  validateBody,
  validatePath,
  formatValidationError,
  UpdateRecordRequest,
  RecordResponse,
  UUIDSchema
} from '@/server/rest/validators';
import { z } from 'zod';
import { appRouter } from '@/server/api/root';

// GET /api/v1/records/[id] - Get single record
export const GET = withErrorHandling(
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
      const record = await caller.records.getRecord({ id });

      if (!record) {
        return createNotFoundError('Record', id);
      }

      // Transform to REST response format
      const response: RecordResponse = {
        id: record.id,
        type_id: record.type_id,
        org_id: record.org_id,
        user_id: record.user_id,
        created_by: record.created_by,
        data: record.data,
        created_at: record.created_at,
        updated_at: record.updated_at,
      };

      return createSuccessResponse(response);
    } catch (error) {
      console.error('Error getting record:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Failed to get record');
    }
  }, getRateLimitConfigForEndpoint('GET', '/api/v1/records/[id]'))
);

// PATCH /api/v1/records/[id] - Update record
export const PATCH = withErrorHandling(
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

    // Validate request body
    const bodyValidation = await validateBody(UpdateRecordRequestSchema, request);
    if (!bodyValidation.success) {
      const error = formatValidationError(bodyValidation.error);
      return createErrorResponse('INVALID_REQUEST', error.message, error.details);
    }

    const body: UpdateRecordRequest = bodyValidation.data;

    // Create tRPC caller
    const caller = appRouter.createCaller({
      user: auth.user,
      supabase: auth.supabase,
      posthog: null,
      headers: request.headers,
    });

    try {
      // Call tRPC procedure
      const record = await caller.records.updateRecord({
        id,
        data: body.data,
      });

      // Transform to REST response format
      const response: RecordResponse = {
        id: record.id,
        type_id: record.type_id,
        org_id: record.org_id,
        user_id: record.user_id,
        created_by: record.created_by,
        data: record.data,
        created_at: record.created_at,
        updated_at: record.updated_at,
      };

      return createSuccessResponse(response);
    } catch (error) {
      console.error('Error updating record:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Failed to update record');
    }
  }, getRateLimitConfigForEndpoint('PATCH', '/api/v1/records/[id]'))
);

// DELETE /api/v1/records/[id] - Delete record
export const DELETE = withErrorHandling(
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
      await caller.records.deleteRecord({ id });

      return createSuccessResponse({ success: true });
    } catch (error) {
      console.error('Error deleting record:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Failed to delete record');
    }
  }, getRateLimitConfigForEndpoint('DELETE', '/api/v1/records/[id]'))
);
