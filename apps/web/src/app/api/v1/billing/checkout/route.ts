import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse, createErrorResponse } from '@/server/rest/errors';
import { withRateLimit, getRateLimitConfigForEndpoint } from '@/server/rest/ratelimit';
import { authenticateRequest, isOfflineMode, createMockAuthContext } from '@/server/rest/auth';
import { 
  CreateCheckoutRequestSchema,
  validateBody,
  formatValidationError,
  CreateCheckoutRequest,
  CheckoutResponse
} from '@/server/rest/validators';
import { appRouter } from '@starter/api';

// POST /api/v1/billing/checkout - Create checkout session
export const POST = withErrorHandling(
  withRateLimit(async (request: NextRequest): Promise<NextResponse> => {
    // Authenticate request
    const auth = isOfflineMode() 
      ? createMockAuthContext('org-1')
      : await authenticateRequest(request);

    // Validate request body
    const bodyValidation = await validateBody(CreateCheckoutRequestSchema, request);
    if (!bodyValidation.success) {
      const error = formatValidationError(bodyValidation.error);
      return createErrorResponse('INVALID_REQUEST', error.message, error.details);
    }

    const body: CreateCheckoutRequest = bodyValidation.data;

    // Create tRPC caller
    const caller = appRouter.createCaller({
      user: auth.user,
      supabase: auth.supabase,
      posthog: null,
      headers: request.headers,
    });

    try {
      // Call tRPC procedure
      const checkout = await caller.billing.createCheckout({
        orgId: body.org_id || auth.orgId,
        plan: body.plan,
        successUrl: body.success_url,
        cancelUrl: body.cancel_url,
      });

      // Transform to REST response format
      const response: CheckoutResponse = {
        session_id: checkout.sessionId || '',
        url: checkout.url || '',
        ...((checkout as any).offline !== undefined && { offline: (checkout as any).offline }),
      };

      return createSuccessResponse(response, 201);
    } catch (error) {
      console.error('Error creating checkout:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Failed to create checkout session');
    }
  }, getRateLimitConfigForEndpoint('POST', '/api/v1/billing/checkout'))
);
