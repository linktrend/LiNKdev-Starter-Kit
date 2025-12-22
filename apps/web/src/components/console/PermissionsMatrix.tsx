'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableContainer } from '@/components/ui/table-container';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { ROLE_PERMISSIONS, PERMISSION_DESCRIPTIONS, getRoleDisplayName, getRoleDescription } from '@/lib/security/permissions';
import type { OrgRole } from '@starter/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ALL_PERMISSIONS = [
  'manage_org',
  'manage_members',
  'manage_roles',
  'manage_security',
  'manage_billing',
  'manage_invites',
  'view_audit',
  'manage_sessions',
  'view_content',
  'edit_content',
  'delete_content',
] as const;

const PERMISSION_CATEGORIES = {
  'Organization Management': ['manage_org', 'manage_security', 'manage_billing'],
  'Member Management': ['manage_members', 'manage_roles', 'manage_invites'],
  'Security & Audit': ['view_audit', 'manage_sessions'],
  'Content Management': ['view_content', 'edit_content', 'delete_content'],
};

interface PermissionsMatrixProps {
  showCategories?: boolean;
  highlightRole?: OrgRole;
}

export function PermissionsMatrix({
  showCategories = true,
  highlightRole,
}: PermissionsMatrixProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(PERMISSION_CATEGORIES))
  );

  const roles: OrgRole[] = ['owner', 'admin', 'editor', 'viewer'];

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const hasPermission = (role: OrgRole, permission: string): boolean => {
    return ROLE_PERMISSIONS[role].includes(permission as never);
  };

  const renderPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? (
      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 mx-auto" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 opacity-30 mx-auto" />
    );
  };

  const renderPermissionRow = (permission: string) => {
    const permissionLabel = permission
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return (
      <TableRow key={permission}>
        <TableCell className="font-medium sticky left-0 z-10 bg-background/95 backdrop-blur">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  <span className="text-sm">{permissionLabel}</span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-sm">{PERMISSION_DESCRIPTIONS[permission]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        {roles.map((role) => (
          <TableCell
            key={role}
            className={`text-center ${highlightRole === role ? 'bg-primary/5' : ''}`}
          >
            {renderPermissionIcon(hasPermission(role, permission))}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions Matrix</CardTitle>
        <CardDescription>
          Overview of permissions granted to each role
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Role Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {roles.map((role) => (
            <div
              key={role}
              className={`p-3 rounded-lg border ${
                highlightRole === role ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={role === 'owner' ? 'default' : 'secondary'} className="capitalize">
                  {getRoleDisplayName(role)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{getRoleDescription(role)}</p>
            </div>
          ))}
        </div>

        {/* Permissions Table */}
        <TableContainer id="permissions-matrix-table" height="lg">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-20 bg-background w-64">
                  Permission
                </TableHead>
                {roles.map((role) => (
                  <TableHead
                    key={role}
                    className={`text-center ${highlightRole === role ? 'bg-primary/5' : ''}`}
                  >
                    <span className="capitalize">{getRoleDisplayName(role)}</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {showCategories ? (
                Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                  <>
                    <TableRow key={`category-${category}`} className="bg-muted/50">
                      <TableCell
                        colSpan={5}
                        className="font-semibold cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => toggleCategory(category)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{category}</span>
                          <Badge variant="outline" className="text-xs">
                            {permissions.length}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedCategories.has(category) &&
                      permissions.map((permission) => renderPermissionRow(permission))}
                  </>
                ))
              ) : (
                ALL_PERMISSIONS.map((permission) => renderPermissionRow(permission))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
            <span>Granted</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 opacity-30" />
            <span>Not Granted</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Role Hierarchy</p>
              <p className="text-muted-foreground">
                Roles follow a hierarchy: <strong>Owner</strong> &gt; <strong>Admin</strong> &gt;{' '}
                <strong>Editor</strong> &gt; <strong>Viewer</strong>. Higher roles inherit all
                permissions from lower roles and add additional capabilities.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
