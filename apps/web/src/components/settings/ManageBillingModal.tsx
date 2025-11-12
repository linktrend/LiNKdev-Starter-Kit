'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, Trash2, Plus, Loader2, Zap, Users, Briefcase, Crown, Sparkles, ChevronLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddPaymentMethodModal } from './AddPaymentMethodModal';
import { api } from '@/trpc/react';
import { usePathname, useSearchParams } from 'next/navigation';

interface ManageBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  description?: string;
  hosted_invoice_url?: string;
}

// Mock data for UI/UX design
const MOCK_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price_monthly: 0,
    price_yearly: 0,
    popular: false,
    features: [
      'Up to 5 projects',
      'Basic support',
      '1GB storage',
      'Community access',
      'Basic analytics',
      'Mobile app access',
      'Email notifications',
      'Basic integrations'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price_monthly: 29,
    price_yearly: 290,
    popular: true,
    features: [
      'Unlimited projects',
      'Priority support',
      '50GB storage',
      'Advanced analytics',
      'Custom integrations',
      'API access',
      'Team collaboration',
      'Advanced reporting',
      'Custom branding',
      'Export data',
      'Webhooks',
      'SLAs'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price_monthly: 99,
    price_yearly: 990,
    popular: false,
    features: [
      'Everything in Pro',
      'Unlimited storage',
      'Dedicated support',
      'Custom solutions',
      'Advanced security',
      'SLA guarantees',
      'Custom integrations',
      'Training & onboarding',
      'Dedicated account manager'
    ]
  }
];

const MOCK_INVOICES = [
  {
    id: 'inv_001',
    amount: 2900,
    currency: 'usd',
    status: 'paid',
    created_at: '2024-01-15T00:00:00Z',
    description: 'Pro Plan - Annual',
    hosted_invoice_url: '#'
  },
  {
    id: 'inv_002',
    amount: 2900,
    currency: 'usd',
    status: 'paid',
    created_at: '2024-02-15T00:00:00Z',
    description: 'Pro Plan - Annual',
    hosted_invoice_url: '#'
  },
  {
    id: 'inv_003',
    amount: 2900,
    currency: 'usd',
    status: 'paid',
    created_at: '2024-03-15T00:00:00Z',
    description: 'Pro Plan - Annual',
    hosted_invoice_url: '#'
  }
];

export function ManageBillingModal({ isOpen, onClose }: ManageBillingModalProps) {
  const [mounted, setMounted] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'billing'>('plans');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Extract orgId from URL or cookies
  useEffect(() => {
    // Extract orgId from URL path (e.g., /org/[orgId]/...)
    const orgMatch = pathname?.match(/\/org\/([^/]+)/);
    if (orgMatch) {
      setOrgId(orgMatch[1]);
      return;
    }

    // Extract orgId from search params
    const queryOrgId = searchParams?.get('orgId');
    if (queryOrgId) {
      setOrgId(queryOrgId);
      return;
    }

    // Try to get orgId from cookie (client-side)
    const cookieOrgId = document.cookie
      .split('; ')
      .find(row => row.startsWith('org_id='))
      ?.split('=')[1];
    
    if (cookieOrgId) {
      setOrgId(cookieOrgId);
      return;
    }

    // No orgId found
    setOrgId(null);
  }, [pathname, searchParams]);

  // Fetch data
  const { data: subscriptionData } = api.billing.getSubscription.useQuery(
    { orgId: orgId || '' },
    { enabled: !!orgId && isOpen }
  );
  
  const { data: plansData } = api.billing.getPlans.useQuery();
  
  const { data: invoicesData } = api.billing.listInvoices.useQuery(
    { orgId: orgId || '', limit: 6 },
    { enabled: !!orgId && isOpen }
  );

  const createCheckout = api.billing.createCheckout.useMutation();

  // Use mock data for UI/UX design
  const plans = MOCK_PLANS; // Use mock data instead of API
  const currentPlan = 'free'; // Mock current plan
  const invoices = MOCK_INVOICES; // Use mock invoices

  const handlePlanSwitch = async (planId: string) => {
    if (!orgId) {
      alert('Organization ID not found. Please select an organization first.');
      return;
    }
    
    if (planId === currentPlan) {
      return; // Already on this plan
    }

    try {
      const result = await createCheckout.mutateAsync({
        orgId,
        plan: planId,
        successUrl: `${window.location.origin}/settings/billing?success=true`,
        cancelUrl: `${window.location.origin}/settings/billing?canceled=true`,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Failed to switch plan:', error);
      alert('Failed to switch plan. Please try again.');
    }
  };

  const getPrice = (plan: any) => {
    return billingCycle === 'yearly' 
      ? (plan.price_yearly / 12).toFixed(0)
      : plan.price_monthly;
  };

  const getPricePeriod = (plan: any) => {
    return billingCycle === 'yearly' ? 'year' : 'month';
  };

  const getSavePercentage = (plan: any) => {
    if (!plan.price_yearly || plan.price_yearly === 0) return 0;
    const yearlyPrice = plan.price_yearly;
    const monthlyYearlyPrice = plan.price_monthly * 12;
    return Math.round(((monthlyYearlyPrice - yearlyPrice) / monthlyYearlyPrice) * 100);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return Sparkles;
      case 'pro':
        return Zap;
      case 'enterprise':
        return Crown;
      default:
        return Briefcase;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      paid: { label: 'Paid', className: 'bg-green-100 text-green-700' },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
      failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
      open: { label: 'Open', className: 'bg-blue-100 text-blue-700' },
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
      uncollectible: { label: 'Uncollectible', className: 'bg-red-100 text-red-700' },
      void: { label: 'Void', className: 'bg-gray-100 text-gray-700' },
    };
    
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const handleDownloadCSV = () => {
    const csvContent = [
      ['Date', 'Description', 'Amount', 'Status'].join(','),
      ...invoices.map((invoice: any) => [
        formatDate(invoice.created_at),
        `"${invoice.description || `Invoice ${invoice.id.slice(-8)}`}"`,
        formatAmount(invoice.amount, invoice.currency),
        invoice.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen || !mounted) return null;

  // All Transactions Modal Content
  const allTransactionsModal = showAllTransactions ? (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowAllTransactions(false)}
      />
      
      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border shadow-2xl bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAllTransactions(false)}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <h2 className="text-xl font-bold">All Transactions</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadCSV}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted rounded-lg">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-2">No transactions yet</p>
              <p className="text-sm">Your transactions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice: any) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <p className="font-medium">
                        {invoice.description || `Invoice ${invoice.id.slice(-8)}`}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(invoice.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-lg">{formatAmount(invoice.amount, invoice.currency)}</p>
                      <div className="mt-1">{getStatusBadge(invoice.status)}</div>
                    </div>
                    {invoice.hosted_invoice_url && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        asChild
                      >
                        <a
                          href={invoice.hosted_invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg border shadow-2xl bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <h2 className="text-xl font-bold">Billing & Plans</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="p-6 pb-0 border-b">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setActiveTab('plans')}
              className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                activeTab === 'plans'
                  ? 'border-primary bg-muted'
                  : 'border-border hover:border-input bg-background'
              }`}
            >
              <Sparkles className="h-8 w-8" />
              <span className="text-sm font-medium">Plans</span>
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                activeTab === 'billing'
                  ? 'border-primary bg-muted'
                  : 'border-border hover:border-input bg-background'
              }`}
            >
              <CreditCard className="h-8 w-8" />
              <span className="text-sm font-medium">Billing</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'plans' && (
            <div>
              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex-1"></div>
                <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                      billingCycle === 'monthly'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                      billingCycle === 'yearly'
                        ? 'bg-background text-red-600 shadow-sm'
                        : 'text-red-500 hover:text-red-600'
                    }`}
                  >
                    Annual <span className="text-xs font-semibold ml-1 text-red-500">Save 40%</span>
                  </button>
                </div>
              </div>

              {/* Next Upgrade Plan */}
              {currentPlan === 'free' && (() => {
                const proPlan = plans.find((p: any) => p.id === 'pro');
                const currentPlanDetails = plans.find((p: any) => p.id === currentPlan);
                if (!proPlan) return null;
                
                return (
                  <div className="mb-8 p-6 rounded-lg border-2 border-primary bg-primary/5">
                    <h3 className="text-lg font-bold mb-4">Next Upgrade Plan</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="rounded-lg border border-primary/20 bg-background/40 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current Plan</p>
                        <h4 className="mt-2 text-xl font-bold">{currentPlanDetails?.name ?? 'Current'}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          ${currentPlanDetails ? getPrice(currentPlanDetails) : 0}{' '}
                          <span className="text-xs font-medium text-muted-foreground/80">
                            /{currentPlanDetails ? getPricePeriod(currentPlanDetails) : 'month'}
                          </span>
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          Enjoy core features while you evaluate the platform.
                        </p>
                      </div>

                      <div className="rounded-lg border border-primary bg-background p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Next Plan</p>
                        <h4 className="mt-2 text-xl font-bold">Pro</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          ${getPrice(proPlan)}{' '}
                          <span className="text-xs font-medium text-muted-foreground/80">
                            /{getPricePeriod(proPlan)}
                          </span>
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          Unlock unlimited projects, analytics, and premium support.
                        </p>
                        <div className="mt-4">
                          <Button
                            onClick={() => handlePlanSwitch('pro')}
                            className="w-full"
                          >
                            Upgrade to Pro
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Features included:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Unlimited projects</li>
                        <li>• Advanced analytics</li>
                        <li>• 10GB storage</li>
                        <li>• Priority support</li>
                        <li>• Custom domain</li>
                      </ul>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Note: You&apos;ll be charged immediately. Your current plan will be canceled.</p>
                  </div>
                );
              })()}

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Display Free, Pro, Enterprise in order */}
                {[
                  plans.find((p: any) => p.id === 'free'),
                  plans.find((p: any) => p.id === 'pro'),
                  plans.find((p: any) => p.id === 'enterprise')
                ].filter(Boolean).map((plan: any) => {
                  const PlanIcon = getPlanIcon(plan.id);
                  const isPopular = plan.popular;
                  const isCurrentPlan = plan.id === currentPlan;
                  const isEnterprise = plan.id === 'enterprise';
                  
                  return (
                    <div
                      key={plan.id}
                      className={`relative p-6 rounded-lg border transition-all flex flex-col h-full ${
                        isPopular
                          ? 'border-red-600 shadow-lg scale-105'
                          : 'bg-muted border-border'
                      }`}
                    >
                      {/* Popular Badge */}
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold rounded-full">
                            POPULAR
                          </span>
                        </div>
                      )}

                      {/* Plan Icon */}
                      <div className="mb-4 flex justify-center">
                        <div className="p-3 rounded-full bg-primary/10">
                          <PlanIcon className="h-6 w-6 text-primary" />
                        </div>
                      </div>

                      {/* Plan Name */}
                      <h3 className="text-xl font-bold mb-2 text-center">{plan.name}</h3>

                      {/* Price */}
                      <div className="text-center mb-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-4xl font-bold">
                            ${getPrice(plan)}
                          </span>
                          <span className="text-muted-foreground">/{getPricePeriod(plan)}</span>
                          {billingCycle === 'yearly' && plan.price_yearly > 0 && (
                            <span className="text-xs text-green-600">
                              Save ${plan.price_monthly * 12 - plan.price_yearly}/year
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Button
                        className={`w-full mb-3 ${
                          isCurrentPlan ? 'border-2 border-border bg-muted text-muted-foreground cursor-not-allowed' : ''
                        }`}
                        onClick={() => {
                          if (isEnterprise) {
                            window.location.href = 'mailto:sales@example.com?subject=Enterprise Plan Inquiry';
                          } else {
                            handlePlanSwitch(plan.id);
                          }
                        }}
                        disabled={isCurrentPlan}
                        variant={isCurrentPlan ? 'outline' : isPopular ? 'default' : 'outline'}
                      >
                        {isCurrentPlan ? (
                          'Current Plan'
                        ) : isEnterprise ? (
                          'Contact Sales'
                        ) : createCheckout.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          'Switch to this plan'
                        )}
                      </Button>

                      {/* Trial Text */}
                      {!isCurrentPlan && !isEnterprise && plan.id === 'pro' && (
                        <p className="text-center text-sm text-muted-foreground mb-4">
                          Start Free 7-Day Trial
                        </p>
                      )}
                      {!isCurrentPlan && isEnterprise && (
                        <p className="text-center text-sm text-muted-foreground mb-4">
                          Start Free 15-Day Trial
                        </p>
                      )}

                      {/* Features List - aligned at bottom */}
                      <ul className="space-y-2.5 mt-auto">
                        {plan.features?.slice(0, 8).map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-sm min-h-[24px]">
                            <div className="flex-shrink-0">
                              <div className="h-4 w-4 rounded-full bg-success/20 flex items-center justify-center">
                                <svg className="h-3 w-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                            <span className="flex-1 leading-5">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-8">
              {/* Payment Methods Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Payment Methods</h3>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => setIsAddPaymentModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Payment Method
                  </Button>
                </div>
                <div className="space-y-3">
                  {/* Mock Payment Method */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Visa ••••4242</p>
                          <span className="px-2 py-0.5 bg-success/20 text-success text-xs font-medium rounded-full">
                            Default
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Expires 12/25</p>
                      </div>
                    </div>
                    <button className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Second Payment Method */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Mastercard ••••5555</p>
                        <p className="text-sm text-muted-foreground">Expires 09/26</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => alert('Making this payment method default...')}
                      >
                        Make Default
                      </Button>
                      <button className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Recent Transactions</h3>
                  {invoices.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAllTransactions(true)}
                    >
                      View All
                    </Button>
                  )}
                </div>
                
                {invoices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-muted rounded-lg">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium mb-2">No transactions yet</p>
                    <p className="text-sm">Your recent invoices and charges will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.slice(0, 6).map((invoice: any) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border hover:border-primary/50 transition-all group"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex flex-col flex-1">
                            <p className="font-medium">
                              {invoice.description || `Invoice ${invoice.id.slice(-8)}`}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDate(invoice.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-lg">{formatAmount(invoice.amount, invoice.currency)}</p>
                            <div className="mt-1">{getStatusBadge(invoice.status)}</div>
                          </div>
                          {invoice.hosted_invoice_url && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              asChild
                            >
                              <a
                                href={invoice.hosted_invoice_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {createPortal(showAllTransactions ? allTransactionsModal : modalContent, document.body)}
      <AddPaymentMethodModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setIsAddPaymentModalOpen(false)}
        onAdd={(method, data) => {
          console.log('Adding payment method:', method, data);
        }}
      />
    </>
  );
}
