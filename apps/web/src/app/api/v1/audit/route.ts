import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse, createErrorResponse } from '@/server/rest/errors';
import { withRateLimit, getRateLimitConfigForEndpoint } from '@/server/rest/ratelimit';
import { authenticateRequest, isOfflineMode, createMockAuthContext } from '@/server/rest/auth';
import { 
  ListAuditQuerySchema,
  validateQuery,
  formatValidationError,
  AuditLogResponse,
  ListAuditQuery
} from '@/server/rest/validators';
import { createPaginatedResponse, extractPaginationParams } from '@/server/rest/pagination';
import { appRouter } from '@starter/api';
import { logUsage } from '@/lib/usage/server';

// GET /api/v1/audit - List audit logs with filters
export const GET = withErrorHandling(
  withRateLimit(async (request: NextRequest): Promise<NextResponse> => {
    // Authenticate request
    const auth = isOfflineMode() 
      ? createMockAuthContext('org-1')
      : await authenticateRequest(request);

    // Extract and validate query parameters
    const url = new URL(request.url);
    const queryValidation = validateQuery(ListAuditQuerySchema, url.searchParams);
    if (!queryValidation.success) {
      const error = formatValidationError(queryValidation.error);
      return createErrorResponse('INVALID_REQUEST', error.message, error.details);
    }

    const query: ListAuditQuery = {
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
      usageLogger: logUsage,
      orgId: auth.orgId,
    });

    try {
      // Call tRPC procedure
      const result = await caller.audit.list({
        orgId: query.org_id || auth.orgId,
        q: query.q,
        entityType: query.entity_type,
        action: query.action,
        actorId: query.actor_id,
        from: query.from,
        to: query.to,
        cursor: pagination.cursor,
        limit: query.limit ?? 50,
      });

      // Transform to REST response format
      const response: AuditLogResponse[] = result.logs.map((log: any) => ({
        id: log.id,
        org_id: log.org_id,
        actor_id: log.actor_id,
        action: log.action,
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        metadata: log.metadata,
        created_at: log.created_at,
      }));

      return createSuccessResponse(createPaginatedResponse(
        response,
        pagination.limit,
        pagination.cursor,
        result.total
      ));
    } catch (error) {
      console.error('Error listing audit logs:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Failed to list audit logs');
    }
  }, getRateLimitConfigForEndpoint('GET', '/api/v1/audit'))
);
