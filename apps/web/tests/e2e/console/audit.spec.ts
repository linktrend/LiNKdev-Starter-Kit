import { test } from '@playwright/test';
import { loginAsAdmin, setupAdminAndUser } from '../../helpers/admin-setup';
import { seedConsoleData, clearConsoleData } from '../../helpers/seed-console-data';
import { AuditPage } from '../../page-objects/console/AuditPage';

test.describe('Console Audit Logs', () => {
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

  test('admin can filter, search, paginate, and export audit logs', async ({ page }) => {
    const audit = new AuditPage(page);
    await audit.goto();
    await audit.expectRows();

    await audit.filterAction('member');
    await audit.filterEntity('user');
    await audit.search('role');
    await audit.exportCsv();
  });
});
