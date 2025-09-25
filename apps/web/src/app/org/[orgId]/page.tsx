import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getCurrentUserProfile } from '@/server/queries/user';
import { getOrgSummary, getUserOrgRole, hasOrgAccess } from '@/server/queries/orgs';
import { listRecentOrgActivity } from '@/server/queries/audit';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@starter/ui';
import { Badge } from '@starter/ui';
import { Button } from '@starter/ui';
import { Building2, Users, Activity, TrendingUp, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

interface OrgDashboardPageProps {
  params: {
    orgId: string;
  };
}

export async function generateMetadata({ params }: OrgDashboardPageProps) {
  return {
    title: `Organization Dashboard`,
    description: `Manage your organization and team`,
  };
}

export default async function OrgDashboardPage({ params }: OrgDashboardPageProps) {
  const user = await getCurrentUserProfile();

  if (!user) {
    return redirect('/signin');
  }

  const { orgId } = params;

  // Verify user has access to this organization
  const hasAccess = await hasOrgAccess(orgId, user.id);
  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You are not a member of this organization or it doesn't exist.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          TODO: improve UX with better error handling and org switcher
        </div>
      </div>
    );
  }

  // Get org data and user role
  const [orgSummary, userRole, recentActivity] = await Promise.all([
    getOrgSummary(orgId),
    getUserOrgRole(orgId, user.id),
    listRecentOrgActivity(orgId, 5),
  ]);

  if (!orgSummary) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Organization Not Found</h1>
          <p className="text-muted-foreground">
            The requested organization could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{orgSummary.name}</h1>
          <p className="text-muted-foreground">
            Organization Dashboard • Your role: {userRole}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{orgSummary.members} members</Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgSummary.members}</div>
            <p className="text-xs text-muted-foreground">
              Total team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              TODO: Get from tRPC call
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">
              TODO: Calculate growth metrics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              TODO: Get from audit logs
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions and updates in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {activity.action} {activity.entity_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No recent activity
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <p className="text-xs text-muted-foreground">
                TODO: Add more detailed activity descriptions and user names
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common organization management tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link href={`/org/${orgId}/team`}>
                <Users className="mr-2 h-4 w-4" />
                Manage Team
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/org/${orgId}/settings`}>
                <Building2 className="mr-2 h-4 w-4" />
                Organization Settings
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/org/${orgId}/billing`}>
                <Calendar className="mr-2 h-4 w-4" />
                Billing & Plans
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/records?orgId=${orgId}`}>
                <FileText className="mr-2 h-4 w-4" />
                View Records
              </Link>
            </Button>
            
            <div className="pt-2 text-xs text-muted-foreground">
              💡 <Link href={`/records?orgId=${orgId}`} className="underline">Switch to this org</Link> for records
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TODO Sections */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">TODO: Additional Features</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Analytics Dashboard</CardTitle>
              <CardDescription>
                Organization performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                TODO: Add charts and analytics with tRPC data calls
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Management</CardTitle>
              <CardDescription>
                Track and manage organization projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                TODO: Add project management features
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resource Usage</CardTitle>
              <CardDescription>
                Monitor organization resource consumption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                TODO: Add resource monitoring and usage stats
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
