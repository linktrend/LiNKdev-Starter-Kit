import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Mail, Settings } from 'lucide-react';
import Link from 'next/link';

export default function OrganizationSettingsPage() {
  // In a real app, you'd check if user has access to org settings
  // For template purposes, we'll show a placeholder

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization, members, and invitations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sample Org</div>
            <p className="text-xs text-muted-foreground">
              Your organization details
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/settings/organization/details">
                <Settings className="mr-2 h-4 w-4" />
                Manage
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/settings/organization/members">
                <Users className="mr-2 h-4 w-4" />
                Manage
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Pending invitations
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/settings/organization/invite">
                <Mail className="mr-2 h-4 w-4" />
                Invite
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create Organization</CardTitle>
              <CardDescription>
                Start a new organization for your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Building2 className="mr-2 h-4 w-4" />
                Create Organization
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invite Members</CardTitle>
              <CardDescription>
                Send invitations to join your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/settings/organization/invite">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitations
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
