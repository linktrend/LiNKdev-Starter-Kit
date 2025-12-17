'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { createSubscriptionCheckout } from '@/app/actions/billing';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { PlanName } from '@/types/billing';

const PLANS = [
  {
    name: 'free' as PlanName,
    displayName: 'Free',
    price: '$0',
    interval: 'forever',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FREE || 'price_free',
    features: [
      '100 records',
      '1,000 API calls/month',
      '3 automations',
      '1 GB storage',
      'Basic support',
    ],
  },
  {
    name: 'pro' as PlanName,
    displayName: 'Pro',
    price: '$29',
    interval: 'per month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY!,
    popular: true,
    features: [
      '10,000 records',
      '100,000 API calls/month',
      '25 automations',
      '50 GB storage',
      'Advanced analytics',
      'API access',
      'Priority support',
    ],
  },
  {
    name: 'business' as PlanName,
    displayName: 'Business',
    price: '$99',
    interval: 'per month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY!,
    features: [
      '100,000 records',
      '1,000,000 API calls/month',
      '100 automations',
      '500 GB storage',
      'All Pro features',
      'SSO',
      'Custom branding',
      'Dedicated support',
    ],
  },
];

interface PlanComparisonProps {
  currentPlan: PlanName;
  orgId: string;
}

export function PlanComparison({ currentPlan, orgId }: PlanComparisonProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (priceId: string, planName: string) => {
    setLoadingPlan(planName);
    
    const result = await createSubscriptionCheckout(orgId, priceId);
    
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      alert(result.error || 'Failed to start checkout');
      setLoadingPlan(null);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Available Plans</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
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
