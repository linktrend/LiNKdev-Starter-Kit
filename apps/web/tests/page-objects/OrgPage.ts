import { expect, type Page } from '@playwright/test';

export class OrgPage {
  readonly page: Page;
  readonly locale: string;

  constructor(page: Page, locale = 'en') {
    this.page = page;
    this.locale = locale;
  }

  async gotoNew() {
    await this.page.goto(`/${this.locale}/organizations/new`);
  }

  async createOrganization(params: { name: string; slug: string; typeLabel?: string; description?: string }) {
    await this.gotoNew();
    await this.page.getByLabel('Organization Name').fill(params.name);
    await this.page.getByLabel('Organization Slug').fill(params.slug);

    if (params.typeLabel) {
      await this.page.getByLabel('Organization Type').click();
      await this.page.getByRole('option', { name: params.typeLabel }).click();
    }

    if (params.description) {
      await this.page.getByLabel('Description').fill(params.description);
    }

    await this.page.getByRole('button', { name: /Create Organization/i }).click();
  }

  async gotoOrgMembers(slug: string) {
    await this.page.goto(`/${this.locale}/organizations/${slug}/members`);
  }

  async inviteMember(email: string, role: 'member' | 'viewer' = 'viewer') {
    await this.page.getByLabel('Email address').fill(email);
    await this.page.getByLabel('Role').click();
    await this.page.getByRole('option', { name: new RegExp(role, 'i') }).click();
    await this.page.getByRole('button', { name: /Send invitation/i }).click();
    await expect(this.page.getByText(/Invitation sent/i)).toBeVisible({ timeout: 10_000 });
  }

  async expectMemberVisible(email: string) {
    await expect(this.page.getByText(email)).toBeVisible({ timeout: 15_000 });
  }
}
