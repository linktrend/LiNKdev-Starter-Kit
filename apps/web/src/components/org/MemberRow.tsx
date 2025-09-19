'use client';

import { useState } from 'react';
import { MoreHorizontal, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { OrganizationMember, OrgRole } from '@/types/org';
import { api } from '@/trpc/react';
import { canManageMembers, canChangeRole } from '@/utils/org';

interface MemberRowProps {
  member: OrganizationMember;
  currentUserRole?: OrgRole;
  onRoleChange?: () => void;
  onMemberRemove?: () => void;
}

const ROLE_LABELS: Record<OrgRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

export function MemberRow({ 
  member, 
  currentUserRole = 'viewer',
  onRoleChange,
  onMemberRemove 
}: MemberRowProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateRoleMutation = api.org.updateMemberRole.useMutation({
    onSuccess: () => {
      setIsUpdating(false);
      onRoleChange?.();
    },
    onError: () => {
      setIsUpdating(false);
    },
  });

  const removeMemberMutation = api.org.removeMember.useMutation({
    onSuccess: () => {
      setShowRemoveDialog(false);
      onMemberRemove?.();
    },
  });

  const handleRoleChange = async (newRole: string) => {
    if (!member.org_id || !canChangeRole(member.role, newRole as OrgRole, currentUserRole)) {
      return;
    }

    setIsUpdating(true);
    try {
      await updateRoleMutation.mutateAsync({
        orgId: member.org_id,
        userId: member.user_id,
        role: newRole as OrgRole,
      });
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleRemoveMember = async () => {
    if (!member.org_id) return;

    try {
      await removeMemberMutation.mutateAsync({
        orgId: member.org_id,
        userId: member.user_id,
      });
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const canManage = canManageMembers(currentUserRole);
  const canChangeThisRole = canChangeRole(member.role, member.role, currentUserRole);

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            {member.user?.user_metadata?.avatar_url ? (
              <img
                src={member.user.user_metadata.avatar_url}
                alt={member.user.email}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <div>
            <p className="font-medium">
              {member.user?.user_metadata?.full_name || member.user?.email || 'Unknown User'}
            </p>
            <p className="text-sm text-muted-foreground">
              {member.user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select
            value={member.role}
            onValueChange={handleRoleChange}
            disabled={!canManage || !canChangeThisRole || isUpdating}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_LABELS).map(([role, label]) => (
                <SelectItem 
                  key={role} 
                  value={role}
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {canManage && member.role !== 'owner' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowRemoveDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {member.user?.email} from this organization? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
