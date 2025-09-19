import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse, createErrorResponse } from '@/server/rest/errors';
import { withRateLimit, getRateLimitConfigForEndpoint } from '@/server/rest/ratelimit';
import { authenticateRequest, isOfflineMode, createMockAuthContext } from '@/server/rest/auth';
import { 
  CreateRecordRequestSchema,
  ListRecordsQuerySchema,
  validateBody,
  validateQuery,
  formatValidationError,
  CreateRecordRequest,
  RecordResponse,
  ListRecordsQuery
} from '@/server/rest/validators';
import { createPaginatedResponse, extractPaginationParams } from '@/server/rest/pagination';
import { appRouter } from '@/server/api/root';

// GET /api/v1/records - List records with filters
export const GET = withErrorHandling(
  withRateLimit(async (request: NextRequest): Promise<NextResponse> => {
    // Authenticate request
    const auth = isOfflineMode() 
      ? createMockAuthContext('org-1')
      : await authenticateRequest(request);

    // Extract and validate query parameters
    const url = new URL(request.url);
    const queryValidation = validateQuery(ListRecordsQuerySchema, url.searchParams);
    if (!queryValidation.success) {
      const error = formatValidationError(queryValidation.error);
      return createErrorResponse('INVALID_REQUEST', error.message, error.details);
    }

    const query: ListRecordsQuery = {
      ...queryValidation.data,
      limit: queryValidation.data.limit ?? 50,
      sort_order: queryValidation.data.sort_order ?? 'desc',
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
      const result = await caller.records.listRecords({
        type_id: query.type_id,
        org_id: query.org_id || auth.orgId,
        user_id: query.user_id,
        limit: query.limit,
        offset: 0, // Cursor-based pagination
        search: query.q,
        sort_by: query.sort_by,
        sort_order: query.sort_order,
      });

      // Transform to REST response format
      const response: RecordResponse[] = result.records.map(record => ({
        id: record.id,
        type_id: record.type_id,
        org_id: record.org_id,
        user_id: record.user_id,
        created_by: record.created_by,
        data: record.data,
        created_at: record.created_at,
        updated_at: record.updated_at,
      }));

      return createSuccessResponse(createPaginatedResponse(
        response,
        pagination.limit,
        pagination.cursor,
        result.total
      ));
    } catch (error) {
      console.error('Error listing records:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Failed to list records');
    }
  }, getRateLimitConfigForEndpoint('GET', '/api/v1/records'))
);

// POST /api/v1/records - Create record
export const POST = withErrorHandling(
  withRateLimit(async (request: NextRequest): Promise<NextResponse> => {
    // Authenticate request
    const auth = isOfflineMode() 
      ? createMockAuthContext('org-1')
      : await authenticateRequest(request);

    // Validate request body
    const bodyValidation = await validateBody(CreateRecordRequestSchema, request);
    if (!bodyValidation.success) {
      const error = formatValidationError(bodyValidation.error);
      return createErrorResponse('INVALID_REQUEST', error.message, error.details);
    }

    const body: CreateRecordRequest = bodyValidation.data;

    // Create tRPC caller
    const caller = appRouter.createCaller({
      user: auth.user,
      supabase: auth.supabase,
      posthog: null,
      headers: request.headers,
    });

    try {
      // Call tRPC procedure
      const record = await caller.records.createRecord({
        type_id: body.type_id,
        org_id: body.org_id || auth.orgId,
        user_id: body.user_id,
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

      return createSuccessResponse(response, 201);
    } catch (error) {
      console.error('Error creating record:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Failed to create record');
    }
  }, getRateLimitConfigForEndpoint('POST', '/api/v1/records'))
);
