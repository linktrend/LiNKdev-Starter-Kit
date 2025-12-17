import { requireAuth } from '@/lib/auth/server';
import { BillingDashboard } from '@/components/billing/billing-dashboard';

export default async function BillingPage() {
  const user = await requireAuth();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="mb-2 text-3xl font-bold">Billing & Subscription</h1>
      <p className="mb-8 text-muted-foreground">
        Manage your subscription, billing, and payment methods
      </p>
      <BillingDashboard />
    </div>
  );
}
