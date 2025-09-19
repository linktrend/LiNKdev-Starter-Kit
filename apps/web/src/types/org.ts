export type OrgRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at?: string;
}

export interface OrganizationMember {
  org_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
  user?: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export interface Invite {
  id: string;
  org_id: string;
  email: string;
  role: OrgRole;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  created_by: string;
  created_at: string;
  expires_at: string;
  organization?: Organization;
}

export interface CreateOrgInput {
  name: string;
}

export interface InviteUserInput {
  orgId: string;
  email: string;
  role: OrgRole;
}

export interface UpdateMemberRoleInput {
  orgId: string;
  userId: string;
  role: OrgRole;
}

export interface RemoveMemberInput {
  orgId: string;
  userId: string;
}

export interface AcceptInviteInput {
  token: string;
}

export interface SetCurrentOrgInput {
  orgId: string;
}
