// Test helper utilities for E2E tests
import { expect } from '@playwright/test';

/**
 * Navigation helpers
 */
export class NavigationHelpers {
  constructor(page) {
    this.page = page;
  }

  async goToHomepage() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async goToCart() {
    await this.page.click('[data-testid="cart-button"]');
    await this.page.waitForLoadState('networkidle');
  }

  async goToProduct(productId) {
    await this.page.goto(`/product/${productId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async goToCheckout() {
    await this.page.goto('/checkout');
    await this.page.waitForLoadState('networkidle');
  }
}

/**
 * Wait utilities
 */
export class WaitHelpers {
  constructor(page) {
    this.page = page;
  }

  async waitForElement(selector, options = {}) {
    return await this.page.waitForSelector(selector, {
      timeout: 10000,
      ...options
    });
  }

  async waitForText(selector, text, options = {}) {
    await this.page.waitForFunction(
      ({ selector, text }) => {
        const element = document.querySelector(selector);
        return element && element.textContent.includes(text);
      },
      { selector, text },
      { timeout: 10000, ...options }
    );
  }

  async waitForApiCall(urlPattern) {
    return await this.page.waitForResponse(response => 
      response.url().includes(urlPattern) && response.status() === 200
    );
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}

/**
 * Screenshot and debugging utilities
 */
export class DebugHelpers {
  constructor(page) {
    this.page = page;
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `e2e/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  async logPageErrors() {
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Page error:', msg.text());
      }
    });

    this.page.on('pageerror', error => {
      console.log('Page error:', error.message);
    });
  }

  async logNetworkRequests() {
    this.page.on('request', request => {
      console.log('Request:', request.method(), request.url());
    });

    this.page.on('response', response => {
      if (!response.ok()) {
        console.log('Failed response:', response.status(), response.url());
      }
    });
  }
}

/**
 * Form filling utilities
 */
export class FormHelpers {
  constructor(page) {
    this.page = page;
  }

  async fillForm(formData) {
    for (const [field, value] of Object.entries(formData)) {
      if (value) {
        await this.page.fill(`[name="${field}"]`, value);
      }
    }
  }

  async selectOption(selector, value) {
    await this.page.selectOption(selector, value);
  }

  async submitForm(formSelector = 'form') {
    await this.page.click(`${formSelector} [type="submit"]`);
  }
}

/**
 * Database cleanup utilities
 */
export class DatabaseHelpers {
  constructor(page) {
    this.page = page;
  }

  async cleanupTestData() {
    // This would typically make API calls to clean up test data
    // For now, we'll implement basic cleanup
    try {
      await this.page.request.delete('/api/test/cleanup');
    } catch (error) {
      console.log('Cleanup not available:', error.message);
    }
  }

  async seedTestData() {
    try {
      await this.page.request.post('/api/test/seed');
    } catch (error) {
      console.log('Seeding not available:', error.message);
    }
  }
}

/**
 * Assertion helpers
 */
export class AssertionHelpers {
  constructor(page) {
    this.page = page;
  }

  async expectElementVisible(selector) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async expectElementHidden(selector) {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  async expectTextContent(selector, expectedText) {
    await expect(this.page.locator(selector)).toContainText(expectedText);
  }

  async expectUrl(expectedUrl) {
    await expect(this.page).toHaveURL(expectedUrl);
  }

  async expectPageTitle(expectedTitle) {
    await expect(this.page).toHaveTitle(expectedTitle);
  }
}

/**
 * Create helper instances for a page
 */
export function createHelpers(page) {
  return {
    navigation: new NavigationHelpers(page),
    wait: new WaitHelpers(page),
    debug: new DebugHelpers(page),
    forms: new FormHelpers(page),
    database: new DatabaseHelpers(page),
    assertions: new AssertionHelpers(page)
  };
}
