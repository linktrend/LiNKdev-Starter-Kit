import { notFound } from 'next/navigation'

import { requireAuth, createClient } from '@/lib/auth/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { OrgForbidden } from '@/components/org-states'
import { OrganizationSettingsForm } from '@/components/organization/organization-settings-form'
import { LeaveOrganizationButton } from '@/components/organization/leave-organization-button'
import type { OrgRole } from '@starter/types'
import type { Database } from '@/types/database.types'

type OrganizationRow = Database['public']['Tables']['organizations']['Row']

interface SettingsPageProps {
  params: {
    locale: string
    slug: string
  }
}

export default async function OrganizationSettingsPage({ params }: SettingsPageProps) {
  const user = await requireAuth()
  const supabase = createClient() as any

  const { data: orgData } = await supabase
    .from('organizations')
    .select('id, name, slug, description')
    .eq('slug', params.slug)
    .maybeSingle()

  const org = (orgData ?? null) as Pick<OrganizationRow, 'id' | 'name' | 'slug' | 'description'> | null

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

  const isOwner = membership.role === 'owner'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">Update workspace details and manage access.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Edit the organization name and description.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isOwner && (
            <Alert>
              <AlertDescription>
                Only owners can edit organization details. Contact an owner to request changes.
              </AlertDescription>
            </Alert>
          )}
          <OrganizationSettingsForm
            orgId={org.id}
            locale={params.locale}
            initialName={org.name}
            initialDescription={org.description}
            canEdit={isOwner}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>Leave this workspace if you no longer need access.</CardDescription>
        </CardHeader>
        <CardContent>
          {isOwner ? (
            <Alert>
              <AlertDescription>
                Transfer ownership to another member before leaving this organization.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                This will remove your access immediately. You&apos;ll need a new invite to rejoin.
              </p>
              <LeaveOrganizationButton orgId={org.id} locale={params.locale} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
