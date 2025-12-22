import { expect, Locator, Page } from '@playwright/test';

export class AuditPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly actionSelect: Locator;
  readonly entitySelect: Locator;
  readonly userSelect: Locator;
  readonly searchInput: Locator;
  readonly exportButton: Locator;
  readonly logTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Audit Logs/i });
    this.actionSelect = page.getByRole('combobox', { name: /Action/i }).first();
    this.entitySelect = page.getByRole('combobox', { name: /Entity type/i }).first();
    this.userSelect = page.getByRole('combobox', { name: /User/i }).first();
    this.searchInput = page.getByPlaceholder('Full-text search…');
    this.exportButton = page.getByRole('button', { name: /Export/i });
    this.logTable = page.getByRole('table');
  }

  async goto() {
    await this.page.goto('/console/audit');
    await expect(this.heading).toBeVisible();
  }

  async filterAction(action: string) {
    await this.actionSelect.click();
    await this.page.getByRole('option', { name: new RegExp(action, 'i') }).click();
  }

  async filterEntity(entity: string) {
    await this.entitySelect.click();
    await this.page.getByRole('option', { name: new RegExp(entity, 'i') }).click();
  }

  async search(term: string) {
    await this.searchInput.fill(term);
  }

  async exportCsv() {
    await this.exportButton.click();
  }

  async expectRows() {
    await expect(this.logTable).toBeVisible();
    const count = await this.logTable.getByRole('row').count();
    expect(count).toBeGreaterThan(1);
  }
}
