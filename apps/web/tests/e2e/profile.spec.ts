import { test, expect } from '@playwright/test';
import { ProfilePage } from '../page-objects/ProfilePage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { randomDisplayName, randomPassword, randomUsername } from '../helpers/test-data';
import {
  createTestUser,
  deleteUserCascade,
  generateMagicLink,
  getAdminClient,
} from '../helpers/setup';

test.describe('Profile management', () => {
  test('user can update profile and preview avatar', async ({ page }) => {
    const { id, email } = await createTestUser({ password: randomPassword() });
    const admin = getAdminClient();
    const username = randomUsername('profile');
    const displayName = randomDisplayName('Profile User');
    const bio = 'Updated bio from E2E test';

    await admin
      .from('users')
      .update({
        onboarding_completed: true,
        profile_completed: true,
        username,
        first_name: 'Profile',
        last_name: 'Tester',
      })
      .eq('id', id);

    const profilePage = new ProfilePage(page);
    const dashboardPage = new DashboardPage(page);

    try {
      const magicLink = await generateMagicLink(email, 'magiclink');
      await page.goto(magicLink);
      await dashboardPage.expectLoaded();

      await profilePage.goto();
      await profilePage.openEditModal();
      await profilePage.updateProfile({ displayName, bio });

      await expect(page.getByText(displayName)).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(bio)).toBeVisible({ timeout: 15_000 });

      // Avatar upload preview (non-network)
      const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=',
        'base64'
      );
      await profilePage.openEditModal();
      await page.setInputFiles('#avatar-upload', {
        name: 'avatar.png',
        mimeType: 'image/png',
        buffer,
      });
      await expect(page.getByText(/Upload avatar/i)).toBeVisible();
    } finally {
      await deleteUserCascade(id);
    }
  });
});
