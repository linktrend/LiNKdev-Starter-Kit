import { expect, Locator, Page } from '@playwright/test';

export class AnalyticsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly dateRange: Locator;
  readonly refreshButton: Locator;
  readonly exportJsonButton: Locator;
  readonly charts: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Platform Analytics/i });
    this.dateRange = page.getByRole('button').filter({ hasText: /Last|Today|This/i }).first();
    this.refreshButton = page.getByRole('button', { name: /Refresh/i });
    this.exportJsonButton = page.getByRole('button', { name: /Export JSON/i });
    this.charts = page.locator('canvas');
  }

  async goto() {
    await this.page.goto('/console/analytics');
    await expect(this.heading).toBeVisible();
  }

  async changeDateRange(option: string) {
    await this.dateRange.click();
    await this.page.getByRole('option', { name: new RegExp(option, 'i') }).click();
  }

  async refresh() {
    await this.refreshButton.click();
  }

  async exportJson() {
    await this.exportJsonButton.click();
  }

  async expectChartsVisible() {
    await expect(this.charts.first()).toBeVisible();
  }
}
