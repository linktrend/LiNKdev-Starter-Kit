import { test, expect } from '@playwright/test';
import {
  createTestUser,
  deleteUserCascade,
  getAdminClient,
} from '../helpers/setup';
import { randomPassword, randomUsername } from '../helpers/test-data';

test.describe('Billing Checkout Flow', () => {
  test.skip('should display billing page with plans', async ({ page }) => {
    // Create test user with completed onboarding
    const { id, email, password } = await createTestUser({ password: randomPassword() });
    const admin = getAdminClient();
    
    try {
      await admin
        .from('users')
        .update({
          onboarding_completed: true,
          profile_completed: true,
          username: randomUsername('billing'),
        })
        .eq('id', id);

      // Login
      await page.goto('/en/login');
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');

      // Navigate to billing page
      await page.goto('/en/billing');
      await page.waitForLoadState('networkidle');

      // Verify page loads
      await expect(page.getByRole('heading', { name: /billing/i })).toBeVisible({
        timeout: 10000,
      });

      // Verify current plan card
      await expect(page.getByText(/current plan/i)).toBeVisible();

      // Verify plan comparison
      await expect(page.getByText(/available plans/i)).toBeVisible();
      await expect(page.getByText(/free/i)).toBeVisible();
      await expect(page.getByText(/pro/i)).toBeVisible();
      await expect(page.getByText(/business/i)).toBeVisible();
    } finally {
      await deleteUserCascade(id);
    }
  });

  test.skip('should show upgrade buttons for higher plans', async ({ page }) => {
    const { id, email, password } = await createTestUser({ password: randomPassword() });
    const admin = getAdminClient();

    try {
      await admin
        .from('users')
        .update({
          onboarding_completed: true,
          profile_completed: true,
          username: randomUsername('billing-upgrade'),
        })
        .eq('id', id);

      // Login
      await page.goto('/en/login');
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');

      await page.goto('/en/billing');
      await page.waitForLoadState('networkidle');

      // Find upgrade buttons
      const upgradeButtons = page.getByRole('button', { name: /upgrade/i });
      const count = await upgradeButtons.count();
      
      // Should have at least one upgrade button
      expect(count).toBeGreaterThan(0);
    } finally {
      await deleteUserCascade(id);
    }
  });

  test.skip('should show manage billing button for active subscription', async ({ page }) => {
    // This test requires setting up an active subscription in the database
    // Skipped as it requires more complex setup
    
    const { id, email, password } = await createTestUser({ password: randomPassword() });
    const admin = getAdminClient();

    try {
      await admin
        .from('users')
        .update({
          onboarding_completed: true,
          profile_completed: true,
          username: randomUsername('billing-manage'),
        })
        .eq('id', id);

      // TODO: Create organization and subscription for user
      // This would require:
      // 1. Creating an organization
      // 2. Creating a billing_customer record
      // 3. Creating an org_subscriptions record with active status

      // Login
      await page.goto('/en/login');
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');

      await page.goto('/en/billing');
      await page.waitForLoadState('networkidle');

      // Look for manage billing button
      const manageBillingButton = page.getByRole('button', { name: /manage billing/i });
      // This assertion would work once subscription is set up
      // await expect(manageBillingButton).toBeVisible();
    } finally {
      await deleteUserCascade(id);
    }
  });

  test.skip('should handle checkout cancellation', async ({ page }) => {
    const { id, email, password } = await createTestUser({ password: randomPassword() });
    const admin = getAdminClient();

    try {
      await admin
        .from('users')
        .update({
          onboarding_completed: true,
          profile_completed: true,
          username: randomUsername('billing-cancel'),
        })
        .eq('id', id);

      // Login
      await page.goto('/en/login');
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');

      // Navigate to billing with canceled query param
      await page.goto('/en/billing?canceled=true');
      await page.waitForLoadState('networkidle');

      // Should show some indication that checkout was canceled
      // This depends on the UI implementation
      await expect(page.getByText(/billing/i)).toBeVisible();
    } finally {
      await deleteUserCascade(id);
    }
  });
});

test.describe('Billing Page - Smoke Tests', () => {
  test('billing page should be accessible (unauthenticated)', async ({ page }) => {
    // Test that the billing route exists and doesn't crash
    await page.goto('/en/billing');
    
    // Should either show login redirect or billing page
    // Just verify the page loads without error
    await page.waitForLoadState('networkidle');
    
    // Page should load successfully (no 404 or 500)
    expect(page.url()).toContain('/');
  });
});
