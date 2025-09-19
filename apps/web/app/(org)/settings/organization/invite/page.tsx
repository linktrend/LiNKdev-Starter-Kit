'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InviteForm } from '@/components/org/InviteForm';
import { UserPlus, Mail, Clock, CheckCircle } from 'lucide-react';

// Mock data for template
const mockInvites = [
  {
    id: 'invite-1',
    email: 'john@example.com',
    role: 'editor',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'invite-2',
    email: 'jane@example.com',
    role: 'admin',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'invite-3',
    email: 'bob@example.com',
    role: 'viewer',
    status: 'accepted',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'accepted':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'expired':
      return <Mail className="h-4 w-4 text-gray-400" />;
    default:
      return <Mail className="h-4 w-4" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'accepted':
      return 'Accepted';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'accepted':
      return 'text-green-600 bg-green-50';
    case 'expired':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export default function InvitePage() {
  const [invites, setInvites] = useState(mockInvites);

  const handleInviteSent = () => {
    // In a real app, this would refetch the invites
    console.log('Invite sent, refreshing list...');
  };

  const handleRevokeInvite = (inviteId: string) => {
    setInvites(invites.filter(invite => invite.id !== inviteId));
  };

  const pendingInvites = invites.filter(invite => invite.status === 'pending');
  const acceptedInvites = invites.filter(invite => invite.status === 'accepted');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invite Team Members</h1>
        <p className="text-muted-foreground">
          Send invitations to join your organization and manage pending invites.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Send New Invitation
            </CardTitle>
            <CardDescription>
              Invite someone to join your organization by email.
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
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invitation Status
            </CardTitle>
            <CardDescription>
              Track the status of your sent invitations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {pendingInvites.length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {acceptedInvites.length}
                </div>
                <div className="text-sm text-muted-foreground">Accepted</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Invitations</h2>
        
        {invites.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No invitations sent</h3>
              <p className="text-muted-foreground">
                Start by sending your first invitation to a team member.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {invites.map((invite) => (
              <Card key={invite.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(invite.status)}
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {invite.role} • Sent {new Date(invite.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invite.status)}`}
                      >
                        {getStatusText(invite.status)}
                      </span>
                      {invite.status === 'pending' && (
                        <button
                          onClick={() => handleRevokeInvite(invite.id)}
                          className="text-sm text-muted-foreground hover:text-destructive"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                  {invite.status === 'pending' && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invitation Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Invitations expire after 7 days</p>
          <p>• Recipients will receive an email with instructions to join</p>
          <p>• Only organization owners and admins can send invitations</p>
          <p>• You can revoke pending invitations at any time</p>
          <p>• New members will need to create an account if they don't have one</p>
        </CardContent>
      </Card>
    </div>
  );
}
