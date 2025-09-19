// Offline fallback store for Organizations module
// Used when TEMPLATE_OFFLINE=1 or Supabase is not configured

import { Organization, OrganizationMember, Invite, OrgRole } from '@/types/org';

interface OrgStore {
  organizations: Map<string, Organization>;
  members: Map<string, OrganizationMember>;
  invites: Map<string, Invite>;
  currentOrgId: string | null;
}

class InMemoryOrgStore {
  private store: OrgStore = {
    organizations: new Map(),
    members: new Map(),
    invites: new Map(),
    currentOrgId: null,
  };

  // Organization management
  createOrg(org: Organization, ownerId: string): Organization {
    this.store.organizations.set(org.id, org);
    this.addMember(org.id, ownerId, 'owner');
    console.log('ORG MODULE: offline fallback - created org', org.id);
    return org;
  }

  getOrg(orgId: string): Organization | null {
    return this.store.organizations.get(orgId) || null;
  }

  listUserOrgs(userId: string): Organization[] {
    const userOrgIds = Array.from(this.store.members.values())
      .filter(member => member.user_id === userId)
      .map(member => member.org_id);
    
    return userOrgIds
      .map(orgId => this.store.organizations.get(orgId))
      .filter(Boolean) as Organization[];
  }

  setCurrentOrg(orgId: string | null): void {
    this.store.currentOrgId = orgId;
    console.log('ORG MODULE: offline fallback - set current org', orgId);
  }

  getCurrentOrg(): Organization | null {
    if (!this.store.currentOrgId) return null;
    return this.store.organizations.get(this.store.currentOrgId) || null;
  }

  // Member management
  addMember(orgId: string, userId: string, role: OrgRole): OrganizationMember {
    const member: OrganizationMember = {
      org_id: orgId,
      user_id: userId,
      role,
      created_at: new Date().toISOString(),
    };
    this.store.members.set(`${orgId}-${userId}`, member);
    console.log('ORG MODULE: offline fallback - added member', { orgId, userId, role });
    return member;
  }

  listOrgMembers(orgId: string): OrganizationMember[] {
    return Array.from(this.store.members.values())
      .filter(member => member.org_id === orgId);
  }

  updateMemberRole(orgId: string, userId: string, role: OrgRole): OrganizationMember | null {
    const key = `${orgId}-${userId}`;
    const member = this.store.members.get(key);
    if (!member) return null;
    
    member.role = role;
    this.store.members.set(key, member);
    console.log('ORG MODULE: offline fallback - updated member role', { orgId, userId, role });
    return member;
  }

  removeMember(orgId: string, userId: string): boolean {
    const key = `${orgId}-${userId}`;
    const existed = this.store.members.has(key);
    this.store.members.delete(key);
    console.log('ORG MODULE: offline fallback - removed member', { orgId, userId });
    return existed;
  }

  // Invite management
  createInvite(invite: Invite): Invite {
    this.store.invites.set(invite.id, invite);
    console.log('ORG MODULE: offline fallback - created invite', invite.id);
    return invite;
  }

  getInviteByToken(token: string): Invite | null {
    return Array.from(this.store.invites.values())
      .find(invite => invite.token === token) || null;
  }

  listOrgInvites(orgId: string): Invite[] {
    return Array.from(this.store.invites.values())
      .filter(invite => invite.org_id === orgId);
  }

  acceptInvite(token: string, userId: string): { success: boolean; orgId?: string; role?: OrgRole } {
    const invite = this.getInviteByToken(token);
    if (!invite || invite.status !== 'pending') {
      return { success: false };
    }

    // Add user as member
    this.addMember(invite.org_id, userId, invite.role);
    
    // Mark invite as accepted
    invite.status = 'accepted';
    this.store.invites.set(invite.id, invite);
    
    console.log('ORG MODULE: offline fallback - accepted invite', { token, userId, orgId: invite.org_id });
    return { success: true, orgId: invite.org_id, role: invite.role };
  }

  revokeInvite(inviteId: string): boolean {
    const existed = this.store.invites.has(inviteId);
    this.store.invites.delete(inviteId);
    console.log('ORG MODULE: offline fallback - revoked invite', inviteId);
    return existed;
  }

  // Utility methods
  isUserMember(orgId: string, userId: string): boolean {
    return this.store.members.has(`${orgId}-${userId}`);
  }

  getUserRole(orgId: string, userId: string): OrgRole | null {
    const member = this.store.members.get(`${orgId}-${userId}`);
    return member?.role || null;
  }

  canManageMembers(orgId: string, userId: string): boolean {
    const role = this.getUserRole(orgId, userId);
    return role === 'owner' || role === 'admin';
  }

  // Seed with sample data for development
  seedSampleData(userId: string): void {
    console.log('ORG MODULE: offline fallback - seeding sample data');
    
    // Create sample organization
    const sampleOrg: Organization = {
      id: 'sample-org-1',
      name: 'Sample Organization',
      owner_id: userId,
      created_at: new Date().toISOString(),
    };
    
    this.createOrg(sampleOrg, userId);
    this.setCurrentOrg(sampleOrg.id);
    
    // Add sample members
    this.addMember(sampleOrg.id, 'sample-user-2', 'admin');
    this.addMember(sampleOrg.id, 'sample-user-3', 'editor');
    this.addMember(sampleOrg.id, 'sample-user-4', 'viewer');
    
    // Add sample invite
    const sampleInvite: Invite = {
      id: 'sample-invite-1',
      org_id: sampleOrg.id,
      email: 'invite@example.com',
      role: 'editor',
      token: 'sample-token-123',
      status: 'pending',
      created_by: userId,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    this.createInvite(sampleInvite);
  }
}

// Singleton instance
export const orgStore = new InMemoryOrgStore();
