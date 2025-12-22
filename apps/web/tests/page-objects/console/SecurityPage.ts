import { expect, Locator, Page } from '@playwright/test';

export class SecurityPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly usersTab: Locator;
  readonly sessionsTab: Locator;
  readonly auditTab: Locator;
  readonly accessTab: Locator;
  readonly inviteButton: Locator;
  readonly roleButtons: Locator;
  readonly removeButtons: Locator;
  readonly sessionsTable: Locator;
  readonly revokeButtons: Locator;
  readonly passwordPolicy: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading').filter({ hasText: /Security|Access/i }).first();
    this.usersTab = page.getByRole('tab', { name: /Users/i });
    this.sessionsTab = page.getByRole('tab', { name: /Sessions/i });
    this.auditTab = page.getByRole('tab', { name: /Audit/i }).first();
    this.accessTab = page.getByRole('tab', { name: /Access Control/i });
    this.inviteButton = page.getByRole('button', { name: /Invite/i });
    this.roleButtons = page.getByRole('button', { name: /Change role|Role/i });
    this.removeButtons = page.getByRole('button', { name: /Remove/i });
    this.sessionsTable = page.getByRole('table', { name: /Active Sessions/i }).first();
    this.revokeButtons = page.getByRole('button', { name: /Revoke/i });
    this.passwordPolicy = page.getByText('Password policy', { exact: false });
  }

  async goto() {
    await this.page.goto('/console/security');
    await expect(this.heading).toBeVisible();
  }

  async openUsersTab() {
    await this.usersTab.click();
  }

  async inviteUser(email: string, role: string) {
    await this.inviteButton.click();
    await this.page.getByLabel(/Email/i).fill(email);
    await this.page.getByRole('combobox').filter({ hasText: /Role/i }).first().click();
    await this.page.getByRole('option', { name: new RegExp(role, 'i') }).click();
    await this.page.getByRole('button', { name: /Send|Invite/i }).click();
  }

  async changeFirstRole(newRole: string) {
    await this.roleButtons.first().click();
    await this.page.getByRole('option', { name: new RegExp(newRole, 'i') }).click();
  }

  async removeFirstUser() {
    await this.removeButtons.first().click();
    await this.page.getByRole('button', { name: /Confirm|Remove/i }).click();
  }

  async openSessionsTab() {
    await this.sessionsTab.click();
    await expect(this.sessionsTable).toBeVisible();
  }

  async revokeFirstSession() {
    await this.revokeButtons.first().click();
    await this.page.getByRole('button', { name: /Revoke/i }).nth(1).click();
  }

  async openAccessTab() {
    await this.accessTab.click();
    await expect(this.passwordPolicy).toBeVisible();
  }
}
