# Phase 2.3: Organization Management

## 📋 Project Rules & Guardrails

**Before starting implementation, review these project rule files:**

1. **`.cursor/01-foundation.mdc`** - Monorepo structure, TypeScript config, package management, commit hygiene
2. **`.cursor/02-web-nextjs.mdc`** - Next.js App Router conventions, styling, data fetching, auth integration
3. **`.cursor/04-supabase.mdc`** - Database migrations, RLS policies, auth, edge functions, typed queries
4. **`.cursor/06-quality.mdc`** - Type-checking, linting, formatting, build verification requirements
5. **`.cursor/07-testing.mdc`** - Testing workflow, unit/integration/E2E test requirements
6. **`.cursor/12-mcp-rules.mdc`** - MCP server usage for database inspection and verification

---

## 🔒 Critical Guardrails for This Implementation

**From 01-foundation.mdc:**
- ✅ Use `pnpm` for package management
- ✅ Follow conventional commits: `type(scope): description`
- ✅ Never commit secrets

**From 02-web-nextjs.mdc:**
- ✅ Use **Server Components by default**
- ✅ Validate all inputs with **Zod** schemas
- ✅ Style with **Tailwind CSS** exclusively
- ✅ Use **shadcn/ui** components

**From 04-supabase.mdc:**
- ✅ **NO direct schema changes**
- ✅ **RLS enabled on all tables**
- ✅ Use service role key only in server actions

**From 06-quality.mdc:**
- ✅ Pass all quality gates

**From 07-testing.mdc:**
- ✅ Write tests for all new code

---

## 🎯 Phase Overview

**Goal:** Implement organization management including creation, member invitations, role management, and organization switching.

**Scope:**
1. Create organization creation flow (business, family, education)
2. Implement member invitation system (email + invite links)
3. Build org member management (add, remove, role changes)
4. Create organization switcher UI component
5. Implement org settings page
6. Add email invite functionality
7. Test multi-org membership and switching

**Dependencies:**
- Phase 2.1 (Auth) and 2.2 (Profile) complete
- Database has organizations, organization_members tables
- Personal orgs already created for existing users

---

## 📝 Implementation Steps

### Step 1: Create Organization Validation Schemas

**File to create:** `apps/web/lib/validation/organization.ts`

```typescript
import { z } from 'zod'

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  org_type: z.enum(['personal', 'business', 'family', 'education', 'other']),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional().nullable(),
})

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  settings: z.record(z.any()).optional(),
})

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'viewer']),
  org_id: z.string().uuid(),
})

export const updateMemberRoleSchema = z.object({
  user_id: z.string().uuid(),
  org_id: z.string().uuid(),
  new_role: z.enum(['owner', 'member', 'viewer']),
})

export const createInviteLinkSchema = z.object({
  org_id: z.string().uuid(),
  role: z.enum(['member', 'viewer']),
  expires_in_days: z.number().min(1).max(30).default(7),
})

export type CreateOrganization = z.infer<typeof createOrganizationSchema>
export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>
export type InviteMember = z.infer<typeof inviteMemberSchema>
export type UpdateMemberRole = z.infer<typeof updateMemberRoleSchema>
export type CreateInviteLink = z.infer<typeof createInviteLinkSchema>
```

---

### Step 2: Create Organization Server Actions

**File to create:** `apps/web/app/actions/organization.ts`

```typescript
'use server'

import { createClient } from '@/lib/auth/server'
import { requireAuth } from '@/lib/auth/server'
import { revalidatePath } from 'next/cache'
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '@/lib/validation/organization'
import { randomBytes } from 'crypto'

/**
 * Create a new organization
 */
export async function createOrganization(formData: FormData) {
  const user = await requireAuth()
  const supabase = createClient()

  const data = {
    name: formData.get('name'),
    org_type: formData.get('org_type'),
    slug: formData.get('slug'),
    description: formData.get('description') || null,
  }

  const validation = createOrganizationSchema.safeParse(data)

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const validatedData = validation.data

  // Check slug availability
  const { data: existing } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', validatedData.slug)
    .maybeSingle()

  if (existing) {
    return { error: { slug: ['This slug is already taken'] } }
  }

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: validatedData.name,
      org_type: validatedData.org_type,
      slug: validatedData.slug,
      description: validatedData.description,
      owner_id: user.id,
      is_personal: false,
    })
    .select()
    .single()

  if (orgError) {
    console.error('Error creating organization:', orgError)
    return { error: { form: ['Failed to create organization'] } }
  }

  // Add creator as owner
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      org_id: org.id,
      user_id: user.id,
      role: 'owner',
    })

  if (memberError) {
    console.error('Error adding owner as member:', memberError)
    // Rollback org creation if member insert fails
    await supabase.from('organizations').delete().eq('id', org.id)
    return { error: { form: ['Failed to create organization'] } }
  }

  revalidatePath('/[locale]/dashboard', 'page')
  return { success: true, organization: org }
}

/**
 * Get user's organizations
 */
export async function getUserOrganizations() {
  const user = await requireAuth()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      role,
      organizations (
        id,
        name,
        org_type,
        slug,
        description,
        avatar_url,
        is_personal,
        owner_id,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { foreignTable: 'organizations', ascending: false })

  if (error) {
    console.error('Error fetching organizations:', error)
    return []
  }

  return data.map((item) => ({
    ...item.organizations,
    user_role: item.role,
  }))
}

/**
 * Invite member via email
 */
export async function inviteMember(formData: FormData) {
  const user = await requireAuth()
  const supabase = createClient()

  const data = {
    email: formData.get('email'),
    role: formData.get('role'),
    org_id: formData.get('org_id'),
  }

  const validation = inviteMemberSchema.safeParse(data)

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const { email, role, org_id } = validation.data

  // Check if user has permission to invite (owner or admin)
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', org_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'member'].includes(membership.role)) {
    return { error: { form: ['You do not have permission to invite members'] } }
  }

  // TODO: Send email invitation
  // For now, create a pending invitation record

  return { success: true, message: 'Invitation sent' }
}

/**
 * Remove member from organization
 */
export async function removeMember(orgId: string, userId: string) {
  const currentUser = await requireAuth()
  const supabase = createClient()

  // Check permissions
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', currentUser.id)
    .single()

  if (!membership || !['owner', 'member'].includes(membership.role)) {
    return { error: 'You do not have permission to remove members' }
  }

  // Cannot remove owner
  const { data: targetMember } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single()

  if (targetMember?.role === 'owner') {
    return { error: 'Cannot remove the organization owner' }
  }

  // Remove member
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('org_id', orgId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error removing member:', error)
    return { error: 'Failed to remove member' }
  }

  revalidatePath('/[locale]/organizations/[slug]', 'page')
  return { success: true }
}

/**
 * Update member role
 */
export async function updateMemberRole(
  orgId: string,
  userId: string,
  newRole: 'owner' | 'member' | 'viewer'
) {
  const currentUser = await requireAuth()
  const supabase = createClient()

  // Only owner can change roles
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', currentUser.id)
    .single()

  if (membership?.role !== 'owner') {
    return { error: 'Only the owner can change member roles' }
  }

  // Update role
  const { error } = await supabase
    .from('organization_members')
    .update({ role: newRole })
    .eq('org_id', orgId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating member role:', error)
    return { error: 'Failed to update member role' }
  }

  revalidatePath('/[locale]/organizations/[slug]', 'page')
  return { success: true }
}

/**
 * Leave organization
 */
export async function leaveOrganization(orgId: string) {
  const user = await requireAuth()
  const supabase = createClient()

  // Check if user is owner
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (membership?.role === 'owner') {
    return { error: 'Owner cannot leave. Transfer ownership first.' }
  }

  // Remove membership
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('org_id', orgId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error leaving organization:', error)
    return { error: 'Failed to leave organization' }
  }

  revalidatePath('/[locale]/dashboard', 'page')
  return { success: true }
}
```

---

### Step 3: Create Organization Switcher Component

**File to create:** `apps/web/components/organization/org-switcher.tsx`

```typescript
'use client'

import { useState } from 'react'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useRouter } from 'next/navigation'

interface Organization {
  id: string
  name: string
  org_type: string
  is_personal: boolean
  user_role: string
}

interface OrgSwitcherProps {
  organizations: Organization[]
  currentOrgId?: string
}

export function OrgSwitcher({ organizations, currentOrgId }: OrgSwitcherProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const currentOrg = organizations.find((org) => org.id === currentOrgId)

  function getOrgLabel(org: Organization) {
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {currentOrg ? (
            <span className="truncate">{currentOrg.name}</span>
          ) : (
            'Select organization'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search organization..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup heading="Personal">
              {organizations
                .filter((org) => org.is_personal)
                .map((org) => (
                  <CommandItem
                    key={org.id}
                    onSelect={() => {
                      router.push(`/en/dashboard?org=${org.id}`)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        currentOrg?.id === org.id ? 'opacity-100' : 'opacity-0'
                      }`}
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
                  <CommandItem
                    key={org.id}
                    onSelect={() => {
                      router.push(`/en/dashboard?org=${org.id}`)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        currentOrg?.id === org.id ? 'opacity-100' : 'opacity-0'
                      }`}
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
              <CommandItem
                onSelect={() => {
                  router.push('/en/organizations/new')
                  setOpen(false)
                }}
              >
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
```

---

### Step 4: Create Organization Pages

**Files to create:**
- `apps/web/app/[locale]/organizations/new/page.tsx` - Create org form
- `apps/web/app/[locale]/organizations/[slug]/page.tsx` - Org details
- `apps/web/app/[locale]/organizations/[slug]/members/page.tsx` - Member management
- `apps/web/app/[locale]/organizations/[slug]/settings/page.tsx` - Org settings

**Example: Create Organization Page**

```typescript
// apps/web/app/[locale]/organizations/new/page.tsx
import { requireAuth } from '@/lib/auth/server'
import CreateOrganizationForm from '@/components/organization/create-org-form'

export default async function NewOrganizationPage() {
  await requireAuth()

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Organization</h1>
        <p className="text-muted-foreground">
          Create a new team, family group, or educational organization.
        </p>
      </div>

      <CreateOrganizationForm />
    </div>
  )
}
```

---

## ✅ Acceptance Criteria

- [ ] Organization validation schemas created
- [ ] Organization CRUD server actions implemented
- [ ] Organization switcher component functional
- [ ] Create organization flow works
- [ ] Member invitation system implemented
- [ ] Member management (add/remove/role changes) works
- [ ] Users can be members of multiple orgs
- [ ] Org switcher shows all user's orgs
- [ ] Personal orgs labeled as "My Workspace"
- [ ] Invite links generated and validated
- [ ] Email invites sent (or stubbed for now)
- [ ] Integration tests pass
- [ ] E2E tests pass

---

## ✅ Definition of Done Checklist

- [ ] All acceptance criteria met
- [ ] TypeScript strict mode - zero errors
- [ ] ESLint + Prettier pass
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Zod schemas validate all inputs
- [ ] RLS policies enforce security
- [ ] Accessibility requirements met
- [ ] MCP verification performed

---

## 🔍 Verification Commands

```bash
cd apps/web && pnpm typecheck && pnpm lint && pnpm test && pnpm e2e && pnpm build

# Verify orgs via MCP
call SupabaseMCP.select {"table": "organizations", "select": "id,name,org_type,is_personal,owner_id", "limit": 10}
call SupabaseMCP.select {"table": "organization_members", "select": "org_id,user_id,role", "limit": 10}
```

---

## 🚀 Next Phase

**Phase 2.4: API Routes & Username Checker** - Create API endpoints for real-time validation and data access


