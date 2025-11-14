'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface SwitcherOrganization {
  id: string
  name: string
  org_type: string
  is_personal: boolean
  user_role: string
}

interface OrgSwitcherProps {
  organizations: SwitcherOrganization[]
  currentOrgId?: string
  locale?: string
}

export function OrgSwitcher({ organizations, currentOrgId, locale = 'en' }: OrgSwitcherProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const currentOrg = organizations.find((org) => org.id === currentOrgId)

  function getOrgLabel(org: SwitcherOrganization) {
    if (org.is_personal) return 'My Workspace'
    switch (org.org_type) {
      case 'business':
        return 'Team'
      case 'family':
        return 'Family'
      case 'education':
        return 'Class'
      default:
        return 'Organization'
    }
  }

  function handleSelect(orgId: string) {
    router.push(`/${locale}/dashboard?org=${orgId}`)
    setOpen(false)
  }

  function handleCreate() {
    router.push(`/${locale}/organizations/new`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[220px] justify-between"
        >
          {currentOrg ? <span className="truncate">{currentOrg.name}</span> : 'Select organization'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0">
        <Command>
          <CommandInput placeholder="Search organization..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup heading="Personal">
              {organizations
                .filter((org) => org.is_personal)
                .map((org) => (
                  <CommandItem key={org.id} onSelect={() => handleSelect(org.id)}>
                    <Check
                      className={`mr-2 h-4 w-4 ${currentOrg?.id === org.id ? 'opacity-100' : 'opacity-0'}`}
                    />
                    {org.name}
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Organizations">
              {organizations
                .filter((org) => !org.is_personal)
                .map((org) => (
                  <CommandItem key={org.id} onSelect={() => handleSelect(org.id)}>
                    <Check
                      className={`mr-2 h-4 w-4 ${currentOrg?.id === org.id ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <div className="flex flex-col">
                      <span>{org.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {getOrgLabel(org)} · {org.user_role}
                      </span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem onSelect={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
