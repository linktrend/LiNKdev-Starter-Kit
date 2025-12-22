import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { randomPassword, randomUsername } from '../helpers/test-data';
import { createTestUser, deleteUserCascade, generatePasswordResetLink, getAdminClient } from '../helpers/setup';

test.describe('Password reset', () => {
  test('user can request reset, set new password, and log in', async ({ page }) => {
    const originalPassword = randomPassword();
    const newPassword = randomPassword();
    const { id, email } = await createTestUser({ password: originalPassword });
    const admin = getAdminClient();
    await admin
      .from('users')
      .update({ onboarding_completed: true, profile_completed: true, username: randomUsername('reset') })
      .eq('id', id);

    const loginPage = new LoginPage(page);

    try {
      await page.goto('/en/forgot-password');
      await page.getByLabel('Email address').fill(email);
      await page.getByRole('button', { name: /Send reset link/i }).click();
      await expect(page.getByText(/Password reset email sent/i)).toBeVisible({ timeout: 20_000 });

      const resetLink = await generatePasswordResetLink(email);
      await page.goto(resetLink);
      await page.waitForURL('**/auth/reset-password**', { timeout: 20_000 });

      await page.getByLabel('New password').fill(newPassword);
      await page.getByLabel('Confirm password').fill(newPassword);
      await page.getByRole('button', { name: /Update password/i }).click();
      await expect(page.getByText(/Password updated successfully/i)).toBeVisible({ timeout: 20_000 });

      // Verify new password works
      await loginPage.loginWithPassword(email, newPassword);
    } finally {
      await deleteUserCascade(id);
    }
  });
});
