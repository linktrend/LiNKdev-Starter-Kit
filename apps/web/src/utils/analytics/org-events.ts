// Organization analytics events for PostHog
// These events are automatically tracked in the tRPC procedures

export interface OrgCreatedEvent {
  event: 'org_created';
  properties: {
    org_id: string;
    org_name: string;
  };
}

export interface OrgSwitchedEvent {
  event: 'org_switched';
  properties: {
    org_id: string;
    from_org_id?: string;
  };
}

export interface MemberInvitedEvent {
  event: 'member_invited';
  properties: {
    org_id: string;
    invitee_email: string;
    role: string;
  };
}

export interface MemberAcceptedEvent {
  event: 'member_accepted';
  properties: {
    org_id: string;
    role: string;
  };
}

export interface MemberRoleUpdatedEvent {
  event: 'member_role_updated';
  properties: {
    org_id: string;
    target_user_id: string;
    old_role?: string;
    new_role: string;
  };
}

export interface MemberRemovedEvent {
  event: 'member_removed';
  properties: {
    org_id: string;
    target_user_id: string;
  };
}

export type OrgAnalyticsEvent = 
  | OrgCreatedEvent
  | OrgSwitchedEvent
  | MemberInvitedEvent
  | MemberAcceptedEvent
  | MemberRoleUpdatedEvent
  | MemberRemovedEvent;

// Helper function to create analytics events
export const createOrgAnalyticsEvent = <T extends OrgAnalyticsEvent>(
  event: T['event'],
  properties: T['properties']
): T => ({
  event,
  properties,
} as T);

// Event tracking utilities
export const trackOrgCreated = (orgId: string, orgName: string): OrgCreatedEvent =>
  createOrgAnalyticsEvent('org_created', { org_id: orgId, org_name: orgName });

export const trackOrgSwitched = (orgId: string, fromOrgId?: string): OrgSwitchedEvent =>
  createOrgAnalyticsEvent('org_switched', { org_id: orgId, from_org_id: fromOrgId });

export const trackMemberInvited = (orgId: string, email: string, role: string): MemberInvitedEvent =>
  createOrgAnalyticsEvent('member_invited', { org_id: orgId, invitee_email: email, role });

export const trackMemberAccepted = (orgId: string, role: string): MemberAcceptedEvent =>
  createOrgAnalyticsEvent('member_accepted', { org_id: orgId, role });

export const trackMemberRoleUpdated = (
  orgId: string, 
  targetUserId: string, 
  newRole: string, 
  oldRole?: string
): MemberRoleUpdatedEvent =>
  createOrgAnalyticsEvent('member_role_updated', { 
    org_id: orgId, 
    target_user_id: targetUserId, 
    new_role: newRole, 
    old_role: oldRole 
  });

export const trackMemberRemoved = (orgId: string, targetUserId: string): MemberRemovedEvent =>
  createOrgAnalyticsEvent('member_removed', { org_id: orgId, target_user_id: targetUserId });
