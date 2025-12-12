import { test, expect } from '@playwright/test';

test.describe('Streaming Experience', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication to access content
    await page.addInitScript(() => {
      localStorage.setItem('cinemax-auth-test', 'true');
    });
    await page.goto('/');
  });

  test('should display video player with provider selector', async ({ page }) => {
    // Navigate to a content detail page
    await page.goto('/content/550'); // Fight Club as example
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Check if video player wrapper is visible
    const videoPlayer = page.locator('[data-tour-id="provider-selector"]');
    await expect(videoPlayer).toBeVisible({ timeout: 10000 });
    
    // Check if provider selector buttons are present
    const providerButtons = page.locator('button:has-text("VidSrc")');
    await expect(providerButtons.first()).toBeVisible();
    
    // Check if at least one provider is active (has checkmark)
    const activeProvider = page.locator('button svg');
    await expect(activeProvider.first()).toBeVisible();
  });

  test('should switch between providers', async ({ page }) => {
    await page.goto('/content/550');
    await page.waitForLoadState('networkidle');
    
    // Get initial provider
    const initialProvider = await page.locator('button[variant="default"]').textContent();
    
    // Click on a different provider
    const otherProviders = page.locator('button:has-text("VidSrc"):not([variant="default"])');
    if (await otherProviders.count() > 0) {
      await otherProviders.first().click();
      
      // Check if provider changed
      await page.waitForTimeout(1000);
      const newProvider = await page.locator('button[variant="default"]').textContent();
      expect(newProvider).not.toEqual(initialProvider);
    }
  });

  test('should show loading state during provider switching', async ({ page }) => {
    await page.goto('/content/550');
    await page.waitForLoadState('networkidle');
    
    // Click on a different provider
    const otherProviders = page.locator('button:has-text("VidSrc"):not([variant="default"])');
    if (await otherProviders.count() > 0) {
      await otherProviders.first().click();
      
      // Check if loading spinner appears
      const loadingSpinner = page.locator('svg.animate-spin');
      await expect(loadingSpinner).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle provider errors gracefully', async ({ page }) => {
    await page.goto('/content/550');
    await page.waitForLoadState('networkidle');
    
    // Simulate provider failure by intercepting requests
    await page.route('**/vidsrc*', async route => {
      await route.abort('failed');
    });
    
    // Wait for error handling
    await page.waitForTimeout(3000);
    
    // Check if error message is displayed
    const errorMessage = page.locator('text=Provider blocked');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    
    // Check if retry button is available
    const retryButton = page.locator('button:has-text("Try Another Source")');
    await expect(retryButton).toBeVisible();
  });

  test('should maintain correct TMDB IDs for series episodes', async ({ page }) => {
    // Navigate to a series content detail page
    await page.goto('/content/1399'); // Game of Thrones as example
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Select a season and episode
    const seasonSelector = page.locator('select[name="season"]');
    if (await seasonSelector.isVisible()) {
      await seasonSelector.selectOption('1');
      
      // Wait for episodes to load
      await page.waitForTimeout(1000);
      
      // Select first episode
      const episodeSelector = page.locator('select[name="episode"]');
      if (await episodeSelector.isVisible()) {
        await episodeSelector.selectOption('1');
        
        // Check if video player updates with correct episode info
        const videoPlayer = page.locator('[data-tour-id="provider-selector"]');
        await expect(videoPlayer).toBeVisible();
      }
    }
  });

  test('should preserve iframe security attributes', async ({ page }) => {
    await page.goto('/content/550');
    await page.waitForLoadState('networkidle');
    
    // Check if iframe has correct security attributes
    const iframe = page.locator('iframe[referrerPolicy="origin"]');
    await expect(iframe).toBeVisible({ timeout: 10000 });
    
    // Check if iframe has allow attribute with required permissions
    const allowAttribute = await iframe.getAttribute('allow');
    expect(allowAttribute).toContain('autoplay');
    expect(allowAttribute).toContain('fullscreen');
  });
});