import { test, expect } from '@playwright/test';

test.describe('Smart Stadium Platform E2E - Authentication & Themes', () => {
  test('should load the login page and toggle console profiles manually', async ({ page }) => {
    await page.goto('/login');

    // Verify title and header
    await expect(page).toHaveTitle(/StadiumGenius/);
    await expect(page.locator('h1')).toContainText('StadiumGenius');

    // Click Admin console dot preview selector
    const adminPill = page.locator('button[title="Preview Console: Admin"]');
    await adminPill.click();

    // Verify visual classes of selected theme indicator
    await expect(adminPill).toHaveClass(/scale-125|ring-2/);
  });

  test('should automatically detect email keywords and switch themes accordingly', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    
    // Type admin email
    await emailInput.fill('admin@stadiumgenius.io');
    await page.waitForTimeout(300); // Wait for transition animation
    
    // Check if the logo changes color (has rose-500 gradient classes)
    const logoContainer = page.locator('.w-16.h-16.rounded-2xl');
    await expect(logoContainer).toHaveClass(/from-rose-500/);
  });

  test('should sign in using the mock fallback operator account', async ({ page }) => {
    await page.goto('/login');

    // Click Continue with Auth0 (triggering mock operator sign-in bypass)
    const auth0Btn = page.locator('button', { hasText: 'Continue with Auth0' });
    await auth0Btn.click();

    // Verify transition to main console dashboard page
    await expect(page).toHaveURL(/.*5173\/?$/);
  });
});
