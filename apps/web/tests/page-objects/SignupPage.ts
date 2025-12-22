import { expect, type Page } from '@playwright/test';

export class SignupPage {
  readonly page: Page;
  readonly locale: string;

  constructor(page: Page, locale = 'en') {
    this.page = page;
    this.locale = locale;
  }

  async goto() {
    await this.page.goto(`/${this.locale}/signup`);
  }

  async acceptTerms() {
    await this.page.getByRole('checkbox', { name: /By continuing/i }).check();
  }

  async startEmailSignup(email: string) {
    await this.acceptTerms();
    await this.page.getByRole('button', { name: /Continue with Email/i }).click();
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByRole('button', { name: /Send Magic Link/i }).click();
    await expect(this.page.getByText(/Check your email/i)).toBeVisible({ timeout: 10_000 });
  }

  async completeOnboardingProfile(profile: {
    displayName: string;
    username: string;
    firstName: string;
    lastName: string;
    bio?: string;
  }) {
    // Step 1 (if visible): continue with email and accept terms
    const continueEmailButton = this.page.getByRole('button', { name: /Continue with Email/i });
    if (await continueEmailButton.isVisible()) {
      await this.page.getByLabel('Email').fill(`${profile.username}@example.com`);
      await this.page.getByRole('checkbox', { name: /Privacy Policy/i }).check();
      await continueEmailButton.click();
    }

    // Ensure we are on step 2 of onboarding
    await expect(this.page.getByText(/Complete Profile/i)).toBeVisible();

    await this.page.getByLabel('Display Name *').fill(profile.displayName);
    await this.page.getByLabel('Username *').fill(profile.username);
    await this.page.getByLabel('First Name *').fill(profile.firstName);
    await this.page.getByLabel('Last Name *').fill(profile.lastName);

    if (profile.bio) {
      const aboutToggle = this.page.getByRole('button', { name: /About/ });
      const isExpanded = await aboutToggle.getAttribute('aria-expanded');
      if (isExpanded === 'false' || isExpanded === null) {
        await aboutToggle.click();
      }
      await this.page.getByLabel('Bio').fill(profile.bio);
    }

    await this.page.getByRole('button', { name: /Complete Setup/i }).click();
  }
}
