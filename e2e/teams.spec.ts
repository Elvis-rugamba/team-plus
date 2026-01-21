import { test, expect } from '@playwright/test';

test.describe('Teams Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    await page.click('text=Teams');
  });

  test('should create a new team', async ({ page }) => {
    // Click Add Team button
    await page.click('button:has-text("Add Team")');

    // Fill in the form
    await page.fill('input[aria-label="Name"]', 'Development Team');
    await page.fill('textarea[aria-label="Description"]', 'Main development team for the project');

    // Save
    await page.click('button:has-text("Save")');

    // Verify team appears in the list
    await expect(page.locator('text=Development Team')).toBeVisible();
  });

  test('should edit a team', async ({ page }) => {
    // First create a team
    await page.click('button:has-text("Add Team")');
    await page.fill('input[aria-label="Name"]', 'Design Team');
    await page.fill('textarea[aria-label="Description"]', 'Design team description');
    await page.click('button:has-text("Save")');

    // Wait for team to appear
    await expect(page.locator('text=Design Team')).toBeVisible();

    // Click edit button
    await page.click('[aria-label*="Edit Design Team"]');

    // Update the name
    const nameInput = page.locator('input[aria-label="Name"]');
    await nameInput.clear();
    await nameInput.fill('UI/UX Team');

    // Save
    await page.click('button:has-text("Save")');

    // Verify updated name appears
    await expect(page.locator('text=UI/UX Team')).toBeVisible();
  });

  test('should delete a team', async ({ page }) => {
    // First create a team
    await page.click('button:has-text("Add Team")');
    await page.fill('input[aria-label="Name"]', 'Test Team');
    await page.fill('textarea[aria-label="Description"]', 'This is a test team');
    await page.click('button:has-text("Save")');

    // Wait for team to appear
    await expect(page.locator('text=Test Team')).toBeVisible();

    // Click delete button
    await page.click('[aria-label*="Delete Test Team"]');

    // Confirm deletion
    await page.click('button:has-text("Confirm")');

    // Verify team is deleted
    await expect(page.locator('text=Test Team')).not.toBeVisible();
  });

  test('should assign members to team', async ({ page }) => {
    // First create a member
    await page.click('text=Members');
    await page.click('button:has-text("Add Member")');
    await page.fill('input[aria-label="Name"]', 'Alice Johnson');
    await page.fill('input[aria-label="Role"]', 'Developer');
    await page.click('button:has-text("Save")');

    // Create a team
    await page.click('text=Teams');
    await page.click('button:has-text("Add Team")');
    await page.fill('input[aria-label="Name"]', 'Alpha Team');
    await page.fill('textarea[aria-label="Description"]', 'Alpha team description');
    await page.click('button:has-text("Save")');

    // Click on the team to open assignment dialog
    await page.click('text=Alpha Team');

    // Wait for assignment dialog to open
    await expect(page.locator('text=Assign Members')).toBeVisible();

    // Verify unassigned member is visible
    await expect(page.locator('text=Alice Johnson')).toBeVisible();

    // Close dialog
    await page.click('button:has-text("Close")');
  });
});
