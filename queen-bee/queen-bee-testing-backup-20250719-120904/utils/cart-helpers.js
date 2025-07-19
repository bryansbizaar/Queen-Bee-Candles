// Cart-specific helper functions for E2E tests
import { expect } from '@playwright/test';

export class CartHelpers {
  constructor(page) {
    this.page = page;
  }

  /**
   * Add a product to cart from the homepage
   */
  async addProductToCart(productName, quantity = 1) {
    // Find the product card by name
    const productCard = this.page.locator('[data-testid="product-card"]')
      .filter({ hasText: productName });
    
    await expect(productCard).toBeVisible();
    
    // Click the add to cart button
    await productCard.locator('[data-testid="add-to-cart-button"]').click();
    
    // If quantity > 1, update quantity
    if (quantity > 1) {
      await this.updateCartItemQuantity(productName, quantity);
    }
    
    // Wait for cart to update
    await this.page.waitForTimeout(500);
  }

  /**
   * Add a product to cart from product detail page
   */
  async addProductToCartFromDetail(productId, quantity = 1) {
    await this.page.goto(`/product/${productId}`);
    await this.page.waitForLoadState('networkidle');
    
    // Update quantity if needed
    if (quantity > 1) {
      const quantityInput = this.page.locator('[data-testid="quantity-input"]');
      await quantityInput.fill(quantity.toString());
    }
    
    // Click add to cart
    await this.page.click('[data-testid="add-to-cart-button"]');
    await this.page.waitForTimeout(500);
  }

  /**
   * Open cart sidebar or navigate to cart page
   */
  async openCart() {
    await this.page.click('[data-testid="cart-button"]');
    await this.page.waitForTimeout(500);
  }

  /**
   * Navigate to cart page
   */
  async goToCartPage() {
    await this.page.goto('/cart');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Update quantity of an item in cart
   */
  async updateCartItemQuantity(productName, newQuantity) {
    const cartItem = this.page.locator('[data-testid="cart-item"]')
      .filter({ hasText: productName });
    
    const quantityInput = cartItem.locator('[data-testid="quantity-input"]');
    await quantityInput.fill(newQuantity.toString());
    
    // Wait for quantity update
    await this.page.waitForTimeout(500);
  }

  /**
   * Remove an item from cart
   */
  async removeCartItem(productName) {
    const cartItem = this.page.locator('[data-testid="cart-item"]')
      .filter({ hasText: productName });
    
    await cartItem.locator('[data-testid="remove-item-button"]').click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Clear entire cart
   */
  async clearCart() {
    try {
      await this.page.click('[data-testid="clear-cart-button"]');
      await this.page.waitForTimeout(500);
    } catch (error) {
      // If no clear cart button, remove items individually
      const cartItems = await this.page.locator('[data-testid="cart-item"]').count();
      for (let i = 0; i < cartItems; i++) {
        await this.page.locator('[data-testid="remove-item-button"]').first().click();
        await this.page.waitForTimeout(200);
      }
    }
  }

  /**
   * Verify cart state
   */
  async verifyCartState(expectedItems = []) {
    await this.openCart();
    
    if (expectedItems.length === 0) {
      // Verify empty cart
      await expect(this.page.locator('[data-testid="empty-cart-message"]')).toBeVisible();
    } else {
      // Verify each expected item
      for (const item of expectedItems) {
        const cartItem = this.page.locator('[data-testid="cart-item"]')
          .filter({ hasText: item.name });
        
        await expect(cartItem).toBeVisible();
        
        if (item.quantity) {
          const quantityInput = cartItem.locator('[data-testid="quantity-input"]');
          await expect(quantityInput).toHaveValue(item.quantity.toString());
        }
        
        if (item.price) {
          await expect(cartItem).toContainText(`$${item.price}`);
        }
      }
    }
  }

  /**
   * Get cart item count from cart button
   */
  async getCartItemCount() {
    const cartButton = this.page.locator('[data-testid="cart-button"]');
    const cartBadge = cartButton.locator('[data-testid="cart-count"]');
    
    try {
      const countText = await cartBadge.textContent();
      return parseInt(countText || '0');
    } catch {
      return 0;
    }
  }

  /**
   * Calculate expected cart total
   */
  calculateExpectedTotal(items) {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  /**
   * Verify cart total
   */
  async verifyCartTotal(expectedTotal) {
    await this.openCart();
    const totalElement = this.page.locator('[data-testid="cart-total"]');
    await expect(totalElement).toContainText(`$${expectedTotal.toFixed(2)}`);
  }

  /**
   * Proceed to checkout from cart
   */
  async proceedToCheckout() {
    await this.openCart();
    await this.page.click('[data-testid="checkout-button"]');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify cart persistence across page navigation
   */
  async verifyCartPersistence(expectedItemCount) {
    // Navigate to different pages and verify cart persists
    const pages = ['/'];
    
    for (const pagePath of pages) {
      await this.page.goto(pagePath);
      await this.page.waitForLoadState('networkidle');
      
      const currentCount = await this.getCartItemCount();
      expect(currentCount).toBe(expectedItemCount);
    }
  }

  /**
   * Test cart with maximum quantity
   */
  async testMaxQuantity(productName, maxQuantity = 10) {
    await this.addProductToCart(productName, 1);
    
    // Try to set quantity above maximum
    const cartItem = this.page.locator('[data-testid="cart-item"]')
      .filter({ hasText: productName });
    
    const quantityInput = cartItem.locator('[data-testid="quantity-input"]');
    await quantityInput.fill((maxQuantity + 1).toString());
    
    // Verify quantity is capped at maximum
    await this.page.waitForTimeout(500);
    await expect(quantityInput).toHaveValue(maxQuantity.toString());
  }

  /**
   * Test cart with invalid quantity
   */
  async testInvalidQuantity(productName) {
    await this.addProductToCart(productName, 1);
    
    const cartItem = this.page.locator('[data-testid="cart-item"]')
      .filter({ hasText: productName });
    
    const quantityInput = cartItem.locator('[data-testid="quantity-input"]');
    
    // Test with zero
    await quantityInput.fill('0');
    await this.page.waitForTimeout(500);
    
    // Should either remove item or reset to 1
    const itemExists = await cartItem.isVisible();
    if (itemExists) {
      await expect(quantityInput).toHaveValue('1');
    }
  }
}
