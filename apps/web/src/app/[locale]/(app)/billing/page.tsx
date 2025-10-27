'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Check, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BillingPage() {
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', type: 'visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: '2', type: 'mastercard', last4: '5555', expiry: '09/26', isDefault: false },
  ]);

  const currentPlan = {
    name: 'Free',
    price: 0,
    features: [
      '3 projects',
      'Basic analytics',
      '1GB storage',
      'Community support',
    ],
  };

  const otherPlans = [
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      features: [
        'Unlimited projects',
        'Advanced analytics',
        '10GB storage',
        'Priority support',
        'Custom domain',
      ],
    },
    {
      id: 'business',
      name: 'Business',
      price: 99,
      features: [
        'Everything in Pro',
        'Team collaboration (up to 10 users)',
        '100GB storage',
        'Advanced security',
        'API access',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      features: [
        'Everything in Business',
        'Unlimited users',
        'Unlimited storage',
        'Custom integrations',
        'Dedicated support',
      ],
    },
  ];

  const handleRemovePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">{currentPlan.name}</h3>
                <p className="text-3xl font-bold text-primary mb-4">
                  ${currentPlan.price}
                  <span className="text-base font-normal text-muted-foreground">/month</span>
                </p>
                <ul className="space-y-2">
                  {currentPlan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Plans */}
        <div>
          <div className="grid gap-6 md:grid-cols-3">
            {otherPlans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-col flex-1">
                  <p className="text-3xl font-bold text-primary">
                    ${plan.price}
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  </p>
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-auto">
                    Upgrade
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment Methods</CardTitle>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {paymentMethods.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No payment methods added</p>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {method.type.charAt(0).toUpperCase() + method.type.slice(1)} ••••{method.last4}
                        </div>
                        <div className="text-sm text-muted-foreground">Expires {method.expiry}</div>
                      </div>
                      {method.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePaymentMethod(method.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
