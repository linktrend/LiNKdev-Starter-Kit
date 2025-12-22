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
      const sub = subscription.subscription as any;
      const response: SubscriptionResponse = {
        org_id: sub.org_id,
        plan: sub.plan_name || sub.plan,
        status: sub.status,
        current_period_start: sub.current_period_start || '',
        current_period_end: sub.current_period_end || '',
        trial_end: sub.trial_end || null,
        stripe_sub_id: sub.stripe_sub_id || null,
        updated_at: sub.updated_at || '',
      };

      return createSuccessResponse(response);
    } catch (error) {
      console.error('Error getting subscription:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Failed to get subscription');
    }
  }, getRateLimitConfigForEndpoint('GET', '/api/v1/billing/subscription'))
);
