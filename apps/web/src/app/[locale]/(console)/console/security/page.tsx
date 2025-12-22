'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, History, LogIn, AlertCircle } from 'lucide-react';
import { useSecurityData } from '@/hooks/useSecurityData';
import { UserManagementTable, type OrgMember } from '@/components/console/UserManagementTable';
import { RoleAssignmentDialog } from '@/components/console/RoleAssignmentDialog';
import { ActiveSessionsList } from '@/components/console/ActiveSessionsList';
import { SecurityEventsList } from '@/components/console/SecurityEventsList';
import { PermissionsMatrix } from '@/components/console/PermissionsMatrix';
import { PasswordPolicyEditor, type SecuritySettings } from '@/components/console/PasswordPolicyEditor';
import { updateMemberRole, removeMember, inviteMember, revokeSession, enforce2FA, updatePasswordPolicy } from '@/app/actions/security';
import type { OrgRole } from '@starter/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import { useOrg } from '@/contexts/OrgContext';
import { useSession } from '@/hooks/useSession';

export default function ConsoleSecurityPage() {
  const { currentOrgId, isLoading: orgLoading } = useOrg();
  const { user, loading: sessionLoading } = useSession();
  const currentUserId = user?.id ?? '';
  const [activeTab, setActiveTab] = useState<'users' | 'access-control' | 'audit-trail' | 'sessions'>('users');
  const [currentUserRole, setCurrentUserRole] = useState<OrgRole | null>(null);
  
  // Dialogs state
  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<OrgMember | null>(null);
  
  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [isInviting, setIsInviting] = useState(false);

  // Security settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    require2FA: false,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      expirationDays: null,
      preventReuse: 3,
    },
  });

  // Fetch security data
  const {
    members,
    sessions,
    events,
    stats,
    isLoadingMembers,
    isLoadingSessions,
    isLoadingEvents,
    membersError,
    sessionsError,
    eventsError,
    refreshMembers,
    refreshSessions,
    refreshEvents,
    refreshAll,
  } = useSecurityData({
    orgId: currentOrgId ?? '',
    autoRefreshSessions: true,
    sessionRefreshInterval: 30000,
  });

  // Find current user's role from members
  useEffect(() => {
    if (currentUserId && members.length > 0) {
      const currentMember = members.find(m => m.user_id === currentUserId);
      if (currentMember) {
        setCurrentUserRole(currentMember.role);
      }
    }
  }, [currentUserId, members]);

  if (orgLoading || sessionLoading) {
    return (
      <div className="flex h-full items-center justify-center py-12 text-muted-foreground">
        <Spinner />
        <span className="ml-3">Loading organization context…</span>
      </div>
    );
  }

  if (!currentOrgId) {
    return (
      <div className="rounded-lg border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        Join or create an organization to manage security.
      </div>
    );
  }

  // Handlers
  const handleEditRole = (member: OrgMember) => {
    setSelectedMember(member);
    setIsRoleDialogOpen(true);
  };

  const handleConfirmRoleChange = async (newRole: OrgRole) => {
    if (newRole === 'member') return;
    if (!selectedMember || !currentOrgId) return;

    const result = await updateMemberRole({
      orgId: currentOrgId,
      userId: selectedMember.user_id,
      newRole,
    });

    if (result.success) {
      await refreshMembers();
      setIsRoleDialogOpen(false);
      setSelectedMember(null);
    } else {
      throw new Error(result.error || 'Failed to update role');
    }
  };

  const handleRemoveMember = (member: OrgMember) => {
    setMemberToRemove(member);
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove || !currentOrgId) return;

    const result = await removeMember({
      orgId: currentOrgId,
      userId: memberToRemove.user_id,
    });

    if (result.success) {
      await refreshMembers();
      setMemberToRemove(null);
    } else {
      console.error('Failed to remove member:', result.error);
    }
  };

  const handleInviteMember = () => {
    setIsInviteDialogOpen(true);
  };

  const handleConfirmInvite = async () => {
    if (!currentOrgId || !inviteEmail) return;

    setIsInviting(true);
    try {
      const result = await inviteMember({
        orgId: currentOrgId,
        email: inviteEmail,
        role: inviteRole,
      });

      if (result.success) {
        setIsInviteDialogOpen(false);
        setInviteEmail('');
        setInviteRole('viewer');
        await refreshMembers();
      } else {
        console.error('Failed to invite member:', result.error);
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevokeSession = async (sessionId: string, userId: string) => {
    const result = await revokeSession({ sessionId, userId });
    if (result.success) {
      await refreshSessions();
    } else {
      throw new Error(result.error || 'Failed to revoke session');
    }
  };

  const handleSaveSecuritySettings = async (settings: SecuritySettings) => {
    if (!currentOrgId) return;

    // Save 2FA setting
    const twoFAResult = await enforce2FA({
      orgId: currentOrgId,
      enabled: settings.require2FA,
    });

    // Save password policy
    const policyResult = await updatePasswordPolicy({
      orgId: currentOrgId,
      policy: settings.passwordPolicy,
    });

    if (twoFAResult.success && policyResult.success) {
      setSecuritySettings(settings);
      await refreshEvents(); // Refresh to show the audit log entries
    } else {
      throw new Error('Failed to save security settings');
    }
  };

  // Calculate stats
  const totalUsers = members.length;
  const activeUsers = members.filter(m => m.isActive).length;
  const activeSessions = sessions.length;
  const recentEvents = events.length;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 !flex-row">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">{activeUsers} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 !flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.last24h || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 !flex-row">
            <div className="flex items-center gap-2">
              <LogIn className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently logged in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 !flex-row">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">Recent activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="w-full sm:w-auto grid grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="users" className="flex-1">
                  <Users className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">User Management</span>
                  <span className="sm:hidden">Users</span>
                </TabsTrigger>
                <TabsTrigger value="access-control" className="flex-1">
                  <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Access Control</span>
                  <span className="sm:hidden">Access</span>
                </TabsTrigger>
                <TabsTrigger value="audit-trail" className="flex-1">
                  <History className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Audit Trail</span>
                  <span className="sm:hidden">Audit</span>
                </TabsTrigger>
                <TabsTrigger value="sessions" className="flex-1">
                  <LogIn className="h-4 w-4 mr-1 sm:mr-2" />
                  Sessions
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            {/* User Management Tab */}
            <TabsContent value="users" className="space-y-4 mt-0">
              {membersError ? (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>{membersError}</p>
                  </div>
                </div>
              ) : (
                <UserManagementTable
                  members={members}
                  currentUserRole={currentUserRole}
                  currentUserId={currentUserId}
                  onEditRole={handleEditRole}
                  onRemoveMember={handleRemoveMember}
                  onInviteMember={handleInviteMember}
                  isLoading={isLoadingMembers}
                />
              )}
            </TabsContent>

            {/* Access Control Tab */}
            <TabsContent value="access-control" className="space-y-6 mt-0">
              <PermissionsMatrix highlightRole={currentUserRole || undefined} />
              <PasswordPolicyEditor
                currentUserRole={currentUserRole}
                settings={securitySettings}
                onSave={handleSaveSecuritySettings}
              />
            </TabsContent>

            {/* Audit Trail Tab */}
            <TabsContent value="audit-trail" className="space-y-4 mt-0">
              {eventsError ? (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>{eventsError}</p>
                  </div>
                </div>
              ) : (
                <SecurityEventsList
                  events={events}
                  isLoading={isLoadingEvents}
                />
              )}
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="space-y-4 mt-0">
              {sessionsError ? (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>{sessionsError}</p>
                  </div>
                </div>
              ) : (
                <ActiveSessionsList
                  sessions={sessions}
                  currentUserId={currentUserId}
                  onRevokeSession={handleRevokeSession}
                  onRefresh={refreshSessions}
                  isLoading={isLoadingSessions}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Role Assignment Dialog */}
      <RoleAssignmentDialog
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        member={selectedMember}
        currentRole={currentUserRole || 'viewer'}
        onConfirm={handleConfirmRoleChange}
      />

      {/* Invite Member Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join the organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as typeof inviteRole)}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)} disabled={isInviting}>
              Cancel
            </Button>
            <Button onClick={handleConfirmInvite} disabled={!inviteEmail || isInviting}>
              {isInviting ? 'Sending...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove && (
                <>
                  This will remove <strong>{memberToRemove.user?.full_name || memberToRemove.user?.email}</strong> from the organization.
                  They will lose access to all organization resources.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
