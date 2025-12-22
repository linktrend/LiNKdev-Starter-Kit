import { describe, it, expect, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { organizationRouter } from '../../routers/organization';
import { createSupabaseMock } from '../helpers/supabaseMock';

describe('organizationRouter', () => {
  const user = { id: 'user-123' };
  let supabase: ReturnType<typeof createSupabaseMock>['supabase'];
  let getTable: ReturnType<typeof createSupabaseMock>['getTable'];
  let caller: ReturnType<typeof organizationRouter.createCaller>;

  beforeEach(() => {
    const mock = createSupabaseMock();
    supabase = mock.supabase as any;
    getTable = mock.getTable;
    caller = organizationRouter.createCaller({ supabase, user });
  });

  it('lists organizations for the user', async () => {
    const orgMembers = getTable('organization_members');
    orgMembers.__queueEqResponse({
      data: [
        { role: 'admin', organizations: { id: 'org-1', name: 'Acme' } },
        { role: 'viewer', organizations: { id: 'org-2', name: 'Beta' } },
      ],
      error: null,
    });

    const result = await caller.list();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Acme');
  });

  it('gets organization by id when user is a member', async () => {
    const orgMembers = getTable('organization_members');
    orgMembers.single.mockResolvedValue({
      data: { role: 'admin', organizations: { id: 'org-1', name: 'Acme' } },
      error: null,
    });

    const result = await caller.getById({ orgId: 'org-1' });

    expect(result.name).toBe('Acme');
    expect(result.role).toBe('admin');
  });

  it('creates an organization and owner membership', async () => {
    const orgs = getTable('organizations');
    orgs.single.mockResolvedValueOnce({
      data: { id: 'org-1', name: 'New Org', owner_id: user.id },
      error: null,
    });

    const members = getTable('organization_members');
    members.single.mockResolvedValueOnce({
      data: { org_id: 'org-1', user_id: user.id, role: 'owner' },
      error: null,
    });

    const result = await caller.create({ name: 'New Org', orgType: 'business' });

    expect(result.id).toBe('org-1');
    expect(orgs.insert).toHaveBeenCalled();
    expect(members.upsert).toHaveBeenCalled();
  });

  it('updates organization when user is admin', async () => {
    const members = getTable('organization_members');
    members.single
      .mockResolvedValueOnce({ data: { role: 'admin' }, error: null }); // permission check

    const orgs = getTable('organizations');
    orgs.single.mockResolvedValueOnce({
      data: { id: 'org-1', name: 'Updated Org' },
      error: null,
    });

    const result = await caller.update({
      orgId: 'org-1',
      name: 'Updated Org',
    });

    expect(result.name).toBe('Updated Org');
  });

  it('blocks delete for non-owners', async () => {
    const members = getTable('organization_members');
    members.single.mockResolvedValue({ data: { role: 'admin' }, error: null });

    await expect(caller.delete({ orgId: 'org-1' })).rejects.toBeInstanceOf(TRPCError);
  });

  it('deletes organization for owner', async () => {
    const members = getTable('organization_members');
    members.single.mockResolvedValueOnce({ data: { role: 'owner' }, error: null });

    const orgs = getTable('organizations');
    orgs.__queueEqResponse({ error: null });

    const result = await caller.delete({ orgId: 'org-1' });

    expect(result).toEqual({ success: true });
  });

  it('lists members for an organization', async () => {
    const members = getTable('organization_members');
    members.__queueSingleResponse({ data: { role: 'admin' }, error: null }); // membership check
    members.__queueEqResponse({ error: null }); // fetchMembershipRole eq #1
    members.__queueEqResponse({ error: null }); // fetchMembershipRole eq #2
    members.__queueEqResponse({ data: [{ user_id: 'u1', role: 'admin' }], error: null });

    const result = await caller.listMembers({ orgId: 'org-1' });

    expect(result).toEqual([{ user_id: 'u1', role: 'admin' }]);
  });

  it('adds a member when caller can manage', async () => {
    const members = getTable('organization_members');
    members.__queueSingleResponse({ data: { role: 'admin' }, error: null }); // permission
    members.__queueSingleResponse({
      data: { org_id: 'org-1', user_id: 'u2', role: 'editor' },
      error: null,
    });

    const result = await caller.addMember({ orgId: 'org-1', userId: 'u2', role: 'editor' });

    expect(result?.role).toBe('editor');
  });

  it('removes a member with sufficient role', async () => {
    const members = getTable('organization_members');
    members.__queueSingleResponse({ data: { role: 'owner' }, error: null }); // permission
    members.__queueSingleResponse({ data: { role: 'editor' }, error: null }); // target lookup
    members.__queueEqResponse({ error: null });

    const result = await caller.removeMember({ orgId: 'org-1', userId: 'u2' });

    expect(result).toEqual({ success: true });
  });

  it('updates member role when caller is owner', async () => {
    const members = getTable('organization_members');
    members.__queueSingleResponse({ data: { role: 'viewer' }, error: null }); // target membership fetch
    members.__queueSingleResponse({ data: { role: 'owner' }, error: null }); // actor role check
    members.__queueSingleResponse({
      data: { org_id: 'org-1', user_id: 'u2', role: 'editor' },
      error: null,
    }); // update response

    const result = await caller.updateMemberRole({
      orgId: 'org-1',
      userId: 'u2',
      role: 'editor',
    });

    expect(result).toEqual({ org_id: 'org-1', user_id: 'u2', role: 'editor' });
  });
});
