'use client';

import { useOrg } from '@/contexts/OrgContext';
import { useEffect, useState, useCallback } from 'react';
import { getOrgSubscription } from '@/app/actions/billing';
import type { OrgSubscription } from '@/types/billing';
import { CurrentPlanCard } from './current-plan-card';
import { PlanComparison } from './plan-comparison';
import { BillingHistory } from './billing-history';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function BillingDashboard() {
  const { currentOrgId, isLoading: orgLoading } = useOrg();
  const [subscription, setSubscription] = useState<OrgSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubscription() {
      if (!currentOrgId) return;
      
      setLoading(true);
      setError(null);
      
      const result = await getOrgSubscription(currentOrgId);
      
      if (result.success) {
        setSubscription(result.subscription || null);
      } else {
        setError(result.error || 'Failed to load subscription');
      }
      
      setLoading(false);
    }

    loadSubscription();
  }, [currentOrgId]);

  const handleSubscriptionUpdate = useCallback((updatedSubscription: OrgSubscription | null) => {
    setSubscription(updatedSubscription);
  }, []);

  if (orgLoading || (loading && currentOrgId)) {
    return <BillingDashboardSkeleton />;
  }

  if (!currentOrgId) {
    return (
      <Alert>
        <AlertDescription>
          Please select an organization to view billing settings.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <CurrentPlanCard 
        subscription={subscription} 
        orgId={currentOrgId} 
        onSubscriptionUpdate={handleSubscriptionUpdate}
      />
      <PlanComparison currentPlan={subscription?.plan_name || 'free'} orgId={currentOrgId} />
      {subscription?.stripe_subscription_id && (
        <BillingHistory orgId={currentOrgId} />
      )}
    </div>
  );
}

function BillingDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
