import { test, expect } from '@playwright/test';

test.describe('App Boot Check', () => {
  test('app boots and renders login page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check for key elements that should be present
    await expect(page.getByText(/Welcome to LiNKdev Starter Kit/i)).toBeVisible();
    await expect(page.getByText(/Log in to your account/i)).toBeVisible();
  });

  test('page has proper title and meta', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/LiNKdev Starter Kit/);
    
    // Check for basic HTML structure
    await expect(page.locator('h1')).toContainText('Welcome to LiNKdev Starter Kit');
  });

  test('responsive layout works', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText(/Welcome to LiNKdev Starter Kit/i)).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByText(/Welcome to LiNKdev Starter Kit/i)).toBeVisible();
  });
});
