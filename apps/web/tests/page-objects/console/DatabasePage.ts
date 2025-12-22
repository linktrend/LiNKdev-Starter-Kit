import { expect, Locator, Page } from '@playwright/test';

export class DatabasePage {
  readonly page: Page;
  readonly queryInput: Locator;
  readonly executeButton: Locator;
  readonly resultsTable: Locator;
  readonly exportButton: Locator;
  readonly tablesTab: Locator;
  readonly tablesList: Locator;
  readonly refreshButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.queryInput = page.getByPlaceholder('SELECT * FROM users LIMIT 10;');
    this.executeButton = page.getByRole('button', { name: /Execute Query/i });
    this.resultsTable = page.getByRole('table');
    this.exportButton = page.getByRole('button', { name: /Export/i });
    this.tablesTab = page.getByRole('tab', { name: /Tables/i });
    this.tablesList = page.getByRole('table').nth(1);
    this.refreshButton = page.getByRole('button', { name: /Refresh/i });
  }

  async goto() {
    await this.page.goto('/console/database');
    await expect(this.page.getByRole('heading', { name: /Database Console/i })).toBeVisible();
  }

  async runSelectQuery(sql: string) {
    await this.queryInput.fill(sql);
    await this.executeButton.click();
    await expect(this.resultsTable).toBeVisible();
  }

  async expectResultsContain(text: string) {
    await expect(this.resultsTable).toContainText(text);
  }

  async viewTables() {
    await this.tablesTab.click();
    await expect(this.tablesList).toBeVisible();
  }

  async expectTableListed(name: string) {
    await this.viewTables();
    await expect(this.tablesList).toContainText(name);
  }

  async exportResults() {
    await this.exportButton.click();
  }

  async refreshStats() {
    await this.refreshButton.click();
  }
}
