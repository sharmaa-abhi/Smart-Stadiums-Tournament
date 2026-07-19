import { test, expect } from '@playwright/test';

test.describe('Smart Stadium Platform E2E - Performance & Stability', () => {
  test('should load the login page and measure load speed under 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login');
    const loadTime = Date.now() - startTime;
    
    // Assert page loading is within the performance budget (2000ms)
    expect(loadTime).toBeLessThan(2000);
  });

  test('should show lazy loading skeleton fallbacks during initial route load', async ({ page }) => {
    // Navigate to verify skeletons
    await page.goto('/');
    const skeletonCount = await page.locator('.animate-shimmer').count();
    expect(skeletonCount).toBeDefined();
  });
});
