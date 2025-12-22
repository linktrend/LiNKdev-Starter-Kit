import { expect, type Page } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly locale: string;

  constructor(page: Page, locale = 'en') {
    this.page = page;
    this.locale = locale;
  }

  async goto() {
    await this.page.goto(`/${this.locale}/dashboard`);
  }

  async expectLoaded() {
    await expect(this.page.getByText(/Welcome to LTM Starter Kit/i)).toBeVisible({ timeout: 15_000 });
  }
}
