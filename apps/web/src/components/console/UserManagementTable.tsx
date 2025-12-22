'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getBadgeClasses } from '@/components/ui/badge.presets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableContainer } from '@/components/ui/table-container';
import { DateTimeCell, UserOrgCell } from '@/components/ui/table-utils';
import { TableHeadText, TableHeadStatus, TableCellText, TableCellStatus, ActionIconsCell } from '@/components/ui/table-cells';
import { TableHeadAction, TableCellAction } from '@/components/ui/table-columns';
import { Search, Edit, Trash2, UserPlus } from 'lucide-react';
import { getUserDisplay } from '@/utils/userDisplay';
import type { OrgRole } from '@starter/types';

export interface OrgMember {
  user_id: string;
  role: OrgRole;
  created_at: string;
  lastLogin: string | null;
  isActive: boolean;
  user: {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    account_type: 'super_admin' | 'admin' | 'user' | null;
  } | null;
}

interface UserManagementTableProps {
  members: OrgMember[];
  currentUserRole: OrgRole | null;
  currentUserId: string;
  onEditRole: (member: OrgMember) => void;
  onRemoveMember: (member: OrgMember) => void;
  onInviteMember: () => void;
  isLoading?: boolean;
}

export function UserManagementTable({
  members,
  currentUserRole,
  currentUserId,
  onEditRole,
  onRemoveMember,
  onInviteMember,
  isLoading = false,
}: UserManagementTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | OrgRole>('all');

  const filteredMembers = members.filter((member) => {
    // Role filter
    if (roleFilter !== 'all' && member.role !== roleFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const email = member.user?.email?.toLowerCase() || '';
      const name = member.user?.full_name?.toLowerCase() || '';
      return email.includes(query) || name.includes(query);
    }

    return true;
  });

  const getRoleBadge = (role: OrgRole) => {
    const variants: Record<OrgRole, string> = {
      owner: 'default',
      admin: 'secondary',
      editor: 'outline',
      member: 'outline',
      viewer: 'outline',
    };
    return (
      <Badge variant={variants[role] as any} className="capitalize">
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className={getBadgeClasses('security.active')}>Active</Badge>
    ) : (
      <Badge className={getBadgeClasses('security.inactive')}>Inactive</Badge>
    );
  };

  const canEditMember = (member: OrgMember) => {
    // Can't edit yourself
    if (member.user_id === currentUserId) return false;
    // Only owners can edit roles
    return currentUserRole === 'owner';
  };

  const canRemoveMember = (member: OrgMember) => {
    // Can't remove yourself
    if (member.user_id === currentUserId) return false;
    // Can't remove owners
    if (member.role === 'owner') return false;
    // Owners and admins can remove members
    return currentUserRole === 'owner' || currentUserRole === 'admin';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="px-3 py-2 border rounded-lg text-sm bg-background"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
            <Button onClick={onInviteMember}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          )}
        </div>
      </div>

      <TableContainer id="user-management-table" height="lg">
        <Table className="min-w-[1200px] [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-4">
          <TableHeader>
            <TableRow>
              <TableHeadText className="min-w-0 max-w-[30%]">User</TableHeadText>
              <TableHeadText className="w-32">Role</TableHeadText>
              <TableHeadStatus className="w-28">Status</TableHeadStatus>
              <TableHeadText className="w-40">Last Login</TableHeadText>
              <TableHeadText className="w-40">Member Since</TableHeadText>
              <TableHeadAction className="w-32">Actions</TableHeadAction>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading members...
                </TableCell>
              </TableRow>
            ) : filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => {
                const userDisplay = getUserDisplay({
                  name: member.user?.full_name,
                  email: member.user?.email,
                });
                const isSelf = member.user_id === currentUserId;

                return (
                  <TableRow key={member.user_id}>
                    <TableCellText className="min-w-0 max-w-[30%]">
                      <UserOrgCell
                        primary={userDisplay.primary}
                        secondary={userDisplay.secondary}
                      />
                      {isSelf && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          You
                        </Badge>
                      )}
                    </TableCellText>
                    <TableCellText className="w-32">
                      {getRoleBadge(member.role)}
                    </TableCellText>
                    <TableCellStatus className="w-28">
                      {getStatusBadge(member.isActive)}
                    </TableCellStatus>
                    <TableCellText className="w-40">
                      {member.lastLogin ? (
                        <DateTimeCell date={new Date(member.lastLogin)} />
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCellText>
                    <TableCellText className="w-40">
                      <DateTimeCell date={new Date(member.created_at)} />
                    </TableCellText>
                    <TableCellAction className="w-32">
                      <ActionIconsCell>
                        {canEditMember(member) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditRole(member)}
                            title="Edit role"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canRemoveMember(member) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveMember(member)}
                            title="Remove member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {!canEditMember(member) && !canRemoveMember(member) && (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </ActionIconsCell>
                    </TableCellAction>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
