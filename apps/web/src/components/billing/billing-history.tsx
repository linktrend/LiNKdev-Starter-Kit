'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BillingHistoryProps {
  orgId: string;
}

export function BillingHistory({ orgId }: BillingHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>View your past invoices and payments</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Use the Manage Billing button above to view your complete billing history in the Stripe portal.
        </p>
      </CardContent>
    </Card>
  );
}
