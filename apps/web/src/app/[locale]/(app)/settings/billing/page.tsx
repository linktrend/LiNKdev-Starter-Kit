'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Calendar, 
  Crown, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function BillingSettingsPage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const { data: subscriptionData, isLoading: subscriptionLoading } = api.billing.getSubscription.useQuery(
    { orgId },
    {
      enabled: !!orgId,
    }
  );

  const { data: usageStats, isLoading: usageLoading } = api.billing.getUsageStats.useQuery(
    { orgId },
    {
      enabled: !!orgId,
    }
  );

  const { data: invoicesData, isLoading: invoicesLoading } = api.billing.listInvoices.useQuery(
    { orgId, limit: 10 },
    {
      enabled: !!orgId,
    }
  );

  const { data: plansData } = api.billing.getPlans.useQuery();

  const openPortal = api.billing.openPortal.useMutation();

  const handleManageSubscription = async () => {
    if (!orgId) return;

    try {
      const result = await openPortal.mutateAsync({
        orgId,
        returnUrl: `${window.location.origin}/settings/billing`,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Failed to open customer portal:', error);
    }
  };

  if (subscriptionLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const subscription = subscriptionData?.subscription;
  const currentPlan = plansData?.plans.find((p: any) => p.id === subscription?.plan) || plansData?.plans[0];

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'trialing':
        return <Clock className="h-4 w-4 text-primary" />;
      case 'past_due':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'canceled':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'trialing':
        return 'bg-primary/10 text-primary';
      case 'past_due':
        return 'bg-warning/10 text-warning';
      case 'canceled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your organization&apos;s subscription and billing settings.
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>
                {currentPlan?.description}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(subscription?.status)}>
              {getStatusIcon(subscription?.status)}
              <span className="ml-1 capitalize">{subscription?.status || 'Free'}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plan</p>
              <p className="text-lg font-semibold">{currentPlan?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Price</p>
              <p className="text-lg font-semibold">
                {currentPlan?.price_monthly === 0 ? 'Free' : `$${currentPlan?.price_monthly}/month`}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Billing Period</p>
              <p className="text-lg font-semibold">
                {subscription?.current_period_start && subscription?.current_period_end
                  ? `${new Date(subscription.current_period_start).toLocaleDateString()} - ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  : 'N/A'
                }
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleManageSubscription} disabled={openPortal.isPending}>
              <CreditCard className="mr-2 h-4 w-4" />
              {openPortal.isPending ? 'Opening...' : 'Manage Subscription'}
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                Change Plan
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            View and download your recent invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (invoicesData?.invoices && Array.isArray(invoicesData.invoices) && invoicesData.invoices.length > 0) ? (
            <div className="space-y-4">
              {invoicesData.invoices.map((invoice: any) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </span>
                      <Badge 
                        variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.period_start && invoice.period_end && (
                        <>
                          {new Date(invoice.period_start).toLocaleDateString()} - {new Date(invoice.period_end).toLocaleDateString()}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">
                        ${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {invoice.hosted_invoice_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </a>
                        </Button>
                      )}
                      {invoice.invoice_pdf && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={invoice.invoice_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <CreditCard className="h-3 w-3" />
                            PDF
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {invoicesData?.has_more && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    Load More Invoices
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invoices found</p>
              <p className="text-sm">Invoices will appear here once you have an active subscription.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offline Mode Notice */}
      {subscriptionData && 'offline' in subscriptionData && subscriptionData.offline ? (
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-warning">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Offline Mode: Billing data is simulated for template development.
              </span>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
