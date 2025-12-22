import { expect, Locator, Page } from '@playwright/test';

export class HealthPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly refreshNow: Locator;
  readonly autoRefreshToggle: Locator;
  readonly statusCards: Locator;
  readonly chart: Locator;
  readonly statusTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Console Health/i });
    this.refreshNow = page.getByRole('button', { name: /Refresh now/i });
    this.autoRefreshToggle = page.getByRole('button', { name: /Auto-refresh/i });
    this.statusCards = page.locator('div').filter({ hasText: 'Overall Status' });
    this.chart = page.getByRole('figure').first();
    this.statusTable = page.getByRole('table');
  }

  async goto() {
    await this.page.goto('/console/health');
    await expect(this.heading).toBeVisible();
  }

  async refresh() {
    await this.refreshNow.click();
  }

  async toggleAutoRefresh() {
    await this.autoRefreshToggle.click();
  }

  async expectServicesListed() {
    await expect(this.statusTable).toBeVisible();
    const rows = await this.statusTable.getByRole('row').count();
    expect(rows).toBeGreaterThan(1);
  }

  async expectChartVisible() {
    await expect(this.chart).toBeVisible();
  }
}
