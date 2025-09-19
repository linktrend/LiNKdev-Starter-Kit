import { BillingPlan } from '@/types/billing';

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started with basic features',
    price_monthly: 0,
    price_yearly: 0,
    entitlements: {
      max_organizations: 1,
      max_members_per_org: 3,
      max_records: 100,
      max_reminders: 50,
      can_use_automation: false,
      can_export_data: false,
      can_use_analytics: false,
      can_use_webhooks: false,
      support_level: 'community',
    },
    features: [
      '1 Organization',
      'Up to 3 members per org',
      '100 records total',
      '50 reminders total',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Advanced features for growing teams',
    price_monthly: 29,
    price_yearly: 290, // ~$24/month when paid yearly
    stripe_price_id_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    stripe_price_id_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    entitlements: {
      max_organizations: 5,
      max_members_per_org: 25,
      max_records: 10000,
      max_reminders: 1000,
      can_use_automation: true,
      can_export_data: true,
      can_use_analytics: true,
      can_use_webhooks: true,
      support_level: 'email',
    },
    features: [
      'Up to 5 organizations',
      'Up to 25 members per org',
      '10,000 records total',
      '1,000 reminders total',
      'Automation & webhooks',
      'Data export',
      'Advanced analytics',
      'Email support',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Unlimited everything for large organizations',
    price_monthly: 99,
    price_yearly: 990, // ~$82/month when paid yearly
    stripe_price_id_monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
    stripe_price_id_yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
    entitlements: {
      max_organizations: -1, // unlimited
      max_members_per_org: -1, // unlimited
      max_records: -1, // unlimited
      max_reminders: -1, // unlimited
      can_use_automation: true,
      can_export_data: true,
      can_use_analytics: true,
      can_use_webhooks: true,
      support_level: 'priority',
    },
    features: [
      'Unlimited organizations',
      'Unlimited members',
      'Unlimited records',
      'Unlimited reminders',
      'All Pro features',
      'Priority support',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
];

export function getPlanById(planId: string): BillingPlan | undefined {
  return BILLING_PLANS.find(plan => plan.id === planId);
}

export function getDefaultPlan(): BillingPlan {
  return BILLING_PLANS[0]; // Free plan
}

export function getPopularPlan(): BillingPlan | undefined {
  return BILLING_PLANS.find(plan => plan.popular);
}
