import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, ShieldCheck, Users } from 'lucide-react'

import { requireAuth, createClient } from '@/lib/auth/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OrgForbidden } from '@/components/org-states'
import { OrgSwitcher } from '@/components/organization/org-switcher'
import type { OrgRole } from '@starter/types'
import type { Database } from '@/types/database.types'

type OrganizationRow = Database['public']['Tables']['organizations']['Row']

interface OrganizationPageProps {
  params: {
    locale: string
    slug: string
  }
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const user = await requireAuth()
  const supabase = createClient() as any

  const { data: orgData, error } = await supabase
    .from('organizations')
    .select('id, name, slug, org_type, is_personal, description, owner_id, created_at')
    .eq('slug', params.slug)
    .maybeSingle()

  const org = (orgData ?? null) as OrganizationRow | null

  if (error) {
    console.error('Error fetching organization:', error)
  }

  if (!org) {
    notFound()
  }

  const { data: membershipData } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', user.id)
    .maybeSingle()

  const membership = (membershipData ?? null) as { role: OrgRole } | null

  if (!membership) {
    return <OrgForbidden />
  }

  const { count: memberCount } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', org.id)

  const { data: orgOptions } = await supabase
    .from('organization_members')
    .select(
      `
        role,
        organizations (
          id,
          name,
          org_type,
          is_personal,
          slug
        )
      `
    )
    .eq('user_id', user.id)
    .order('created_at', { foreignTable: 'organizations', ascending: false })

  type OrganizationOption = {
    role: string
    organizations: Pick<OrganizationRow, 'id' | 'name' | 'org_type' | 'is_personal' | 'slug'> | null
  }

  const optionRows = (orgOptions ?? []) as OrganizationOption[]

  const organizations =
    optionRows
      .filter((item): item is { role: string; organizations: NonNullable<OrganizationOption['organizations']> } => Boolean(item.organizations))
      .map((item) => ({
        id: item.organizations.id,
        name: item.organizations.name,
        org_type: item.organizations.org_type ?? 'organization',
        is_personal: Boolean(item.organizations.is_personal),
        user_role: item.role,
      })) ?? []

  const createdDate = org.created_at ? new Date(org.created_at).toLocaleDateString() : null
  const orgTypeLabel = org.org_type ?? 'organization'

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{org.name}</h1>
            {org.is_personal && <Badge>My Workspace</Badge>}
          </div>
          <p className="text-muted-foreground">
            {org.description || 'Manage members, invites, and settings for this workspace.'}
          </p>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              {membership.role.charAt(0).toUpperCase() + membership.role.slice(1)} access
            </span>
            {createdDate && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                Created {createdDate}
              </span>
            )}
          </div>
        </div>
        <OrgSwitcher organizations={organizations} currentOrgId={org.id} locale={params.locale} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Users className="h-4 w-4 text-primary" />
              Members
            </CardTitle>
            <CardDescription>People with access to this organization</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{memberCount ?? 0}</p>
            <Button asChild variant="link" className="px-0 text-primary">
              <Link href={`/${params.locale}/organizations/${org.slug}/members`}>Manage members</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Organization Type</CardTitle>
            <CardDescription>Used for billing and personalization</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold capitalize">{orgTypeLabel}</p>
            <p className="text-sm text-muted-foreground">
              Personal workspaces are private to you. Business and other workspaces can invite collaborators.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Settings</CardTitle>
            <CardDescription>Control invitations, roles, and profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href={`/${params.locale}/organizations/${org.slug}/settings`}>Open settings</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={`/${params.locale}/organizations/${org.slug}/members`}>View members</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About this organization</CardTitle>
          <CardDescription>Key information for teammates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Workspace ID: <span className="font-mono text-primary">{org.id}</span>
          </p>
          <p className="text-sm text-muted-foreground capitalize">Type: {orgTypeLabel}</p>
          <p>{org.description || 'Add a description to help teammates understand this workspace.'}</p>
        </CardContent>
      </Card>
    </div>
  )
}
