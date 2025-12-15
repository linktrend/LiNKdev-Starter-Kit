import type { Tables } from './db';
import type { OrgRole } from './org';

/**
 * Team invite status enum
 */
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

/**
 * Team invite record from `public.team_invites`
 */
export type TeamInvite = Tables<'team_invites'>;

/**
 * Team invite without sensitive token (for API responses)
 */
export type SafeTeamInvite = Omit<TeamInvite, 'token'>;

/**
 * Input for inviting a team member
 */
export interface InviteMemberInput {
  orgId: string;
  email: string;
  role: 'member' | 'viewer';
}

/**
 * Input for listing team invites
 */
export interface ListInvitesInput {
  orgId: string;
  status?: InviteStatus;
}

/**
 * Input for accepting a team invite
 */
export interface AcceptTeamInviteInput {
  token: string;
}

/**
 * Response for accepting a team invite
 */
export interface AcceptTeamInviteResponse {
  success: boolean;
  orgId: string;
  role: string;
}

/**
 * Input for revoking a team invite
 */
export interface RevokeInviteInput {
  inviteId: string;
  orgId: string;
}

/**
 * Input for updating a member's role
 */
export interface UpdateMemberRoleInput {
  orgId: string;
  userId: string;
  role: OrgRole;
}

/**
 * Input for transferring organization ownership
 */
export interface TransferOwnershipInput {
  orgId: string;
  newOwnerId: string;
}

/**
 * Role definition with permissions
 */
export interface RoleDefinition {
  id: OrgRole;
  name: string;
  description: string;
  permissions: string[];
}

/**
 * List of available roles response
 */
export interface AvailableRolesResponse {
  roles: RoleDefinition[];
}

/**
 * Generic success response
 */
export interface TeamSuccessResponse {
  success: boolean;
}
