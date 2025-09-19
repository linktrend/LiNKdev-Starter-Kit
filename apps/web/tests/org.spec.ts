import { test, expect } from '@playwright/test';

test.describe('Organizations Module', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (assuming user is logged in)
    await page.goto('/dashboard');
  });

  test('should display organization switcher in navbar', async ({ page }) => {
    // Check if organization switcher is visible
    await expect(page.locator('text=Organization:')).toBeVisible();
    await expect(page.locator('text=Sample Org')).toBeVisible();
  });

  test('should navigate to organization settings', async ({ page }) => {
    // Navigate to organization settings
    await page.goto('/settings/organization');
    
    // Check if organization settings page loads
    await expect(page.locator('h1:has-text("Organization Settings")')).toBeVisible();
    await expect(page.locator('text=Manage your organization, members, and invitations')).toBeVisible();
  });

  test('should display organization cards', async ({ page }) => {
    await page.goto('/settings/organization');
    
    // Check if organization cards are displayed
    await expect(page.locator('text=Organization')).toBeVisible();
    await expect(page.locator('text=Members')).toBeVisible();
    await expect(page.locator('text=Invitations')).toBeVisible();
    
    // Check if sample data is displayed
    await expect(page.locator('text=Sample Org')).toBeVisible();
    await expect(page.locator('text=4')).toBeVisible(); // Member count
    await expect(page.locator('text=2')).toBeVisible(); // Invitation count
  });

  test('should navigate to members page', async ({ page }) => {
    await page.goto('/settings/organization/members');
    
    // Check if members page loads
    await expect(page.locator('h1:has-text("Team Members")')).toBeVisible();
    await expect(page.locator('text=Manage your organization members and invitations')).toBeVisible();
  });

  test('should display member list', async ({ page }) => {
    await page.goto('/settings/organization/members');
    
    // Check if member tabs are present
    await expect(page.locator('text=Members (4)')).toBeVisible();
    await expect(page.locator('text=Invitations (2)')).toBeVisible();
    
    // Check if sample members are displayed
    await expect(page.locator('text=John Owner')).toBeVisible();
    await expect(page.locator('text=Jane Admin')).toBeVisible();
    await expect(page.locator('text=Bob Editor')).toBeVisible();
    await expect(page.locator('text=Alice Viewer')).toBeVisible();
  });

  test('should display role selectors for members', async ({ page }) => {
    await page.goto('/settings/organization/members');
    
    // Check if role selectors are present
    const roleSelectors = page.locator('[role="combobox"]');
    await expect(roleSelectors).toHaveCount(4); // One for each member
  });

  test('should navigate to invite page', async ({ page }) => {
    await page.goto('/settings/organization/invite');
    
    // Check if invite page loads
    await expect(page.locator('h1:has-text("Invite Team Members")')).toBeVisible();
    await expect(page.locator('text=Send invitations to join your organization and manage pending invites')).toBeVisible();
  });

  test('should display invite form', async ({ page }) => {
    await page.goto('/settings/organization/invite');
    
    // Check if invite form is present
    await expect(page.locator('text=Send New Invitation')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('text=Role')).toBeVisible();
    await expect(page.locator('button:has-text("Send invitation")')).toBeVisible();
  });

  test('should display pending invitations', async ({ page }) => {
    await page.goto('/settings/organization/invite');
    
    // Check if invitation status is displayed
    await expect(page.locator('text=Invitation Status')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=Accepted')).toBeVisible();
    
    // Check if recent invitations are displayed
    await expect(page.locator('text=Recent Invitations')).toBeVisible();
    await expect(page.locator('text=john@example.com')).toBeVisible();
    await expect(page.locator('text=jane@example.com')).toBeVisible();
  });

  test('should display invitation guidelines', async ({ page }) => {
    await page.goto('/settings/organization/invite');
    
    // Check if guidelines are displayed
    await expect(page.locator('text=Invitation Guidelines')).toBeVisible();
    await expect(page.locator('text=Invitations expire after 7 days')).toBeVisible();
    await expect(page.locator('text=Recipients will receive an email with instructions to join')).toBeVisible();
  });

  test('should switch between member and invite tabs', async ({ page }) => {
    await page.goto('/settings/organization/members');
    
    // Start on members tab
    await expect(page.locator('text=Members (4)')).toBeVisible();
    
    // Switch to invites tab
    await page.click('text=Invitations (2)');
    await expect(page.locator('text=Send Invitation')).toBeVisible();
    await expect(page.locator('text=Pending Invitations')).toBeVisible();
    
    // Switch back to members tab
    await page.click('text=Members (4)');
    await expect(page.locator('text=Organization Members')).toBeVisible();
  });

  test('should display quick actions', async ({ page }) => {
    await page.goto('/settings/organization');
    
    // Check if quick actions are displayed
    await expect(page.locator('text=Quick Actions')).toBeVisible();
    await expect(page.locator('text=Create Organization')).toBeVisible();
    await expect(page.locator('text=Invite Members')).toBeVisible();
  });

  test('should handle offline mode gracefully', async ({ page }) => {
    // This test verifies that the template works in offline mode
    // The components should display mock data without errors
    
    await page.goto('/settings/organization');
    
    // All elements should be visible even in offline mode
    await expect(page.locator('h1:has-text("Organization Settings")')).toBeVisible();
    await expect(page.locator('text=Sample Org')).toBeVisible();
    
    // No error messages should be displayed
    await expect(page.locator('text=Error')).not.toBeVisible();
    await expect(page.locator('text=Failed to load')).not.toBeVisible();
  });
});
