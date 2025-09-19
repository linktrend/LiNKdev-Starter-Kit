import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse, createErrorResponse } from '@/server/rest/errors';
import { withRateLimit, getRateLimitConfigForEndpoint } from '@/server/rest/ratelimit';
import { authenticateRequest, isOfflineMode, createMockAuthContext } from '@/server/rest/auth';
import { 
  CreateOrgRequestSchema, 
  validateBody, 
  formatValidationError,
  CreateOrgRequest,
  OrgResponse,
  ListOrgsResponse
} from '@/server/rest/validators';
import { createPaginatedResponse } from '@/server/rest/pagination';
import { appRouter } from '@/server/api/root';

// GET /api/v1/orgs - List organizations for authenticated user
export const GET = withErrorHandling(
  withRateLimit(async (request: NextRequest): Promise<NextResponse> => {
    // Authenticate request
    const auth = isOfflineMode() 
      ? createMockAuthContext('org-1')
      : await authenticateRequest(request);

    // Create tRPC caller
    const caller = appRouter.createCaller({
      user: auth.user,
      supabase: auth.supabase,
      posthog: null, // Not needed for REST API
      headers: request.headers,
    });

    try {
      // Call tRPC procedure
      const orgs = await caller.org.listOrgs();
      
      // Transform to REST response format
      const response: ListOrgsResponse = orgs.map((org: any) => ({
        id: org.id,
        name: org.name,
        owner_id: org.owner_id || auth.user.id,
        created_at: org.created_at,
      }));

      return createSuccessResponse(response);
    } catch (error) {
      console.error('Error listing organizations:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Failed to list organizations');
    }
  }, getRateLimitConfigForEndpoint('GET', '/api/v1/orgs'))
);

// POST /api/v1/orgs - Create organization
export const POST = withErrorHandling(
  withRateLimit(async (request: NextRequest): Promise<NextResponse> => {
    // Authenticate request
    const auth = isOfflineMode() 
      ? createMockAuthContext('org-1')
      : await authenticateRequest(request);

    // Validate request body
    const bodyValidation = await validateBody(CreateOrgRequestSchema, request);
    if (!bodyValidation.success) {
      const error = formatValidationError(bodyValidation.error);
      return createErrorResponse('INVALID_REQUEST', error.message, error.details);
    }

    const body: CreateOrgRequest = bodyValidation.data;

    // Create tRPC caller
    const caller = appRouter.createCaller({
      user: auth.user,
      supabase: auth.supabase,
      posthog: null,
      headers: request.headers,
    });

    try {
      // Call tRPC procedure
      const org = await caller.org.createOrg({
        name: body.name,
      });

      // Transform to REST response format
      const response: OrgResponse = {
        id: org.id,
        name: org.name,
        owner_id: org.owner_id || auth.user.id,
        created_at: org.created_at,
      };

      return createSuccessResponse(response, 201);
    } catch (error) {
      console.error('Error creating organization:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Failed to create organization');
    }
  }, getRateLimitConfigForEndpoint('POST', '/api/v1/orgs'))
);
