import { test, expect } from '@playwright/test';
import { SignupPage } from '../page-objects/SignupPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { randomDisplayName, randomEmail, randomUsername } from '../helpers/test-data';
import { deleteUserCascade, findUserByEmail, generateMagicLink } from '../helpers/setup';

test.describe('Signup & Onboarding', () => {
  test('user can sign up and complete onboarding', async ({ page }) => {
    const email = randomEmail('signup');
    const username = randomUsername('onboard');
    const displayName = randomDisplayName('Onboarding User');
    const signupPage = new SignupPage(page);
    const dashboardPage = new DashboardPage(page);
    let userId: string | undefined;

    try {
      await signupPage.goto();
      await signupPage.startEmailSignup(email);

      const magicLink = await generateMagicLink(email, 'signup');
      expect(magicLink).toBeTruthy();

      // Open magic link to establish session
      await page.goto(magicLink);
      await page.waitForURL('**/onboarding**', { timeout: 20_000 });

      await signupPage.completeOnboardingProfile({
        displayName,
        username,
        firstName: 'Test',
        lastName: 'User',
        bio: 'E2E onboarding flow',
      });

      await dashboardPage.expectLoaded();

      const user = await findUserByEmail(email);
      userId = user?.id;
      expect(userId).toBeTruthy();
    } finally {
      if (userId) {
        await deleteUserCascade(userId);
      }
    }
  });
});
