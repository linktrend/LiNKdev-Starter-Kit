import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsUser, setupAdminAndUser } from '../../helpers/admin-setup';
import { HealthPage } from '../../page-objects/console/HealthPage';
import { seedConsoleData, clearConsoleData } from '../../helpers/seed-console-data';

test.describe('Console Health Monitoring', () => {
  test.beforeAll(async () => {
    await setupAdminAndUser();
    await seedConsoleData();
  });

  test.afterAll(async () => {
    await clearConsoleData();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin views services, refreshes, and sees charts', async ({ page }) => {
    const health = new HealthPage(page);

    await health.goto();
    await health.expectServicesListed();
    await health.expectChartVisible();

    await health.refresh();
    await health.toggleAutoRefresh();
  });

  test('non-admin cannot access console health', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/console/health');
    await expect(page).toHaveURL(/access-denied|login|dashboard/);
  });
});
