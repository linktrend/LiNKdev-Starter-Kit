import { expect, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly locale: string;

  constructor(page: Page, locale = 'en') {
    this.page = page;
    this.locale = locale;
  }

  async goto() {
    await this.page.goto(`/${this.locale}/login`);
  }

  async requestMagicLink(email: string) {
    await this.goto();
    await this.page.getByRole('button', { name: /Continue with Email/i }).click();
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByRole('button', { name: /Send Magic Link/i }).click();
    await expect(this.page.getByText(/Check your email/i)).toBeVisible({ timeout: 10_000 });
  }

  async loginWithPassword(email: string, password: string) {
    await this.page.goto(`/${this.locale}/labs/debug/auth`);
    await this.page.getByPlaceholder('email').fill(email);
    await this.page.getByPlaceholder('password').fill(password);
    await this.page.getByRole('button', { name: /Sign in/i }).click();
    await expect(this.page.getByText(/Signed in/i)).toBeVisible({ timeout: 10_000 });
  }

  async expectLoginError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}
