import { expect, Locator, Page } from '@playwright/test';

export class ErrorsPage {
  readonly page: Page;
  readonly dashboard: Locator;
  readonly searchInput: Locator;
  readonly severitySelect: Locator;
  readonly statusSelect: Locator;
  readonly errorList: Locator;
  readonly resolveButton: Locator;
  readonly exportButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboard = page.getByText('Error Dashboard', { exact: false });
    this.searchInput = page.getByPlaceholder('Search message, stack, page');
    this.severitySelect = page.getByRole('button', { name: /All severities|Severity/i });
    this.statusSelect = page.getByRole('button', { name: /All status|Status/i });
    this.errorList = page.getByRole('table');
    this.resolveButton = page.getByRole('button', { name: /Resolve selected/i });
    this.exportButton = page.getByRole('button', { name: /Export/i });
  }

  async goto() {
    await this.page.goto('/console/errors');
    await expect(this.dashboard).toBeVisible();
  }

  async filterBySeverity(severity: 'critical' | 'error' | 'warning' | 'info') {
    await this.severitySelect.click();
    await this.page.getByRole('option', { name: new RegExp(severity, 'i') }).click();
  }

  async filterResolved(state: 'open' | 'resolved' | 'all' = 'open') {
    await this.statusSelect.click();
    const label = state === 'resolved' ? 'Resolved' : state === 'all' ? 'All status' : 'Open';
    await this.page.getByRole('option', { name: new RegExp(label, 'i') }).click();
  }

  async search(term: string) {
    await this.searchInput.fill(term);
  }

  async selectFirstRow() {
    const firstCheckbox = this.page.getByRole('checkbox').first();
    await firstCheckbox.check({ force: true });
  }

  async markSelectedResolved() {
    await this.resolveButton.click();
  }

  async expandFirstError() {
    const toggle = this.page.getByRole('button', { name: /View details|Expand/i }).first();
    await toggle.click();
  }

  async exportErrors() {
    await this.exportButton.click();
  }

  async expectListVisible() {
    await expect(this.errorList).toBeVisible();
  }
}
