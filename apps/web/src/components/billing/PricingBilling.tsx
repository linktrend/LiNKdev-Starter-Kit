'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap } from 'lucide-react';
import { api } from '@/trpc/react';
import { BillingPlan } from '@/types/billing';

interface PricingBillingProps {
  orgId?: string;
  currentPlan?: string;
  onPlanSelect?: (planId: string) => void;
}

export function PricingBilling({ orgId, currentPlan, onPlanSelect }: PricingBillingProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { data: plansData, isLoading } = api.billing.getPlans.useQuery();
  const createCheckout = api.billing.createCheckout.useMutation();

  const plans = plansData?.plans || [];

  const handlePlanSelect = async (plan: BillingPlan) => {
    if (!orgId) {
      console.error('No organization ID provided');
      return;
    }

    if (plan.id === 'free') {
      // Free plan - no checkout needed
      onPlanSelect?.(plan.id);
      return;
    }

    setLoadingPlan(plan.id);

    try {
      const result = await createCheckout.mutateAsync({
        orgId,
        plan: plan.id,
        successUrl: `${window.location.origin}/settings/billing?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const getPrice = (plan: BillingPlan) => {
    return billingInterval === 'yearly' ? plan.price_yearly : plan.price_monthly;
  };

  const getPriceDisplay = (plan: BillingPlan) => {
    const price = getPrice(plan);
    if (price === 0) return 'Free';
    
    const savings = billingInterval === 'yearly' && plan.price_yearly < plan.price_monthly * 12;
    const monthlyEquivalent = billingInterval === 'yearly' ? Math.round(plan.price_yearly / 12) : plan.price_monthly;
    
    return (
      <div className="text-center">
        <div className="text-4xl font-bold">
          ${price}
          {billingInterval === 'yearly' && <span className="text-lg font-normal">/year</span>}
          {billingInterval === 'monthly' && <span className="text-lg font-normal">/month</span>}
        </div>
        {savings && (
          <div className="text-sm text-green-600 mt-1">
            Save ${(plan.price_monthly * 12) - plan.price_yearly}/year
          </div>
        )}
        {billingInterval === 'yearly' && (
          <div className="text-sm text-muted-foreground">
            ${monthlyEquivalent}/month
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <section className="container mx-auto py-16" id="pricing">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Start with our free plan and upgrade as you grow.
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={`text-sm ${billingInterval === 'monthly' ? 'font-medium' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
            className="relative"
          >
            <div className={`absolute left-1 top-1 w-6 h-6 bg-primary rounded-full transition-transform ${
              billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </Button>
          <span className={`text-sm ${billingInterval === 'yearly' ? 'font-medium' : 'text-muted-foreground'}`}>
            Yearly
          </span>
          {billingInterval === 'yearly' && (
            <Badge variant="secondary" className="ml-2">
              Save up to 20%
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isPopular = plan.popular;
          const price = getPrice(plan);
          const isLoading = loadingPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={`relative transition-all duration-200 hover:shadow-lg ${
                isPopular ? 'border-primary shadow-lg scale-105' : 'border-border'
              } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Crown className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary">
                    <Check className="w-3 h-3 mr-1" />
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  {getPriceDisplay(plan)}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? 'outline' : isPopular ? 'default' : 'outline'}
                  onClick={() => handlePlanSelect(plan)}
                  disabled={isCurrentPlan || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : plan.id === 'free' ? (
                    'Get Started'
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Upgrade to {plan.name}
                    </>
                  )}
                </Button>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Features included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Entitlements Summary */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    {Object.entries(plan.entitlements).map(([key, value]) => {
                      if (typeof value === 'boolean') return null;
                      if (typeof value === 'number' && value === -1) {
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-medium">Unlimited</span>
                          </div>
                        );
                      }
                      if (typeof value === 'number' && value > 0) {
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-medium">{value.toLocaleString()}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Offline Mode Notice */}
      {plansData?.offline && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
            <Zap className="w-4 h-4 mr-2" />
            Offline Mode: Pricing data is simulated for template development.
          </div>
        </div>
      )}
    </section>
  );
}
