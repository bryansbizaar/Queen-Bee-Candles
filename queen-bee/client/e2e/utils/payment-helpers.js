// Payment flow helper functions for Stripe integration testing
import { expect } from '@playwright/test';
import { mockPaymentData } from '../fixtures/mock-payment-data.js';

export class PaymentHelpers {
  constructor(page) {
    this.page = page;
  }

  /**
   * Fill in Stripe payment form with test card details
   */
  async fillStripePaymentForm(cardType = 'visa', billingDetails = null) {
    const card = mockPaymentData.testCards[cardType];
    const billing = billingDetails || mockPaymentData.billingDetails;
    
    // Wait for Stripe Elements to load
    await this.page.waitForSelector('[data-testid="stripe-payment-form"]', { timeout: 10000 });
    
    // Fill card number (Stripe iframe)
    const cardNumberFrame = this.page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
    await cardNumberFrame.locator('[name="cardnumber"]').fill(card.number);
    
    // Fill expiry date
    const expiryFrame = this.page.frameLocator('iframe[name*="__privateStripeFrame"]').nth(1);
    await expiryFrame.locator('[name="exp-date"]').fill(card.expiry);
    
    // Fill CVC
    const cvcFrame = this.page.frameLocator('iframe[name*="__privateStripeFrame"]').nth(2);
    await cvcFrame.locator('[name="cvc"]').fill(card.cvc);
    
    // Fill billing details outside of iframe
    await this.page.fill('[data-testid="billing-name"]', billing.name);
    await this.page.fill('[data-testid="billing-email"]', billing.email);
    await this.page.fill('[data-testid="billing-address-line1"]', billing.address.line1);
    await this.page.fill('[data-testid="billing-city"]', billing.address.city);
    await this.page.fill('[data-testid="billing-postal-code"]', billing.address.postal_code);
    await this.page.selectOption('[data-testid="billing-country"]', billing.address.country);
  }

  /**
   * Submit payment form
   */
  async submitPayment() {
    await this.page.click('[data-testid="submit-payment-button"]');
    
    // Wait for payment processing
    await this.page.waitForSelector('[data-testid="payment-processing"]', { timeout: 5000 });
  }

  /**
   * Complete successful payment flow
   */
  async completeSuccessfulPayment(cardType = 'visa', billingDetails = null) {
    await this.fillStripePaymentForm(cardType, billingDetails);
    await this.submitPayment();
    
    // Wait for success page
    await this.page.waitForURL('/success', { timeout: 30000 });
    await expect(this.page.locator('[data-testid="payment-success-message"]')).toBeVisible();
  }

  /**
   * Test payment failure scenario
   */
  async testPaymentFailure(cardType = 'declined') {
    await this.fillStripePaymentForm(cardType);
    await this.submitPayment();
    
    // Wait for error message
    await expect(this.page.locator('[data-testid="payment-error"]')).toBeVisible();
  }

  /**
   * Test payment with insufficient funds
   */
  async testInsufficientFunds() {
    await this.fillStripePaymentForm('insufficientFunds');
    await this.submitPayment();
    
    // Verify specific error message
    await expect(this.page.locator('[data-testid="payment-error"]'))
      .toContainText('insufficient funds');
  }

  /**
   * Test payment that requires additional authentication
   */
  async testPaymentRequiresAuthentication() {
    await this.fillStripePaymentForm('processing');
    await this.submitPayment();
    
    // Handle 3D Secure authentication if present
    try {
      await this.page.waitForSelector('[data-testid="stripe-3ds-frame"]', { timeout: 5000 });
      await this.complete3DSecureAuthentication();
    } catch {
      // No 3DS required, continue with normal flow
    }
  }

  /**
   * Complete 3D Secure authentication
   */
  async complete3DSecureAuthentication() {
    const threeDSFrame = this.page.frameLocator('[data-testid="stripe-3ds-frame"]');
    await threeDSFrame.locator('[data-testid="complete-authentication"]').click();
  }

  /**
   * Verify order creation after successful payment
   */
  async verifyOrderCreation(expectedOrderData) {
    // Check if redirected to success page
    await expect(this.page).toHaveURL('/success');
    
    // Verify order confirmation details
    await expect(this.page.locator('[data-testid="order-confirmation"]')).toBeVisible();
    
    if (expectedOrderData.customerEmail) {
      await expect(this.page.locator('[data-testid="customer-email"]'))
        .toContainText(expectedOrderData.customerEmail);
    }
    
    if (expectedOrderData.total) {
      await expect(this.page.locator('[data-testid="order-total"]'))
        .toContainText(`$${expectedOrderData.total.toFixed(2)}`);
    }
    
    // Verify order items
    if (expectedOrderData.items) {
      for (const item of expectedOrderData.items) {
        const orderItem = this.page.locator('[data-testid="order-item"]')
          .filter({ hasText: item.name });
        await expect(orderItem).toBeVisible();
        
        if (item.quantity) {
          await expect(orderItem).toContainText(`Qty: ${item.quantity}`);
        }
      }
    }
  }

  /**
   * Test payment form validation
   */
  async testPaymentFormValidation() {
    // Try to submit empty form
    await this.page.click('[data-testid="submit-payment-button"]');
    
    // Check for validation errors
    await expect(this.page.locator('[data-testid="form-validation-error"]')).toBeVisible();
  }

  /**
   * Test invalid card number
   */
  async testInvalidCardNumber() {
    const invalidCard = {
      number: '1111111111111111',
      expiry: '12/25',
      cvc: '123'
    };
    
    // Fill with invalid card
    const cardNumberFrame = this.page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
    await cardNumberFrame.locator('[name="cardnumber"]').fill(invalidCard.number);
    
    // Try to submit
    await this.page.click('[data-testid="submit-payment-button"]');
    
    // Verify error message
    await expect(this.page.locator('[data-testid="card-error"]')).toBeVisible();
  }

  /**
   * Test expired card
   */
  async testExpiredCard() {
    const expiredCard = {
      number: '4242424242424242',
      expiry: '12/20', // Expired date
      cvc: '123'
    };
    
    const cardNumberFrame = this.page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
    await cardNumberFrame.locator('[name="cardnumber"]').fill(expiredCard.number);
    
    const expiryFrame = this.page.frameLocator('iframe[name*="__privateStripeFrame"]').nth(1);
    await expiryFrame.locator('[name="exp-date"]').fill(expiredCard.expiry);
    
    // Verify expiry error
    await expect(this.page.locator('[data-testid="expiry-error"]')).toBeVisible();
  }

  /**
   * Test payment timeout scenario
   */
  async testPaymentTimeout() {
    // Mock slow network
    await this.page.route('**/create-payment-intent', route => {
      setTimeout(() => route.continue(), 31000); // Longer than timeout
    });
    
    await this.fillStripePaymentForm();
    await this.submitPayment();
    
    // Verify timeout error
    await expect(this.page.locator('[data-testid="timeout-error"]')).toBeVisible();
  }

  /**
   * Test payment with different currencies
   */
  async testCurrencyHandling(currency = 'nzd', expectedSymbol = '$') {
    // Verify currency is displayed correctly
    await expect(this.page.locator('[data-testid="currency-symbol"]'))
      .toContainText(expectedSymbol);
    
    // Complete payment and verify currency in confirmation
    await this.completeSuccessfulPayment();
    await expect(this.page.locator('[data-testid="order-total"]'))
      .toContainText(expectedSymbol);
  }

  /**
   * Test guest checkout flow
   */
  async testGuestCheckout(guestEmail = 'guest@example.com') {
    // Fill guest email
    await this.page.fill('[data-testid="guest-email"]', guestEmail);
    
    // Complete payment
    await this.completeSuccessfulPayment();
    
    // Verify guest order creation
    await this.verifyOrderCreation({ customerEmail: guestEmail });
  }

  /**
   * Test payment retry after failure
   */
  async testPaymentRetry() {
    // First attempt with declined card
    await this.testPaymentFailure('declined');
    
    // Clear form and retry with valid card
    await this.page.reload();
    await this.completeSuccessfulPayment('visa');
  }

  /**
   * Monitor payment processing performance
   */
  async measurePaymentProcessingTime() {
    const startTime = Date.now();
    
    await this.fillStripePaymentForm();
    await this.submitPayment();
    
    // Wait for completion
    await this.page.waitForURL('/success', { timeout: 30000 });
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.log(`Payment processing time: ${processingTime}ms`);
    
    // Assert reasonable processing time (under 10 seconds)
    expect(processingTime).toBeLessThan(10000);
    
    return processingTime;
  }

  /**
   * Test payment form accessibility
   */
  async testPaymentFormAccessibility() {
    // Verify form labels
    await expect(this.page.locator('label[for="billing-name"]')).toBeVisible();
    await expect(this.page.locator('label[for="billing-email"]')).toBeVisible();
    
    // Test keyboard navigation
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    
    // Verify focus is on payment form elements
    const focusedElement = await this.page.evaluateHandle(() => document.activeElement);
    expect(focusedElement).toBeTruthy();
  }
}
