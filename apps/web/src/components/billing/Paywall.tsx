'use client';

import React from 'react';
import Link from 'next/link';
import { useEntitlement, useUsageLimit } from '@/hooks/useEntitlement';
import { PlanEntitlements } from '@/types/billing';
import { Button } from '@starter/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@starter/ui';
import { Lock, Crown, Zap } from 'lucide-react';

interface PaywallProps {
  children: React.ReactNode;
  feature: keyof PlanEntitlements;
  orgId?: string;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export function Paywall({ 
  children, 
  feature, 
  orgId, 
  fallback,
  showUpgrade = true 
}: PaywallProps) {
  const { allowed, reason, plan, isLoading } = useEntitlement({ orgId, featureKey: feature });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (allowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">Feature Not Available</CardTitle>
        <CardDescription>
          {reason || 'This feature is not available in your current plan.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Current plan: <span className="font-medium capitalize">{plan}</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild>
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/settings/billing">
                <Zap className="mr-2 h-4 w-4" />
                Manage Billing
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Convenience components for common features
export function AutomationPaywall({ children, orgId, fallback }: Omit<PaywallProps, 'feature'>) {
  return (
    <Paywall feature="can_use_automation" orgId={orgId} fallback={fallback}>
      {children}
    </Paywall>
  );
}

export function ExportPaywall({ children, orgId, fallback }: Omit<PaywallProps, 'feature'>) {
  return (
    <Paywall feature="can_export_data" orgId={orgId} fallback={fallback}>
      {children}
    </Paywall>
  );
}

export function AnalyticsPaywall({ children, orgId, fallback }: Omit<PaywallProps, 'feature'>) {
  return (
    <Paywall feature="can_use_analytics" orgId={orgId} fallback={fallback}>
      {children}
    </Paywall>
  );
}

export function WebhooksPaywall({ children, orgId, fallback }: Omit<PaywallProps, 'feature'>) {
  return (
    <Paywall feature="can_use_webhooks" orgId={orgId} fallback={fallback}>
      {children}
    </Paywall>
  );
}

// Usage limit component
interface UsageLimitProps {
  feature: keyof PlanEntitlements;
  orgId?: string;
  children: (props: { current: number; limit: number | string; exceeded: boolean; isLoading: boolean }) => React.ReactNode;
}

export function UsageLimit({ feature, orgId, children }: UsageLimitProps) {
  const { current, limit, exceeded, isLoading } = useUsageLimit(feature, orgId);
  
  return <>{children({ current, limit, exceeded, isLoading })}</>;
}
