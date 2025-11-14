'use server'

import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'

import { createClient, requireAuth } from '@/lib/auth/server'
import { routing } from '@/i18n/routing'
import {
  createInviteLinkSchema,
  createOrganizationSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  updateOrganizationSchema,
} from '@/lib/validation/organization'

type FieldErrors = Record<string, string[]>
type OrganizationOption = {
  role: string
  organizations: {
    id: string
    name: string
    org_type: string | null
    slug: string | null
    description?: string | null
    avatar_url?: string | null
    is_personal: boolean | null
    owner_id?: string
    created_at?: string | null
  } | null
}

function resolveLocale(value?: FormDataEntryValue | null): string {
  if (value && typeof value === 'string') {
    return value
  }
  return routing.defaultLocale ?? 'en'
}

async function revalidateOrgViews(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
  options?: { locale?: string; slug?: string | null }
) {
  const locale = options?.locale ?? routing.defaultLocale ?? 'en'
  let slug = options?.slug ?? null

  if (!slug) {
    const slugResult = await supabase.from('organizations').select('slug').eq('id', orgId).maybeSingle()
    const slugData = (slugResult.data ?? null) as { slug: string | null } | null

    if (slugResult.error && slugResult.error.code !== 'PGRST116') {
      console.error('Error fetching organization slug:', slugResult.error)
    }

    slug = (slugData?.slug as string | null) ?? null
  }

  revalidatePath('/', 'layout')
  revalidatePath(`/${locale}/dashboard`, 'page')

  if (slug) {
    revalidatePath(`/${locale}/organizations/${slug}`, 'page')
    revalidatePath(`/${locale}/organizations/${slug}/members`, 'page')
    revalidatePath(`/${locale}/organizations/${slug}/settings`, 'page')
  }
}

function normalizeNullable(value: FormDataEntryValue | null): string | null {
  if (value === null) return null
  if (typeof value !== 'string') return null
  return value.trim() === '' ? null : value
}

/**
 * Create a new organization
 */
export async function createOrganization(formData: FormData) {
  const user = await requireAuth()
  const supabase = createClient() as any
  const locale = resolveLocale(formData.get('locale'))

  const payload = {
    name: formData.get('name'),
    org_type: formData.get('org_type'),
    slug: formData.get('slug'),
    description: normalizeNullable(formData.get('description')),
  }

  const validation = createOrganizationSchema.safeParse(payload)

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const validated = validation.data

  const { data: existing, error: slugLookupError } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', validated.slug)
    .maybeSingle()

  if (slugLookupError && slugLookupError.code !== 'PGRST116') {
    console.error('Error checking slug availability:', slugLookupError)
    return { error: { form: ['Unable to verify slug availability'] } satisfies FieldErrors }
  }

  if (existing) {
    return { error: { slug: ['This slug is already taken'] } satisfies FieldErrors }
  }

  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: validated.name,
      org_type: validated.org_type,
      slug: validated.slug,
      description: validated.description,
      owner_id: user.id,
      is_personal: false,
      avatar_url: null,
      settings: {},
    })
    .select()
    .single()

  const org = (orgData ?? null) as { id: string; slug: string | null } | null

  if (orgError || !org) {
    console.error('Error creating organization:', orgError)
    return { error: { form: ['Failed to create organization'] } satisfies FieldErrors }
  }

  const { error: memberError } = await supabase.from('organization_members').insert({
    org_id: org.id,
    user_id: user.id,
    role: 'owner',
  })

  if (memberError) {
    console.error('Error adding owner as member:', memberError)
    await supabase.from('organizations').delete().eq('id', org.id)
    return { error: { form: ['Failed to create organization'] } satisfies FieldErrors }
  }

  await revalidateOrgViews(supabase, org.id, { locale, slug: org.slug })
  return { success: true, organization: org }
}

/**
 * Update organization metadata
 */
export async function updateOrganization(formData: FormData) {
  const user = await requireAuth()
  const supabase = createClient() as any
  const locale = resolveLocale(formData.get('locale'))

  const orgId = formData.get('org_id')
  if (typeof orgId !== 'string' || !orgId) {
    return { error: { form: ['Organization ID is required'] } satisfies FieldErrors }
  }

  const settingsValue = formData.get('settings')
  let parsedSettings: Record<string, unknown> | undefined

  if (typeof settingsValue === 'string' && settingsValue.trim().length > 0) {
    try {
      parsedSettings = JSON.parse(settingsValue)
    } catch {
      return { error: { settings: ['Settings must be valid JSON'] } satisfies FieldErrors }
    }
  }

  const nameValue = normalizeNullable(formData.get('name'))

  const payload = {
    ...(nameValue ? { name: nameValue } : {}),
    description: normalizeNullable(formData.get('description')),
    avatar_url: normalizeNullable(formData.get('avatar_url')),
    settings: parsedSettings,
  }

  const validation = updateOrganizationSchema.safeParse(payload)
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (membership?.role !== 'owner') {
    return { error: { form: ['Only the owner can update organization settings'] } satisfies FieldErrors }
  }

  const { error } = await supabase
    .from('organizations')
    .update({
      ...validation.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orgId)

  if (error) {
    console.error('Error updating organization:', error)
    return { error: { form: ['Failed to update organization'] } satisfies FieldErrors }
  }

  await revalidateOrgViews(supabase, orgId, { locale })
  return { success: true }
}

/**
 * Get the organizations the current user belongs to
 */
export async function getUserOrganizations() {
  const user = await requireAuth()
  const supabase = createClient() as any

  const { data, error } = await supabase
    .from('organization_members')
    .select(
      `
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
      `
    )
    .eq('user_id', user.id)
    .order('created_at', { foreignTable: 'organizations', ascending: false })

  if (error) {
    console.error('Error fetching organizations:', error)
    return []
  }

  const rows = (data ?? []) as OrganizationOption[]

  return rows
    .filter((entry): entry is OrganizationOption & { organizations: NonNullable<OrganizationOption['organizations']> } => Boolean(entry.organizations))
    .map((entry) => ({
      ...entry.organizations!,
      user_role: entry.role,
    }))
}

/**
 * Invite a member by email
 */
export async function inviteMember(formData: FormData) {
  const user = await requireAuth()
  const supabase = createClient() as any
  const locale = resolveLocale(formData.get('locale'))

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

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', org_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'member'].includes(membership.role)) {
    return { error: { form: ['You do not have permission to invite members'] } satisfies FieldErrors }
  }

  const token = randomBytes(16).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { data: invite, error } = await supabase
    .from('invites')
    .insert({
      org_id,
      email,
      role,
      token,
      status: 'pending',
      created_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error || !invite) {
    console.error('Error creating invite:', error)
    return { error: { form: ['Failed to send invitation'] } satisfies FieldErrors }
  }

  // TODO: trigger transactional email

  await revalidateOrgViews(supabase, org_id, { locale })
  return { success: true, invite }
}

/**
 * Generate an invite link
 */
export async function createInviteLink(formData: FormData) {
  const user = await requireAuth()
  const supabase = createClient() as any
  const locale = resolveLocale(formData.get('locale'))

  const expiresRaw = formData.get('expires_in_days')
  const data = {
    org_id: formData.get('org_id'),
    role: formData.get('role'),
    expires_in_days:
      typeof expiresRaw === 'string' && expiresRaw.trim().length > 0 ? Number(expiresRaw) : undefined,
  }

  const validation = createInviteLinkSchema.safeParse(data)

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const { org_id, role, expires_in_days } = validation.data

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', org_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'member'].includes(membership.role)) {
    return { error: { form: ['You do not have permission to create invite links'] } satisfies FieldErrors }
  }

  const token = randomBytes(24).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expires_in_days)

  const { data: invite, error } = await supabase
    .from('invites')
    .insert({
      org_id,
      email: `link:${token}`,
      role,
      token,
      status: 'pending',
      created_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error || !invite) {
    console.error('Error creating invite link:', error)
    return { error: { form: ['Failed to create invite link'] } satisfies FieldErrors }
  }

  await revalidateOrgViews(supabase, org_id, { locale })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const link = baseUrl ? `${baseUrl}/join/${token}` : token

  return { success: true, invite, link }
}

/**
 * Remove a member from an organization
 */
export async function removeMember(orgId: string, userId: string) {
  const currentUser = await requireAuth()
  const supabase = createClient() as any
  const locale = routing.defaultLocale ?? 'en'

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', currentUser.id)
    .single()

  if (!membership || !['owner', 'member'].includes(membership.role)) {
    return { error: 'You do not have permission to remove members' }
  }

  const { data: targetMember } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single()

  if (targetMember?.role === 'owner') {
    return { error: 'Cannot remove the organization owner' }
  }

  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('org_id', orgId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error removing member:', error)
    return { error: 'Failed to remove member' }
  }

  await revalidateOrgViews(supabase, orgId, { locale })
  return { success: true }
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
  orgId: string,
  userId: string,
  newRole: 'owner' | 'member' | 'viewer'
) {
  const validation = updateMemberRoleSchema.safeParse({ org_id: orgId, user_id: userId, new_role: newRole })
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const currentUser = await requireAuth()
  const supabase = createClient() as any
  const locale = routing.defaultLocale ?? 'en'

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', currentUser.id)
    .single()

  if (membership?.role !== 'owner') {
    return { error: 'Only the owner can change member roles' }
  }

  const { data: targetMember } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single()

  if (targetMember?.role === 'owner') {
    return { error: 'Cannot change the owner role' }
  }

  const { error } = await supabase
    .from('organization_members')
    .update({ role: newRole })
    .eq('org_id', orgId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating member role:', error)
    return { error: 'Failed to update member role' }
  }

  await revalidateOrgViews(supabase, orgId, { locale })
  return { success: true }
}

/**
 * Leave an organization
 */
export async function leaveOrganization(orgId: string, locale?: string) {
  const user = await requireAuth()
  const supabase = createClient() as any

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if ((membership as any)?.role === 'owner') {
    return { error: 'Owner cannot leave. Transfer ownership first.' }
  }

  if (!membership) {
    return { error: 'Membership not found' }
  }

  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('org_id', orgId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error leaving organization:', error)
    return { error: 'Failed to leave organization' }
  }

  const resolvedLocale = locale ?? routing.defaultLocale ?? 'en'
  revalidatePath('/', 'layout')
  revalidatePath(`/${resolvedLocale}/dashboard`, 'page')
  return { success: true }
}
