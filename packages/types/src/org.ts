import type { Tables } from './db'

/**
 * Organization-level role values enforced by `organization_members.role` CHECK constraint.
 */
export type OrgRole = 'owner' | 'admin' | 'editor' | 'viewer'

/**
 * Persistent organization profile from `public.organizations`.
 * Captures ownership, slug metadata, display properties, and JSON settings.
 */
export type Organization = Tables<'organizations'>

/**
 * Membership row connecting a user to an organization with a scoped role.
 * Optionally includes a lightweight user summary for UI display.
 */
export interface OrganizationMember extends Tables<'organization_members'> {
  user?: {
    id: string
    email: string | null
    full_name?: string | null
    avatar_url?: string | null
  }
}

/**
 * Invitation to join an organization, mirroring `public.invites`.
 */
export type Invite = Tables<'invites'>

/**
 * Payload for creating a new organization (client-side validation helper).
 */
export interface CreateOrgInput {
  name: string
  org_type: Organization['org_type']
  slug: string
  description?: string | null
}

/**
 * Payload for inviting a user into an organization with a role.
 */
export interface InviteUserInput {
  orgId: string
  email: string
  role: OrgRole
}

/**
 * Membership role update request.
 */
export interface UpdateMemberRoleInput {
  orgId: string
  userId: string
  role: OrgRole
}

/**
 * Remove a member from an organization.
 */
export interface RemoveMemberInput {
  orgId: string
  userId: string
}

/**
 * Accept invitation action payload.
 */
export interface AcceptInviteInput {
  token: string
}

/**
 * Set the current organization context for the active user.
 */
export interface SetCurrentOrgInput {
  orgId: string
}
