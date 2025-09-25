import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@starter/ui';
import { Button } from '@starter/ui';
import { Badge } from '@starter/ui';
import { 
  CreditCard, 
  Calendar, 
  Crown, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Download
} from 'lucide-react';
import { resolveOrgId } from '@/server/org-context';
import { hasOrgAccess } from '@/server/queries/orgs';
import { OrgLoading, OrgEmpty, OrgForbidden } from '@/components/org-states';

interface OrgBillingPageProps {
  params: {
    orgId: string;
  };
}

export async function generateMetadata({ params }: OrgBillingPageProps) {
  return {
    title: `Billing & Plans`,
    description: `Manage your organization billing and subscription`,
  };
}

export default async function OrgBillingPage({ params }: OrgBillingPageProps) {
  const user = await getUser();

  if (!user) {
    return redirect('/signin');
  }

  const { orgId } = params;

  // Resolve org context using S7 resolver
  const orgContext = await resolveOrgId({
    params: { orgId },
    cookies: cookies(),
    userId: user.id,
  });

  // Handle different org context states
  if (!orgContext.orgId) {
    return <OrgEmpty />;
  }

  // Verify user has access to this organization
  const hasAccess = await hasOrgAccess(orgContext.orgId, user.id);
  if (!hasAccess) {
    return <OrgForbidden />;
  }

  // Get user's role in the organization for additional context
  const supabase = createClient({ cookies });
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgContext.orgId)
    .eq('user_id', user.id)
    .single();

  const userRole = membership?.role || 'viewer';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Plans</h1>
          <p className="text-muted-foreground">
            Manage your organization's subscription and billing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Org ID: {orgContext.orgId}</Badge>
          <Badge variant="secondary">Role: {userRole}</Badge>
          <Badge variant="outline">Source: {orgContext.source}</Badge>
        </div>
      </div>

      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your organization's current subscription details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">Pro Plan</h3>
                <Badge variant="default">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                $29/month • Billed monthly
              </p>
              <p className="text-xs text-muted-foreground">
                Next billing date: January 15, 2024
              </p>
            </div>
            <div className="text-right">
              <Button variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$29.00</div>
            <p className="text-xs text-muted-foreground">
              Current usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              of 10,000 limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              of 25 limit
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plan Features */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
            <CardDescription>
              What's included in your current plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Up to 25 team members</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">10,000 records per month</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Advanced analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Priority support</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">API access</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-muted-foreground">Custom integrations</span>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>
              Your recent billing history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">December 2023</p>
                  <p className="text-xs text-muted-foreground">Pro Plan</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$29.00</p>
                  <Badge variant="default" className="text-xs">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Paid
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">November 2023</p>
                  <p className="text-xs text-muted-foreground">Pro Plan</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$29.00</p>
                  <Badge variant="default" className="text-xs">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Paid
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">October 2023</p>
                  <p className="text-xs text-muted-foreground">Pro Plan</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$29.00</p>
                  <Badge variant="default" className="text-xs">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Paid
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download All Invoices
              </Button>
            </div>
            
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                TODO: Implement real billing history with tRPC calls
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your organization's needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Starter</CardTitle>
                <CardDescription>Perfect for small teams</CardDescription>
                <div className="text-2xl font-bold">$9<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Up to 5 team members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">1,000 records per month</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic analytics</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Downgrade
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Pro</CardTitle>
                <CardDescription>Most popular choice</CardDescription>
                <div className="text-2xl font-bold">$29<span className="text-sm font-normal">/month</span></div>
                <Badge className="w-fit">Current Plan</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Up to 25 team members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">10,000 records per month</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced analytics</span>
                  </div>
                </div>
                <Button disabled className="w-full">
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Enterprise</CardTitle>
                <CardDescription>For large organizations</CardDescription>
                <div className="text-2xl font-bold">$99<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited team members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited records</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Custom integrations</span>
                  </div>
                </div>
                <Button className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="pt-4">
            <p className="text-xs text-muted-foreground">
              TODO: Implement plan switching with Stripe integration and tRPC calls
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Update
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Manage
              </Button>
            </div>
          </div>
          
          <div className="pt-4">
            <p className="text-xs text-muted-foreground">
              TODO: Implement payment method management with Stripe
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
