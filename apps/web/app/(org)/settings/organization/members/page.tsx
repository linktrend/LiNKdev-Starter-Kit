'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Mail, RefreshCw } from 'lucide-react';
import { MemberRow } from '@/components/org/MemberRow';
import { InviteForm } from '@/components/org/InviteForm';
import { api } from '@/trpc/react';
import { OrgRole } from '@/types/org';

// Mock data for template
const mockMembers = [
  {
    org_id: 'org-1',
    user_id: 'user-1',
    role: 'owner' as OrgRole,
    created_at: new Date().toISOString(),
    user: {
      id: 'user-1',
      email: 'owner@example.com',
        user_metadata: {
          full_name: 'John Owner',
          avatar_url: undefined,
        },
    },
  },
  {
    org_id: 'org-1',
    user_id: 'user-2',
    role: 'admin' as OrgRole,
    created_at: new Date().toISOString(),
    user: {
      id: 'user-2',
      email: 'admin@example.com',
        user_metadata: {
          full_name: 'Jane Admin',
          avatar_url: undefined,
        },
    },
  },
  {
    org_id: 'org-1',
    user_id: 'user-3',
    role: 'editor' as OrgRole,
    created_at: new Date().toISOString(),
    user: {
      id: 'user-3',
      email: 'editor@example.com',
        user_metadata: {
          full_name: 'Bob Editor',
          avatar_url: undefined,
        },
    },
  },
  {
    org_id: 'org-1',
    user_id: 'user-4',
    role: 'viewer' as OrgRole,
    created_at: new Date().toISOString(),
    user: {
      id: 'user-4',
      email: 'viewer@example.com',
        user_metadata: {
          full_name: 'Alice Viewer',
          avatar_url: undefined,
        },
    },
  },
];

const mockInvites = [
  {
    id: 'invite-1',
    org_id: 'org-1',
    email: 'pending@example.com',
    role: 'editor' as OrgRole,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'invite-2',
    org_id: 'org-1',
    email: 'another@example.com',
    role: 'viewer' as OrgRole,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState('members');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // In a real app, you'd use these tRPC queries
  // const { data: members = [], refetch: refetchMembers } = api.org.listMembers.useQuery({
  //   orgId: currentOrgId,
  // });
  // const { data: invites = [], refetch: refetchInvites } = api.org.listInvites.useQuery({
  //   orgId: currentOrgId,
  // });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // await Promise.all([refetchMembers(), refetchInvites()]);
    setTimeout(() => setIsRefreshing(false), 1000); // Simulate refresh
  };

  const handleInviteSent = () => {
    // refetchInvites();
    setActiveTab('invites');
  };

  const handleMemberChange = () => {
    // refetchMembers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your organization members and invitations.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members ({mockMembers.length})
          </TabsTrigger>
          <TabsTrigger value="invites" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invitations ({mockInvites.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Members</CardTitle>
              <CardDescription>
                Manage roles and permissions for your team members.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockMembers.map((member) => (
                <MemberRow
                  key={member.user_id}
                  member={member}
                  currentUserRole="owner" // In real app, get from context
                  onRoleChange={handleMemberChange}
                  onMemberRemove={handleMemberChange}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Send Invitation
                </CardTitle>
                <CardDescription>
                  Invite new members to join your organization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InviteForm
                  orgId="org-1" // In real app, get from context
                  onInviteSent={handleInviteSent}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Invitations that are waiting to be accepted.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockInvites.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No pending invitations
                  </p>
                ) : (
                  mockInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {invite.role} • Expires {new Date(invite.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Revoke
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
