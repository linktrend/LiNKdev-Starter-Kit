import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsUser, setupAdminAndUser } from '../../helpers/admin-setup';
import { SecurityPage } from '../../page-objects/console/SecurityPage';

test.describe('Console Security & User Management', () => {
  test.beforeAll(async () => {
    await setupAdminAndUser();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin can view members, invite, change roles, and manage sessions', async ({ page }) => {
    const security = new SecurityPage(page);
    await security.goto();

    await security.openUsersTab();
    await security.changeFirstRole('admin');
    await security.inviteUser('new-member+playwright@ltm.dev', 'viewer');

    await security.openSessionsTab();
    await security.revokeFirstSession();

    await security.openAccessTab();
  });

  test('non-admin is blocked from security console', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/console/security');
    await expect(page).toHaveURL(/access-denied|login|dashboard/);
  });
});
