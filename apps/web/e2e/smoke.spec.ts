import { test, expect } from '@playwright/test';

test.describe('App Boot Check', () => {
  test('app boots and renders marketing page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check for key elements that should be present
    await expect(page.getByText('LiNKdev Starter Kit')).toBeVisible();
    await expect(page.getByText(/A complete & open-source Next.js 14 SaaS template/)).toBeVisible();
    
    // Check for pricing section
    await expect(page.getByText('Pricing')).toBeVisible();
    
    // Check for pricing tiers
    await expect(page.getByText('Starter')).toBeVisible();
    await expect(page.getByText('Pro')).toBeVisible();
    await expect(page.getByText('Enterprise')).toBeVisible();
  });

  test('page has proper title and meta', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/LiNKdev Starter Kit/);
    
    // Check for basic HTML structure
    await expect(page.locator('h1')).toContainText('LiNKdev Starter Kit');
  });

  test('responsive layout works', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('LiNKdev Starter Kit')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByText('LiNKdev Starter Kit')).toBeVisible();
  });
});
