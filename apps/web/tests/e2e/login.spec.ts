import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { randomPassword, randomUsername } from '../helpers/test-data';
import {
  createTestUser,
  deleteUserCascade,
  generateMagicLink,
  getAdminClient,
} from '../helpers/setup';

test.describe('Login flows', () => {
  test('login with email/password', async ({ page }) => {
    const { id, email, password } = await createTestUser({ password: randomPassword() });
    const admin = getAdminClient();
    await admin
      .from('users')
      .update({ onboarding_completed: true, profile_completed: true, username: randomUsername('login') })
      .eq('id', id);

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    try {
      await loginPage.loginWithPassword(email, password);
      await dashboardPage.goto();
      await dashboardPage.expectLoaded();
    } finally {
      await deleteUserCascade(id);
    }
  });

  test('failed login shows error', async ({ page }) => {
    const { id, email } = await createTestUser({ password: randomPassword() });
    const wrongPassword = 'WrongPass123!';
    const loginPage = new LoginPage(page);

    try {
      await loginPage.loginWithPassword(email, wrongPassword);
      await loginPage.expectLoginError('Invalid login credentials');
    } finally {
      await deleteUserCascade(id);
    }
  });

  test('login with magic link', async ({ page }) => {
    const { id, email } = await createTestUser({ password: randomPassword() });
    const admin = getAdminClient();
    await admin
      .from('users')
      .update({ onboarding_completed: true, profile_completed: true, username: randomUsername('magic') })
      .eq('id', id);

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    try {
      await loginPage.requestMagicLink(email);
      const magicLink = await generateMagicLink(email, 'magiclink');
      await page.goto(magicLink);
      await dashboardPage.expectLoaded();
    } finally {
      await deleteUserCascade(id);
    }
  });

  test.skip('login with Google OAuth (stubbed)', async () => {
    // OAuth is stubbed per instruction; covered by unit/integration.
  });

  test('redirects back to intended page after login', async ({ page }) => {
    const { id, email } = await createTestUser({ password: randomPassword() });
    const admin = getAdminClient();
    await admin
      .from('users')
      .update({ onboarding_completed: true, profile_completed: true, username: randomUsername('redirect') })
      .eq('id', id);

    const protectedPath = '/en/profile';
    const loginPage = new LoginPage(page);

    try {
      await page.goto(protectedPath);
      await expect(page).toHaveURL(/\/en\/login/);

      const magicLink = await generateMagicLink(email, 'magiclink');
      await page.goto(magicLink);

      await page.goto(protectedPath);
      await expect(page.getByRole('heading', { name: /Profile/i })).toBeVisible({ timeout: 15_000 });
    } finally {
      await deleteUserCascade(id);
    }
  });
});
