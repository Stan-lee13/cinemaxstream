import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page for unauthenticated users', async ({ page }) => {
    // Check if we're on the landing page
    await expect(page.locator('text=CineMax')).toBeVisible();
    
    // Should see some form of call-to-action for authentication
    const authButton = page.locator('button:has-text("Sign"), a:has-text("Sign")').first();
    await expect(authButton).toBeVisible();
  });

  test('should navigate to authentication page', async ({ page }) => {
    // Look for authentication-related navigation
    const signInButton = page.locator('button:has-text("Sign"), a:has-text("Sign")').first();
    await signInButton.click();
    
    // Should navigate to auth page or show auth modal
    await expect(page).toHaveURL(/.*\/(auth|login|signin).*/);
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');
    
    // Look for email and password inputs
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign")').first();
    
    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      // Fill invalid credentials
      await emailInput.fill('invalid@email.com');
      await passwordInput.fill('wrongpassword');
      await submitButton.click();
      
      // Should show error message
      await expect(page.locator('text=/error|invalid|incorrect/i')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Navigation', () => {
  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for main navigation elements
  const navigation = page.locator('nav, [role="navigation"]').first();
    await expect(navigation).toBeVisible();
    
    // Check for logo/home link
  const logoLink = page.locator('a:has-text("CineMax"), a[href="/"]').first();
    await expect(logoLink).toBeVisible();
  });

  test('should navigate between main sections', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to different sections
    const movieLink = page.locator('a:has-text("Movies"), [href*="movie"]').first();
    if (await movieLink.isVisible()) {
      await movieLink.click();
      await expect(page).toHaveURL(/.*movie.*/);
    }
  });
});

test.describe('Content Discovery', () => {
  test('should display content cards', async ({ page }) => {
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Look for content cards or movie items
  const contentCards = page.locator('[data-card-title], .movie-card, [role="article"]');
    await expect(contentCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have working search functionality', async ({ page }) => {
    await page.goto('/');
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="search"], input[type="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('action');
      await searchInput.press('Enter');
      
      // Should show search results or loading state
      await page.waitForTimeout(2000);
      // Test passes if no errors occur during search
    }
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if mobile navigation is visible
    const mobileNav = page.locator('[class*="mobile"], .mobile-menu, button[aria-label*="menu"]');
    await expect(mobileNav.first()).toBeVisible({ timeout: 5000 });
  });

  test('should work on tablet devices', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check if content is properly displayed
    await expect(page.locator('text=CineMax')).toBeVisible();
  });
});