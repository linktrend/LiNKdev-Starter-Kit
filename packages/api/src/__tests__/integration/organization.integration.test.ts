/**
 * Integration Tests for Organization Router
 * 
 * Tests organization CRUD operations, member management, and RBAC enforcement.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createTestCaller } from './helpers/test-context';
import {
  createTestUser,
  createTestOrganization,
  createTestMembership,
  generateUUID,
} from './helpers/test-data';

describe('Organization Router Integration Tests', () => {
  let testUser: any;
  let testOrg: any;

  beforeEach(() => {
    testUser = createTestUser();
    testOrg = createTestOrganization({ owner_id: testUser.id });
  });

  describe('list', () => {
    it('should list organizations for the user', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const orgMembers = getTable('organization_members');

      orgMembers.__queueEqResponse({
        data: [
          {
            role: 'owner',
            organizations: { ...testOrg },
          },
        ],
        error: null,
      });

      const result = await caller.organization.list();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: testOrg.id,
        name: testOrg.name,
        role: 'owner',
      });
    });

    it('should return empty array when user has no organizations', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const orgMembers = getTable('organization_members');

      orgMembers.__queueEqResponse({
        data: [],
        error: null,
      });

      const result = await caller.organization.list();

      expect(result).toHaveLength(0);
    });

    it('should include role information for each organization', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const orgMembers = getTable('organization_members');

      const org1 = createTestOrganization();
      const org2 = createTestOrganization();

      orgMembers.__queueEqResponse({
        data: [
          { role: 'owner', organizations: org1 },
          { role: 'viewer', organizations: org2 },
        ],
        error: null,
      });

      const result = await caller.organization.list();

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe('owner');
      expect(result[1].role).toBe('viewer');
    });
  });

  describe('getById', () => {
    it('should get organization by ID when user is member', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const orgMembers = getTable('organization_members');

      orgMembers.single.mockResolvedValue({
        data: {
          role: 'owner',
          organizations: testOrg,
        },
        error: null,
      });

      const result = await caller.organization.getById({ orgId: testOrg.id });

      expect(result).toMatchObject({
        id: testOrg.id,
        name: testOrg.name,
        role: 'owner',
      });
    });

    it('should throw error when user is not a member', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const orgMembers = getTable('organization_members');

      orgMembers.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(
        caller.organization.getById({ orgId: testOrg.id })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('create', () => {
    it('should create organization and add owner membership', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const orgs = getTable('organizations');
      const members = getTable('organization_members');

      const newOrg = createTestOrganization({ owner_id: testUser.id });

      orgs.single.mockResolvedValueOnce({
        data: newOrg,
        error: null,
      });

      members.single.mockResolvedValueOnce({
        data: {
          org_id: newOrg.id,
          user_id: testUser.id,
          role: 'owner',
        },
        error: null,
      });

      const result = await caller.organization.create({
        name: newOrg.name,
        orgType: 'business',
      });

      expect(result).toMatchObject({
        id: newOrg.id,
        name: newOrg.name,
        owner_id: testUser.id,
      });
      expect(orgs.insert).toHaveBeenCalled();
      expect(members.upsert).toHaveBeenCalled();
    });

    it('should generate slug from organization name', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const orgs = getTable('organizations');
      const members = getTable('organization_members');

      const newOrg = createTestOrganization({
        name: 'My Test Organization',
        slug: 'my-test-organization',
      });

      orgs.single.mockResolvedValueOnce({
        data: newOrg,
        error: null,
      });

      members.single.mockResolvedValueOnce({
        data: { org_id: newOrg.id, user_id: testUser.id, role: 'owner' },
        error: null,
      });

      const result = await caller.organization.create({
        name: 'My Test Organization',
        orgType: 'business',
      });

      expect(result.slug).toBe('my-test-organization');
    });

    it('should rollback on membership creation failure', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const orgs = getTable('organizations');
      const members = getTable('organization_members');

      const newOrg = createTestOrganization();

      orgs.single.mockResolvedValueOnce({
        data: newOrg,
        error: null,
      });

      members.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to create membership' },
      });

      await expect(
        caller.organization.create({
          name: newOrg.name,
          orgType: 'business',
        })
      ).rejects.toThrow(TRPCError);

      // Verify cleanup was attempted
      expect(orgs.delete).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update organization when user is admin', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const members = getTable('organization_members');
      const orgs = getTable('organizations');

      members.single.mockResolvedValueOnce({
        data: { role: 'admin' },
        error: null,
      });

      const updatedOrg = { ...testOrg, name: 'Updated Name' };
      orgs.single.mockResolvedValueOnce({
        data: updatedOrg,
        error: null,
      });

      const result = await caller.organization.update({
        orgId: testOrg.id,
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
      expect(orgs.update).toHaveBeenCalled();
    });

    it('should allow owner to update organization', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const members = getTable('organization_members');
      const orgs = getTable('organizations');

      members.single.mockResolvedValueOnce({
        data: { role: 'owner' },
        error: null,
      });

      const updatedOrg = { ...testOrg, description: 'New description' };
      orgs.single.mockResolvedValueOnce({
        data: updatedOrg,
        error: null,
      });

      const result = await caller.organization.update({
        orgId: testOrg.id,
        name: testOrg.name,
        description: 'New description',
      });

      expect(result.description).toBe('New description');
    });

    it('should reject update from viewer', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const members = getTable('organization_members');

      members.single.mockResolvedValueOnce({
        data: { role: 'viewer' },
        error: null,
      });

      await expect(
        caller.organization.update({
          orgId: testOrg.id,
          name: 'Updated Name',
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('delete', () => {
    it('should delete organization when user is owner', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const members = getTable('organization_members');
      const orgs = getTable('organizations');

      members.single.mockResolvedValueOnce({
        data: { role: 'owner' },
        error: null,
      });

      orgs.__queueEqResponse({ error: null });

      const result = await caller.organization.delete({ orgId: testOrg.id });

      expect(result).toEqual({ success: true });
      expect(orgs.delete).toHaveBeenCalled();
    });

    it('should reject delete from non-owner', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const members = getTable('organization_members');

      members.single.mockResolvedValueOnce({
        data: { role: 'admin' },
        error: null,
      });

      await expect(
        caller.organization.delete({ orgId: testOrg.id })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('Member management', () => {
    describe('listMembers', () => {
      it('should list all members of organization', async () => {
        const { caller, getTable } = createTestCaller({ user: testUser });
        const members = getTable('organization_members');

        members.__queueSingleResponse({ data: { role: 'owner' }, error: null });
        members.__queueEqResponse({ error: null });
        members.__queueEqResponse({ error: null });
        members.__queueEqResponse({
          data: [
            { user_id: testUser.id, role: 'owner' },
            { user_id: 'user-2', role: 'viewer' },
          ],
          error: null,
        });

        const result = await caller.organization.listMembers({ orgId: testOrg.id });

        expect(result).toHaveLength(2);
        expect(result[0].role).toBe('owner');
        expect(result[1].role).toBe('viewer');
      });
    });

    describe('addMember', () => {
      it('should add member when user is admin', async () => {
        const { caller, getTable } = createTestCaller({ user: testUser });
        const members = getTable('organization_members');

        members.__queueSingleResponse({ data: { role: 'admin' }, error: null });
        members.__queueSingleResponse({
          data: {
            org_id: testOrg.id,
            user_id: 'new-user',
            role: 'editor',
          },
          error: null,
        });

        const result = await caller.organization.addMember({
          orgId: testOrg.id,
          userId: 'new-user',
          role: 'editor',
        });

        expect(result?.role).toBe('editor');
        expect(members.upsert).toHaveBeenCalled();
      });

      it('should reject add member from viewer', async () => {
        const { caller, getTable } = createTestCaller({ user: testUser });
        const members = getTable('organization_members');

        members.__queueSingleResponse({ data: { role: 'viewer' }, error: null });

        await expect(
          caller.organization.addMember({
            orgId: testOrg.id,
            userId: 'new-user',
            role: 'editor',
          })
        ).rejects.toThrow(TRPCError);
      });
    });

    describe('removeMember', () => {
      it('should remove member when user is owner', async () => {
        const { caller, getTable } = createTestCaller({ user: testUser });
        const members = getTable('organization_members');

        members.__queueSingleResponse({ data: { role: 'owner' }, error: null });
        members.__queueSingleResponse({ data: { role: 'editor' }, error: null });
        members.__queueEqResponse({ error: null });

        const result = await caller.organization.removeMember({
          orgId: testOrg.id,
          userId: 'user-to-remove',
        });

        expect(result).toEqual({ success: true });
        expect(members.delete).toHaveBeenCalled();
      });

      it('should prevent removing owner', async () => {
        const { caller, getTable } = createTestCaller({ user: testUser });
        const members = getTable('organization_members');

        members.__queueSingleResponse({ data: { role: 'owner' }, error: null });
        members.__queueSingleResponse({ data: { role: 'owner' }, error: null });

        await expect(
          caller.organization.removeMember({
            orgId: testOrg.id,
            userId: 'owner-user',
          })
        ).rejects.toThrow('Cannot remove organization owner');
      });

      it('should prevent lower role from removing higher role', async () => {
        const { caller, getTable } = createTestCaller({ user: testUser });
        const members = getTable('organization_members');

        members.__queueSingleResponse({ data: { role: 'admin' }, error: null });
        members.__queueSingleResponse({ data: { role: 'owner' }, error: null });

        await expect(
          caller.organization.removeMember({
            orgId: testOrg.id,
            userId: 'owner-user',
          })
        ).rejects.toThrow(TRPCError);
      });
    });

    describe('updateMemberRole', () => {
      it('should update member role when user is owner', async () => {
        const { caller, getTable } = createTestCaller({ user: testUser });
        const members = getTable('organization_members');

        members.__queueSingleResponse({ data: { role: 'viewer' }, error: null });
        members.__queueSingleResponse({ data: { role: 'owner' }, error: null });
        members.__queueSingleResponse({
          data: {
            org_id: testOrg.id,
            user_id: 'user-2',
            role: 'editor',
          },
          error: null,
        });

        const result = await caller.organization.updateMemberRole({
          orgId: testOrg.id,
          userId: 'user-2',
          role: 'editor',
        });

        expect(result).toMatchObject({
          org_id: testOrg.id,
          user_id: 'user-2',
          role: 'editor',
        });
        expect(members.update).toHaveBeenCalled();
      });

      it('should reject role update from non-owner', async () => {
        const { caller, getTable } = createTestCaller({ user: testUser });
        const members = getTable('organization_members');

        members.__queueSingleResponse({ data: { role: 'viewer' }, error: null });
        members.__queueSingleResponse({ data: { role: 'admin' }, error: null });

        await expect(
          caller.organization.updateMemberRole({
            orgId: testOrg.id,
            userId: 'user-2',
            role: 'editor',
          })
        ).rejects.toThrow(TRPCError);
      });
    });
  });

  describe('Integration: Organization lifecycle', () => {
    it('should create → add members → list members → verify all present', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const orgs = getTable('organizations');
      const members = getTable('organization_members');

      // Create organization
      const newOrg = createTestOrganization({ owner_id: testUser.id });
      orgs.single.mockResolvedValueOnce({
        data: newOrg,
        error: null,
      });
      members.single.mockResolvedValueOnce({
        data: { org_id: newOrg.id, user_id: testUser.id, role: 'owner' },
        error: null,
      });

      const createdOrg = await caller.organization.create({
        name: newOrg.name,
        orgType: 'business',
      });

      expect(createdOrg.id).toBe(newOrg.id);

      // Add member
      members.__queueSingleResponse({ data: { role: 'owner' }, error: null });
      members.__queueSingleResponse({
        data: { org_id: newOrg.id, user_id: 'user-2', role: 'viewer' },
        error: null,
      });

      await caller.organization.addMember({
        orgId: newOrg.id,
        userId: 'user-2',
        role: 'viewer',
      });

      // List members
      members.__queueSingleResponse({ data: { role: 'owner' }, error: null });
      members.__queueEqResponse({ error: null });
      members.__queueEqResponse({ error: null });
      members.__queueEqResponse({
        data: [
          { user_id: testUser.id, role: 'owner' },
          { user_id: 'user-2', role: 'viewer' },
        ],
        error: null,
      });

      const membersList = await caller.organization.listMembers({ orgId: newOrg.id });

      expect(membersList).toHaveLength(2);
      expect(membersList.some(m => m.user_id === testUser.id)).toBe(true);
      expect(membersList.some(m => m.user_id === 'user-2')).toBe(true);
    });

    it('should create → update → verify changes', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const orgs = getTable('organizations');
      const members = getTable('organization_members');

      // Create
      const newOrg = createTestOrganization({ owner_id: testUser.id });
      orgs.single.mockResolvedValueOnce({
        data: newOrg,
        error: null,
      });
      members.single.mockResolvedValueOnce({
        data: { org_id: newOrg.id, user_id: testUser.id, role: 'owner' },
        error: null,
      });

      await caller.organization.create({
        name: newOrg.name,
        orgType: 'business',
      });

      // Update
      members.single.mockResolvedValueOnce({ data: { role: 'owner' }, error: null });
      const updatedOrg = { ...newOrg, name: 'Updated Name', description: 'New desc' };
      orgs.single.mockResolvedValueOnce({
        data: updatedOrg,
        error: null,
      });

      const result = await caller.organization.update({
        orgId: newOrg.id,
        name: 'Updated Name',
        description: 'New desc',
      });

      expect(result.name).toBe('Updated Name');
      expect(result.description).toBe('New desc');
    });
  });
});
