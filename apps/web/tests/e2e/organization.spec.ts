import { test, expect } from '@playwright/test';
import { OrgPage } from '../page-objects/OrgPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { randomOrgName, randomOrgSlug, randomPassword, randomUsername } from '../helpers/test-data';
import {
  createOrganizationForUser,
  createTestUser,
  deleteUserCascade,
  generateMagicLink,
  getAdminClient,
} from '../helpers/setup';

test.describe('Organization management', () => {
  test('user creates organization and can view multiple workspaces', async ({ page }) => {
    const { id, email } = await createTestUser({ password: randomPassword() });
    const admin = getAdminClient();
    const username = randomUsername('org');
    await admin
      .from('users')
      .update({ onboarding_completed: true, profile_completed: true, username })
      .eq('id', id);

    const orgPage = new OrgPage(page);
    const dashboardPage = new DashboardPage(page);

    const orgName = randomOrgName('E2E Org');
    const orgSlug = randomOrgSlug('e2e-org');
    const secondOrg = randomOrgName('Second Org');
    let secondOrgSlug: string | undefined;

    try {
      const magicLink = await generateMagicLink(email, 'magiclink');
      await page.goto(magicLink);
      await dashboardPage.expectLoaded();

      await orgPage.createOrganization({
        name: orgName,
        slug: orgSlug,
        description: 'Org created by E2E test',
      });

      await expect(page.getByRole('heading', { name: orgName })).toBeVisible({ timeout: 20_000 });

      // Create another org via service to validate switching
      const created = await createOrganizationForUser({ ownerId: id, name: secondOrg });
      secondOrgSlug = created.slug;

      await orgPage.gotoOrgMembers(orgSlug);
      await expect(page.getByRole('heading', { name: new RegExp(orgName, 'i') })).toBeVisible();

      await orgPage.gotoOrgMembers(created.slug);
      await expect(page.getByRole('heading', { name: new RegExp(created.name, 'i') })).toBeVisible();
    } finally {
      await deleteUserCascade(id);
      if (secondOrgSlug) {
        await admin.from('organizations').delete().eq('slug', secondOrgSlug);
      }
    }
  });
});
