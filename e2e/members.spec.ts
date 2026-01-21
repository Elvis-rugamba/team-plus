import { test, expect } from '@playwright/test';

test.describe('Members Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Members');
    
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should create a new member', async ({ page }) => {
    // Click Add Member button
    await page.click('button:has-text("Add Member")');

    // Fill in the form
    await page.fill('input[aria-label="Name"]', 'John Doe');
    await page.fill('input[aria-label="Role"]', 'Software Developer');
    
    // Add skills
    const skillsInput = page.locator('input[aria-label="Skills"]');
    await skillsInput.fill('JavaScript');
    await skillsInput.press('Enter');
    await skillsInput.fill('React');
    await skillsInput.press('Enter');

    // Fill email
    await page.fill('input[aria-label="Email"]', 'john@example.com');

    // Save
    await page.click('button:has-text("Save")');

    // Verify member appears in the list
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Software Developer')).toBeVisible();
  });

  test('should edit a member', async ({ page }) => {
    // First create a member
    await page.click('button:has-text("Add Member")');
    await page.fill('input[aria-label="Name"]', 'Jane Smith');
    await page.fill('input[aria-label="Role"]', 'Designer');
    await page.click('button:has-text("Save")');

    // Wait for member to appear
    await expect(page.locator('text=Jane Smith')).toBeVisible();

    // Click edit button
    await page.click('[aria-label*="Edit Jane Smith"]');

    // Update the name
    const nameInput = page.locator('input[aria-label="Name"]');
    await nameInput.clear();
    await nameInput.fill('Jane Doe');

    // Save
    await page.click('button:has-text("Save")');

    // Verify updated name appears
    await expect(page.locator('text=Jane Doe')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).not.toBeVisible();
  });

  test('should delete a member', async ({ page }) => {
    // First create a member
    await page.click('button:has-text("Add Member")');
    await page.fill('input[aria-label="Name"]', 'Bob Johnson');
    await page.fill('input[aria-label="Role"]', 'Manager');
    await page.click('button:has-text("Save")');

    // Wait for member to appear
    await expect(page.locator('text=Bob Johnson')).toBeVisible();

    // Click delete button
    await page.click('[aria-label*="Delete Bob Johnson"]');

    // Confirm deletion
    await page.click('button:has-text("Confirm")');

    // Verify member is deleted
    await expect(page.locator('text=Bob Johnson')).not.toBeVisible();
  });

  test('should switch between view modes', async ({ page }) => {
    // Create a test member first
    await page.click('button:has-text("Add Member")');
    await page.fill('input[aria-label="Name"]', 'Test User');
    await page.fill('input[aria-label="Role"]', 'Tester');
    await page.click('button:has-text("Save")');

    // Try grid view
    await page.click('[aria-label="Grid"]');
    await expect(page.locator('text=Test User')).toBeVisible();

    // Try list view
    await page.click('[aria-label="List"]');
    await expect(page.locator('text=Test User')).toBeVisible();

    // Back to table view
    await page.click('[aria-label="Table"]');
    await expect(page.locator('text=Test User')).toBeVisible();
  });
});
