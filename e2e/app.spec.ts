import { test, expect } from '@playwright/test';

test.describe('team+ Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the application title', async ({ page }) => {
    await expect(page.locator('text=team+')).toBeVisible();
  });

  test('should navigate between pages', async ({ page }) => {
    // Check dashboard is visible by default
    await expect(page.locator('h4:has-text("team+")')).toBeVisible();

    // Navigate to Members
    await page.click('text=Members');
    await expect(page.locator('h4:has-text("Members")')).toBeVisible();

    // Navigate to Teams
    await page.click('text=Teams');
    await expect(page.locator('h4:has-text("Teams")')).toBeVisible();

    // Navigate to Statistics
    await page.click('text=Statistics');
    await expect(page.locator('h4:has-text("Statistics")')).toBeVisible();
  });

  test('should toggle dark mode', async ({ page }) => {
    // Get initial background color
    const body = page.locator('body');
    const initialBg = await body.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );

    // Toggle dark mode
    await page.click('[aria-label*="dark mode"], [aria-label*="Toggle dark mode"]');

    // Wait for transition
    await page.waitForTimeout(500);

    // Check that background color changed
    const newBg = await body.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );

    expect(initialBg).not.toBe(newBg);
  });

  test('should switch language', async ({ page }) => {
    // Open drawer on mobile if needed
    const viewportSize = page.viewportSize();
    if (viewportSize && viewportSize.width < 960) {
      await page.click('[aria-label*="menu"]');
    }

    // Find and click language selector
    const languageSelect = page.locator('select[aria-label*="language"]').first();
    await languageSelect.selectOption('de');

    // Check that language changed (e.g., "Members" becomes "Mitglieder")
    await expect(page.locator('text=Mitglieder')).toBeVisible();

    // Switch back to English
    await languageSelect.selectOption('en');
    await expect(page.locator('text=Members')).toBeVisible();
  });
});
