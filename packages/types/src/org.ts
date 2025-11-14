export type OrgRole = 'owner' | 'member' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string | null;
  org_type: 'personal' | 'business' | 'family' | 'education' | 'other';
  description: string | null;
  avatar_url: string | null;
  is_personal: boolean;
  owner_id: string;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
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
  org_type: Organization['org_type'];
  slug: string;
  description?: string | null;
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
