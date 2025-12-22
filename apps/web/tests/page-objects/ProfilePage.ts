import { expect, type Page } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly locale: string;

  constructor(page: Page, locale = 'en') {
    this.page = page;
    this.locale = locale;
  }

  async goto() {
    await this.page.goto(`/${this.locale}/profile`);
  }

  async openEditModal() {
    await this.page.getByRole('button', { name: /Edit profile/i }).click();
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async updateProfile(fields: { displayName?: string; bio?: string; username?: string }) {
    if (fields.displayName) {
      await this.page.getByLabel('Display name').fill(fields.displayName);
    }
    if (fields.username) {
      await this.page.getByLabel('Username').fill(fields.username);
    }
    if (fields.bio) {
      await this.page.getByLabel('Bio').fill(fields.bio);
    }
    await this.page.getByRole('button', { name: /Save changes/i }).click();
    await expect(this.page.getByRole('dialog')).not.toBeVisible({ timeout: 15000 });
  }
}
