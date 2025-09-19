'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, Plus, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { api } from '@/trpc/react';
import { Organization } from '@/types/org';

interface OrgSwitcherProps {
  currentOrg?: Organization | null;
  onOrgChange?: (org: Organization) => void;
}

export function OrgSwitcher({ currentOrg, onOrgChange }: OrgSwitcherProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { data: orgsData = [], isLoading } = api.org.listOrgs.useQuery();
  const orgs = orgsData as Organization[];
  const setCurrentMutation = api.org.setCurrent.useMutation({
    onSuccess: () => {
      setOpen(false);
    },
  });

  const handleOrgSelect = async (org: any) => {
    try {
      await setCurrentMutation.mutateAsync({ orgId: org.id });
      onOrgChange?.(org);
    } catch (error) {
      console.error('Failed to switch organization:', error);
    }
  };

  const handleCreateOrg = () => {
    router.push('/settings/organization');
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Building2 className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <Building2 className="mr-2 h-4 w-4" />
          {currentOrg ? currentOrg.name : 'Select organization...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandList>
            <CommandEmpty>No organizations found.</CommandEmpty>
            <CommandGroup>
              {orgs.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.name}
                  onSelect={() => handleOrgSelect(org)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      currentOrg?.id === org.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <Building2 className="mr-2 h-4 w-4" />
                  {org.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <CommandItem onSelect={handleCreateOrg}>
                <Plus className="mr-2 h-4 w-4" />
                Create organization
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
