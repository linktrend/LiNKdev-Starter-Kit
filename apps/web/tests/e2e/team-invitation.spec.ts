import { test, expect } from '@playwright/test';
import { OrgPage } from '../page-objects/OrgPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { randomOrgName, randomOrgSlug, randomPassword, randomUsername } from '../helpers/test-data';
import {
  addMemberToOrg,
  createOrganizationForUser,
  createTestUser,
  deleteUserCascade,
  generateMagicLink,
  getAdminClient,
} from '../helpers/setup';

test.describe('Team invitation flow', () => {
  test('owner invites member and member appears with correct role', async ({ page }) => {
    const owner = await createTestUser({ password: randomPassword() });
    const member = await createTestUser({ password: randomPassword() });

    const admin = getAdminClient();
    await admin
      .from('users')
      .update({ onboarding_completed: true, profile_completed: true, username: randomUsername('owner') })
      .eq('id', owner.id);
    await admin
      .from('users')
      .update({ onboarding_completed: true, profile_completed: true, username: randomUsername('member') })
      .eq('id', member.id);

    const orgName = randomOrgName('Invite Org');
    const org = await createOrganizationForUser({ ownerId: owner.id, name: orgName, slug: randomOrgSlug('invite') });

    const orgPage = new OrgPage(page);
    const dashboardPage = new DashboardPage(page);

    try {
      const magicLink = await generateMagicLink(owner.email, 'magiclink');
      await page.goto(magicLink);
      await dashboardPage.expectLoaded();

      await orgPage.gotoOrgMembers(org.slug);
      await orgPage.inviteMember(member.email, 'viewer');

      // Simulate member acceptance
      await admin.from('invites').update({ status: 'accepted' }).eq('org_id', org.id).eq('email', member.email);
      await addMemberToOrg(org.id, member.id, 'viewer');

      await page.reload();
      await orgPage.expectMemberVisible(member.email);
    } finally {
      await deleteUserCascade(owner.id);
      await deleteUserCascade(member.id);
      await admin.from('organizations').delete().eq('id', org.id);
    }
  });
});
