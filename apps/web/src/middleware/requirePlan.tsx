'use client';

import { useEntitlement } from '@/hooks/useEntitlement';
import { PlanEntitlements } from '@/types/billing';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RequirePlanOptions {
  orgId?: string;
  feature: keyof PlanEntitlements;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * Client-side route guard hook
 * Redirects or shows fallback if organization doesn't have required plan feature
 */
export function useRequirePlan({
  orgId,
  feature,
  redirectTo = '/pricing',
  fallback
}: RequirePlanOptions) {
  const { allowed, isLoading, reason } = useEntitlement({ orgId, featureKey: feature });
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !allowed) {
      if (redirectTo) {
        router.push(redirectTo);
      }
    }
  }, [allowed, isLoading, redirectTo, router]);

  if (isLoading) {
    return {
      allowed: false,
      isLoading: true,
      reason: 'Loading...',
      component: (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    };
  }

  if (!allowed) {
    return {
      allowed: false,
      isLoading: false,
      reason: reason || 'Feature not available',
      component: fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Feature Not Available</h3>
            <p className="text-muted-foreground mb-4">{reason}</p>
            <button
              onClick={() => router.push(redirectTo)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      )
    };
  }

  return {
    allowed: true,
    isLoading: false,
    reason: 'Feature available',
    component: null
  };
}

/**
 * Higher-order component for protecting routes
 */
export function withPlanGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: RequirePlanOptions
) {
  return function PlanGuardedComponent(props: P) {
    const { allowed, component } = useRequirePlan(options);

    if (!allowed) {
      return component;
    }

    return <WrappedComponent {...props} />;
  };
}
