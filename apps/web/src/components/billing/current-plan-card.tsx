'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createBillingPortal, cancelSubscription, getOrgSubscription } from '@/app/actions/billing';
import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import type { OrgSubscription } from '@/types/billing';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CurrentPlanCardProps {
  subscription: OrgSubscription | null;
  orgId: string;
  onSubscriptionUpdate?: (subscription: OrgSubscription | null) => void;
}

export function CurrentPlanCard({ subscription, orgId, onSubscriptionUpdate }: CurrentPlanCardProps) {
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    const toastId = toast.loading('Opening billing portal...');
    
    const result = await createBillingPortal(orgId);
    
    if (result.success && result.url) {
      toast.success('Redirecting to billing portal...', { id: toastId });
      window.location.href = result.url;
    } else {
      toast.error(result.error || 'Failed to open billing portal', { id: toastId });
      setLoading(false);
    }
  };

  const refreshSubscription = useCallback(async () => {
    const result = await getOrgSubscription(orgId);
    if (result.success) {
      onSubscriptionUpdate?.(result.subscription || null);
    }
  }, [orgId, onSubscriptionUpdate]);

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setCanceling(true);
    const toastId = toast.loading('Canceling subscription...');
    
    const result = await cancelSubscription(orgId);
    
    if (result.success) {
      toast.success('Subscription will be canceled at the end of the billing period', { 
        id: toastId,
        duration: 5000,
      });
      
      // Refresh subscription data without page reload
      await refreshSubscription();
    } else {
      toast.error(result.error || 'Failed to cancel subscription', { id: toastId });
    }
    
    setCanceling(false);
  };

  const planName = subscription?.plan_name || 'free';
  const status = subscription?.status || 'active';
  const isActive = status === 'active' || status === 'trialing';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </div>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Plan</p>
          <p className="text-2xl font-bold capitalize">{planName}</p>
        </div>

        {subscription && subscription.current_period_end && (
          <div>
            <p className="text-sm text-muted-foreground">
              {subscription.cancel_at_period_end ? 'Cancels on' : 'Renews on'}
            </p>
            <p className="text-lg">
              {format(new Date(subscription.current_period_end), 'MMMM d, yyyy')}
            </p>
          </div>
        )}

        {subscription?.seats && (
          <div>
            <p className="text-sm text-muted-foreground">Seats</p>
            <p className="text-lg">{subscription.seats}</p>
          </div>
        )}

        <div className="flex gap-2">
          {subscription?.stripe_subscription_id && (
            <>
              <Button onClick={handleManageBilling} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Manage Billing
              </Button>
              
              {!subscription.cancel_at_period_end && isActive && (
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  disabled={canceling}
                >
                  {canceling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cancel Subscription
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
