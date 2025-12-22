'use client';

import { Building2, Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { useOrg } from '@/contexts/OrgContext';

export function OrgSwitcher() {
  const { organizations, currentOrgId, switchOrg, isLoading } = useOrg();

  const currentOrg = organizations.find((org) => org.id === currentOrgId);

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Spinner size="sm" />
        Loading orgs
      </Button>
    );
  }

  if (!organizations.length) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2 text-muted-foreground">
        <Building2 className="h-4 w-4" />
        No organizations
      </Button>
    );
  }

  // If only one org, render a static pill
  if (organizations.length === 1 && currentOrg) {
    return (
      <Button variant="outline" size="sm" className="gap-2" disabled>
        <Building2 className="h-4 w-4" />
        <span className="font-medium">{currentOrg.name}</span>
        <span className="text-xs text-muted-foreground">Role: {currentOrg.role ?? 'member'}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-64 justify-between gap-2 px-3"
          aria-label="Switch organization"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 text-primary" />
            <div className="flex flex-col items-start truncate">
              <span className="text-sm font-medium truncate">
                {currentOrg?.name ?? 'Select an organization'}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {currentOrg?.role ? `Role: ${currentOrg.role}` : 'Member'}
                {currentOrg?.is_personal ? ' · Personal' : ''}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => {
          const isActive = org.id === currentOrgId;
          return (
            <DropdownMenuItem
              key={org.id}
              onSelect={() => switchOrg(org.id)}
              className="flex items-start gap-2 py-2"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{org.name}</span>
                  {isActive && <Check className="h-4 w-4 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  Role: {org.role ?? 'member'}
                  {org.is_personal ? ' · Personal' : ''}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
