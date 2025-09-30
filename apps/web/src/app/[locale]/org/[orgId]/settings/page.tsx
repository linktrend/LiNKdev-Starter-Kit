import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@starter/ui';
import { Button } from '@starter/ui';
import { Input } from '@starter/ui';
import { Label } from '@starter/ui';
import { Textarea } from '@starter/ui';
import { Badge } from '@starter/ui';
import { Building2, Users, Mail, Shield, Globe, Trash2 } from 'lucide-react';
import { resolveOrgId } from '@/server/org-context';
import { hasOrgAccess } from '@/server/queries/orgs';
import { OrgLoading, OrgEmpty, OrgForbidden } from '@/components/org-states';

interface OrgSettingsPageProps {
  params: {
    orgId: string;
  };
}

export async function generateMetadata({ params }: OrgSettingsPageProps) {
  return {
    title: `Organization Settings`,
    description: `Manage your organization settings and preferences`,
  };
}

export default async function OrgSettingsPage({ params }: OrgSettingsPageProps) {
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
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization details and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Org ID: {orgContext.orgId}</Badge>
          <Badge variant="secondary">Role: {userRole}</Badge>
          <Badge variant="outline">Source: {orgContext.source}</Badge>
        </div>
      </div>

      <div className="space-y-6">
        {/* Organization Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Information
            </CardTitle>
            <CardDescription>
              Update your organization&apos;s basic details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="Enter organization name"
                  defaultValue="Sample Organization"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgSlug">Organization Slug</Label>
                <Input
                  id="orgSlug"
                  placeholder="organization-slug"
                  defaultValue="sample-org"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orgDescription">Description</Label>
              <Textarea
                id="orgDescription"
                placeholder="Describe your organization"
                defaultValue="A sample organization for demonstration purposes"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orgWebsite">Website</Label>
              <Input
                id="orgWebsite"
                type="url"
                placeholder="https://example.com"
                defaultValue="https://example.com"
              />
            </div>
            
            <div className="pt-2">
              <Button>
                <Building2 className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
            
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                TODO: Implement form validation and tRPC mutation for updating organization details
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Member Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Member Management
            </CardTitle>
            <CardDescription>
              Manage organization members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Members</p>
                  <p className="text-xs text-muted-foreground">12 active members</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/org/${orgContext.orgId}/team`}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Members
                  </a>
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Pending Invitations</p>
                  <p className="text-xs text-muted-foreground">3 pending invitations</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/org/${orgContext.orgId}/team`}>
                    <Mail className="mr-2 h-4 w-4" />
                    View Invitations
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                TODO: Implement member management with tRPC calls
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure organization security and access controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">
                    Require 2FA for all organization members
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Session Timeout</p>
                  <p className="text-xs text-muted-foreground">
                    Auto-logout after inactivity
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">IP Restrictions</p>
                  <p className="text-xs text-muted-foreground">
                    Limit access to specific IP addresses
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
            
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                TODO: Implement security settings with proper validation
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Integration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Integrations
            </CardTitle>
            <CardDescription>
              Connect external services and tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Slack Integration</p>
                  <p className="text-xs text-muted-foreground">
                    Connect with Slack for notifications
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Google Workspace</p>
                  <p className="text-xs text-muted-foreground">
                    Sync with Google Workspace
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Webhooks</p>
                  <p className="text-xs text-muted-foreground">
                    Configure webhook endpoints
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
            
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                TODO: Implement integration management with proper OAuth flows
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-destructive">Delete Organization</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete this organization and all its data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Organization
                </Button>
              </div>
            </div>
            
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                TODO: Implement organization deletion with proper confirmations and data cleanup
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
