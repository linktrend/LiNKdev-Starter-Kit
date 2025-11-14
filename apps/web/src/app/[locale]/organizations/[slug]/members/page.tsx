import { notFound } from 'next/navigation'

import { requireAuth, createClient } from '@/lib/auth/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InviteForm } from '@/components/org/InviteForm'
import { MemberRow } from '@/components/org/MemberRow'
import { OrgForbidden } from '@/components/org-states'
import { Badge } from '@/components/ui/badge'
import type { OrganizationMember, OrgRole } from '@starter/types'
import type { Database } from '@/types/database.types'

type OrganizationRow = Database['public']['Tables']['organizations']['Row']
type OrganizationMemberRow = Database['public']['Tables']['organization_members']['Row']
type InviteRow = Database['public']['Tables']['invites']['Row']
type UserRow = Database['public']['Tables']['users']['Row']

interface MembersPageProps {
  params: {
    locale: string
    slug: string
  }
}

export default async function OrganizationMembersPage({ params }: MembersPageProps) {
  const user = await requireAuth()
  const supabase = createClient() as any

  const { data: orgData } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', params.slug)
    .maybeSingle()

  const org = (orgData ?? null) as Pick<OrganizationRow, 'id' | 'name' | 'slug'> | null

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

  const { data: members } = await supabase
    .from('organization_members')
    .select('org_id, user_id, role, created_at')
    .eq('org_id', org.id)
    .order('created_at', { ascending: true })

  type MemberWithUser = OrganizationMemberRow & {
    users: {
      id: string
      email: string | null
      full_name: string | null
      avatar_url: string | null
    } | null
  }

  const memberRows = (members ?? []) as OrganizationMemberRow[]
  const memberUserIds = memberRows.map((member) => member.user_id)

  const { data: usersData } = await supabase
    .from('users')
    .select('id, email, full_name, avatar_url')
    .in('id', memberUserIds)

  const userMap = new Map<string, Pick<UserRow, 'id' | 'email' | 'full_name' | 'avatar_url'>>()
  const typedUsers = (usersData ?? []) as Pick<UserRow, 'id' | 'email' | 'full_name' | 'avatar_url'>[]
  typedUsers.forEach((user) => {
    userMap.set(user.id, user)
  })

  const normalizedMembers: OrganizationMember[] =
    memberRows.map((member) => {
      const userInfo = userMap.get(member.user_id)
      return {
        org_id: member.org_id,
        user_id: member.user_id,
        role: member.role,
        created_at: member.created_at ?? new Date().toISOString(),
        user: userInfo
          ? {
              id: userInfo.id,
              email: userInfo.email ?? '',
              user_metadata: {
                full_name: userInfo.full_name ?? undefined,
                avatar_url: userInfo.avatar_url ?? undefined,
              },
            }
          : undefined,
      }
    })

  const { data: invites } = await supabase
    .from('invites')
    .select('id, email, role, status, created_at, expires_at')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })
  type InviteSummary = Pick<InviteRow, 'id' | 'email' | 'role' | 'status' | 'created_at' | 'expires_at'>
  const inviteRows = (invites ?? []) as InviteSummary[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Members · {org.name}</h1>
        <p className="text-muted-foreground">Manage roles and invitations for this workspace.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Organization Members</CardTitle>
            <CardDescription>Update roles or remove access.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {normalizedMembers.map((memberRecord) => (
              <MemberRow
                key={memberRecord.user_id}
                member={memberRecord}
                currentUserRole={membership.role}
              />
            ))}
            {normalizedMembers.length === 0 && (
              <p className="text-sm text-muted-foreground">No members have been added yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invite Members</CardTitle>
              <CardDescription>Send email invites to collaborators.</CardDescription>
            </CardHeader>
            <CardContent>
              <InviteForm orgId={org.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>Invites awaiting acceptance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {inviteRows.length > 0 ? (
                inviteRows.map((invite) => (
                  <div
                    key={invite.id}
                    className="rounded-lg border p-3 text-sm flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{invite.email || 'Invite link'}</p>
                      <p className="text-xs text-muted-foreground">
                        Sent{' '}
                        {invite.created_at
                          ? new Date(invite.created_at).toLocaleDateString()
                          : '—'}{' '}
                        · Expires{' '}
                        {invite.expires_at
                          ? new Date(invite.expires_at).toLocaleDateString()
                          : '—'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="secondary" className="capitalize">
                        {invite.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">{invite.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No pending invitations.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
