import { test, expect } from '@playwright/test';
import { loginAsAdmin, setupAdminAndUser } from '../../helpers/admin-setup';
import { DatabasePage } from '../../page-objects/console/DatabasePage';

test.describe('Console Database', () => {
  test.beforeAll(async () => {
    await setupAdminAndUser();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin can execute read-only queries and export results', async ({ page }) => {
    const db = new DatabasePage(page);
    await db.goto();

    await db.runSelectQuery('SELECT email FROM users LIMIT 5;');
    await db.expectResultsContain('@');
    await db.exportResults();
  });

  test('write operations are blocked', async ({ page }) => {
    const db = new DatabasePage(page);
    await db.goto();

    await db.runSelectQuery('DELETE FROM users;');
    await expect(page.getByText(/Only SELECT|read-only|blocked/i)).toBeVisible();
  });

  test('tables browser shows tables and schema', async ({ page }) => {
    const db = new DatabasePage(page);
    await db.goto();

    await db.viewTables();
    await db.expectTableListed('users');
  });
});
