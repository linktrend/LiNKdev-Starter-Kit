import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse, createErrorResponse } from '@/server/rest/errors';
import { withRateLimit, getRateLimitConfigForEndpoint } from '@/server/rest/ratelimit';
import { authenticateRequest, isOfflineMode, createMockAuthContext } from '@/server/rest/auth';
import { 
  SubscriptionResponse
} from '@/server/rest/validators';
import { appRouter } from '@starter/api';
import { logUsage } from '@/lib/usage/server';

// GET /api/v1/billing/subscription - Get organization subscription
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
      posthog: null,
      headers: request.headers,
      usageLogger: logUsage,
      orgId: auth.orgId,
    });

    try {
      // Call tRPC procedure
      const subscription = await caller.billing.getSubscription({
        orgId: auth.orgId,
      });

      if (!subscription || !subscription.subscription) {
        return createErrorResponse('RESOURCE_NOT_FOUND', 'No subscription found for organization');
      }

      // Transform to REST response format
      const response: SubscriptionResponse = {
        org_id: subscription.subscription.org_id,
        plan: subscription.subscription.plan,
        status: subscription.subscription.status,
        current_period_start: subscription.subscription.current_period_start,
        current_period_end: subscription.subscription.current_period_end,
        trial_end: subscription.subscription.trial_end || null,
        stripe_sub_id: subscription.subscription.stripe_sub_id || null,
        updated_at: subscription.subscription.updated_at,
      };

      return createSuccessResponse(response);
    } catch (error) {
      console.error('Error getting subscription:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Failed to get subscription');
    }
  }, getRateLimitConfigForEndpoint('GET', '/api/v1/billing/subscription'))
);
