'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

import { getAvailablePlans, createSubscriptionCheckout } from '@/app/actions/billing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { AvailablePlan, PlanName } from '@/types/billing';
import { toast } from 'sonner';

interface PlanComparisonProps {
  currentPlan: PlanName;
  orgId: string;
}

export function PlanComparison({ currentPlan, orgId }: PlanComparisonProps) {
  const [plans, setPlans] = useState<AvailablePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlans() {
      setLoading(true);
      setError(null);

      const result = await getAvailablePlans();

      if (result.success && result.plans) {
        setPlans(result.plans);
      } else {
        setError(result.error || 'Failed to load plans');
      }

      setLoading(false);
    }

    loadPlans();
  }, []);

  const handleUpgrade = async (priceId: string, planName: string) => {
    setLoadingPlan(planName);
    const toastId = toast.loading(`Starting checkout for ${planName} plan...`);
    
    const result = await createSubscriptionCheckout(orgId, priceId);
    
    if (result.success && result.url) {
      toast.success('Redirecting to checkout...', { id: toastId });
      window.location.href = result.url;
    } else {
      toast.error(result.error || 'Failed to start checkout', { 
        id: toastId,
        description: 'Please try again or contact support if the problem persists.',
      });
      setLoadingPlan(null);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="mb-4 text-2xl font-bold">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
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
    <div>
      <h2 className="mb-4 text-2xl font-bold">Available Plans</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.name === currentPlan;
          const isDowngrade =
            (currentPlan === 'business' && plan.name !== 'business') ||
            (currentPlan === 'pro' && plan.name === 'free');

          return (
            <Card key={plan.name} className={plan.popular ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.displayName}</CardTitle>
                  {plan.popular && <Badge>Popular</Badge>}
                  {isCurrent && <Badge variant="secondary">Current</Badge>}
                </div>
                <CardDescription>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm"> {plan.interval}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={isCurrent || loadingPlan !== null}
                  onClick={() => handleUpgrade(plan.priceId, plan.name)}
                >
                  {loadingPlan === plan.name && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isCurrent ? 'Current Plan' : isDowngrade ? 'Downgrade' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
