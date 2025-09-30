import { useQuery } from '@tanstack/react-query';
import { api } from '@/trpc/react';
import { PlanEntitlements } from '@starter/types';

interface UseEntitlementOptions {
  orgId?: string;
  featureKey: keyof PlanEntitlements;
}

interface EntitlementResult {
  allowed: boolean;
  reason?: string;
  plan?: string;
  isLoading: boolean;
  error?: Error;
}

export function useEntitlement({ orgId, featureKey }: UseEntitlementOptions): EntitlementResult {
  const { data: subscriptionData, isLoading, error } = api.billing.getSubscription.useQuery(
    { orgId: orgId || '' },
    { 
      enabled: !!orgId,
      retry: false,
    }
  );

  if (!orgId) {
    return {
      allowed: false,
      reason: 'No organization selected',
      isLoading: false,
    };
  }

  if (isLoading) {
    return {
      allowed: false,
      isLoading: true,
    };
  }

  if (error) {
    return {
      allowed: false,
      reason: 'Failed to load subscription data',
      isLoading: false,
      error: error as unknown as Error,
    };
  }

  if (!subscriptionData?.subscription) {
    return {
      allowed: false,
      reason: 'No active subscription',
      plan: 'free',
      isLoading: false,
    };
  }

  const plan = subscriptionData.subscription.plan;
  
  // Get plan details to check entitlements
  const { data: plansData } = api.billing.getPlans.useQuery();
  const currentPlan = plansData?.plans.find(p => p.id === plan);
  
  if (!currentPlan) {
    return {
      allowed: false,
      reason: 'Unknown plan',
      plan,
      isLoading: false,
    };
  }

  const entitlement = currentPlan.entitlements[featureKey];
  let allowed = false;
  let reason = '';

  if (typeof entitlement === 'boolean') {
    allowed = entitlement;
    reason = entitlement ? 'Feature enabled' : 'Feature not available in current plan';
  } else if (typeof entitlement === 'number') {
    allowed = entitlement === -1; // -1 means unlimited
    reason = entitlement === -1 ? 'Unlimited access' : `Limited to ${entitlement}`;
  } else {
    allowed = false;
    reason = 'Feature not available';
  }

  return {
    allowed,
    reason,
    plan,
    isLoading: false,
  };
}

// Convenience hook for checking specific features
export function useCanUseAutomation(orgId?: string) {
  return useEntitlement({ orgId, featureKey: 'can_use_automation' });
}

export function useCanExportData(orgId?: string) {
  return useEntitlement({ orgId, featureKey: 'can_export_data' });
}

export function useCanUseAnalytics(orgId?: string) {
  return useEntitlement({ orgId, featureKey: 'can_use_analytics' });
}

export function useCanUseWebhooks(orgId?: string) {
  return useEntitlement({ orgId, featureKey: 'can_use_webhooks' });
}

// Hook for checking limits
export function useUsageLimit(featureKey: keyof PlanEntitlements, orgId?: string) {
  const { data: usageStats, isLoading } = api.billing.getUsageStats.useQuery(
    { orgId: orgId || '' },
    { 
      enabled: !!orgId,
      retry: false,
    }
  );

  if (!orgId || isLoading) {
    return {
      current: 0,
      limit: 0,
      exceeded: false,
      isLoading: !!isLoading,
    };
  }

  const stats = usageStats?.[featureKey as keyof typeof usageStats];
  
  // Handle case where stats might be boolean or object
  if (typeof stats === 'boolean' || !stats) {
    return {
      current: 0,
      limit: 0,
      exceeded: false,
      isLoading: false,
    };
  }
  
  return {
    current: stats.current || 0,
    limit: stats.limit || 0,
    exceeded: stats.exceeded || false,
    isLoading: false,
  };
}
