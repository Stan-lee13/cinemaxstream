import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility issues on auth page', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for proper heading structure (h1, h2, h3, etc.)
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBeGreaterThan(0);
    
    // Ensure there's at least one main heading
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();
  });

  test('should have accessible navigation landmarks', async ({ page }) => {
    await page.goto('/');
    
  // Check for main navigation landmark
  const navigation = page.locator('[role="navigation"], nav');
    await expect(navigation.first()).toBeVisible();
    
  // Check for main content landmark
  const mainContent = page.locator('[role="main"], main');
    await expect(mainContent.first()).toBeVisible();
  });

  test('should have proper skip links', async ({ page }) => {
    await page.goto('/');
    
    // Tab to the first element (should be skip link)
    await page.keyboard.press('Tab');
    
  // Check if skip link is focused and visible
  const skipLink = page.locator('a:has-text("Skip")').first();
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeFocused();
      await expect(skipLink).toBeVisible();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze();
    
    // Filter for color contrast violations specifically
    const contrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    
    expect(contrastViolations).toEqual([]);
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/');
    
    // Tab through the page to ensure focus is visible
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if the focused element has visible focus indicator
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have accessible form controls', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
  // Check for form inputs with proper labels
  const inputs = page.locator('input[type="email"], input[type="password"], input[type="text"]');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        
        // Each input should have an accessible name (label, aria-label, etc.)
        const accessibleName = await input.getAttribute('aria-label') || 
                               await input.getAttribute('aria-labelledby') ||
                               await page.locator(`label[for="${await input.getAttribute('id')}"]`).textContent();
        
        expect(accessibleName).toBeTruthy();
      }
    }
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['aria-valid-attr', 'aria-valid-attr-value', 'aria-required-attr'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Start keyboard navigation
    await page.keyboard.press('Tab');
    
    // Navigate through several elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      
      // Check if focus is visible
      const focusedElement = page.locator(':focus');
      if (await focusedElement.count() > 0) {
        await expect(focusedElement).toBeVisible();
      }
    }
  });

  test('should work with screen reader simulation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test with axe-core rules specifically for screen readers
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .withRules(['image-alt', 'label', 'link-name'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});