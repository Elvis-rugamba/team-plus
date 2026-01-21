import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Data Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Create some test data
    await page.click('text=Members');
    await page.click('button:has-text("Add Member")');
    await page.fill('input[aria-label="Name"]', 'Export Test User');
    await page.fill('input[aria-label="Role"]', 'Tester');
    await page.click('button:has-text("Save")');
    
    // Go back to dashboard
    await page.click('text=Dashboard');
  });

  test('should export data as JSON', async ({ page }) => {
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.click('button:has-text("Export")');
    
    // Select JSON format
    await page.click('text=JSON');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download filename
    expect(download.suggestedFilename()).toMatch(/team-plus-export-.*\.json$/);
  });

  test('should export data as CSV', async ({ page }) => {
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.click('button:has-text("Export")');
    
    // Select CSV format
    await page.click('text=CSV');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download filename
    expect(download.suggestedFilename()).toMatch(/team-plus-export-.*\.csv$/);
  });
});
