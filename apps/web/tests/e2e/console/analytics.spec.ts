import { test, expect } from '@playwright/test';
import { loginAsAdmin, setupAdminAndUser } from '../../helpers/admin-setup';
import { seedConsoleData, clearConsoleData } from '../../helpers/seed-console-data';
import { AnalyticsPage } from '../../page-objects/console/AnalyticsPage';

test.describe('Console Analytics Dashboard', () => {
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

  test('admin views metrics, changes date range, exports data', async ({ page }) => {
    const analytics = new AnalyticsPage(page);
    await analytics.goto();
    await analytics.expectChartsVisible();

    await analytics.changeDateRange('7'); // last 7 days option
    await analytics.refresh();
    await analytics.exportJson();
  });
});
