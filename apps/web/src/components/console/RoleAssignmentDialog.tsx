'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { getUserDisplay } from '@/utils/userDisplay';
import { getRoleDisplayName, getRoleDescription, getAssignableRoles, ROLE_PERMISSIONS } from '@/lib/security/permissions';
import type { OrgRole } from '@starter/types';
import type { OrgMember } from './UserManagementTable';

interface RoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: OrgMember | null;
  currentRole: OrgRole;
  onConfirm: (newRole: OrgRole) => Promise<void>;
}

export function RoleAssignmentDialog({
  open,
  onOpenChange,
  member,
  currentRole,
  onConfirm,
}: RoleAssignmentDialogProps) {
  const [selectedRole, setSelectedRole] = useState<OrgRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedRole || !member) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(selectedRole);
      onOpenChange(false);
      setSelectedRole(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      setSelectedRole(null);
      setError(null);
    }
  };

  if (!member) return null;

  const userDisplay = getUserDisplay({
    name: member.user?.full_name,
    email: member.user?.email,
  });

  const assignableRoles = getAssignableRoles();
  const isRoleChanged = selectedRole && selectedRole !== member.role;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Change Member Role</DialogTitle>
          <DialogDescription>
            Update the role for {userDisplay.primary}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Role */}
          <div className="space-y-2">
            <Label>Current Role</Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {getRoleDisplayName(member.role)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {getRoleDescription(member.role)}
              </span>
            </div>
          </div>

          {/* New Role Selection */}
          <div className="space-y-3">
            <Label>New Role</Label>
            <div className="space-y-2">
              {assignableRoles.map((role) => {
                const isSelected = selectedRole === role;
                const isCurrent = member.role === role;
                const permissions = ROLE_PERMISSIONS[role];

                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    disabled={isCurrent || isSubmitting}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                      ${isCurrent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      ${isSubmitting ? 'pointer-events-none' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">
                            {getRoleDisplayName(role)}
                          </span>
                          {isCurrent && (
                            <Badge variant="outline" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getRoleDescription(role)}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {permissions.slice(0, 4).map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {permissions.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{permissions.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Hierarchy Info */}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium">Role Hierarchy</p>
                <p className="text-muted-foreground">
                  Owner &gt; Admin &gt; Editor &gt; Viewer
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Higher roles have all permissions of lower roles, plus additional capabilities.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isRoleChanged || isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
