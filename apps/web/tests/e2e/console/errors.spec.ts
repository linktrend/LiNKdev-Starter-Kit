import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsUser, setupAdminAndUser } from '../../helpers/admin-setup';
import { seedConsoleData, clearConsoleData } from '../../helpers/seed-console-data';
import { ErrorsPage } from '../../page-objects/console/ErrorsPage';

test.describe('Console Error Logs', () => {
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

  test('admin can filter, search, resolve, and export errors', async ({ page }) => {
    const errors = new ErrorsPage(page);
    await errors.goto();
    await errors.expectListVisible();

    await errors.filterBySeverity('critical');
    await errors.search('database');
    await errors.selectFirstRow();
    await errors.markSelectedResolved();
    await errors.exportErrors();
  });

  test('non-admin blocked from errors console', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/console/errors');
    await expect(page).toHaveURL(/access-denied|login|dashboard/);
  });
});
