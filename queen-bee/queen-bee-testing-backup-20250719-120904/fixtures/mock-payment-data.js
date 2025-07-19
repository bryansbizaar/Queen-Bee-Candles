// Mock payment data for Stripe testing
export const mockPaymentData = {
  // Stripe test cards
  testCards: {
    visa: {
      number: '4242424242424242',
      expiry: '12/25',
      cvc: '123'
    },
    visaDebit: {
      number: '4000056655665556',
      expiry: '12/25',
      cvc: '123'
    },
    mastercard: {
      number: '5555555555554444',
      expiry: '12/25',
      cvc: '123'
    },
    declined: {
      number: '4000000000000002',
      expiry: '12/25',
      cvc: '123'
    },
    insufficientFunds: {
      number: '4000000000009995',
      expiry: '12/25',
      cvc: '123'
    },
    processing: {
      number: '4000000000000119',
      expiry: '12/25',
      cvc: '123'
    }
  },

  // Valid billing details for testing
  billingDetails: {
    name: 'Test User',
    email: 'test@example.com',
    address: {
      line1: '123 Test Street',
      city: 'Auckland',
      postal_code: '1010',
      country: 'NZ'
    }
  },

  // Invalid billing details for error testing
  invalidBillingDetails: {
    name: '',
    email: 'invalid-email',
    address: {
      line1: '',
      city: '',
      postal_code: '',
      country: ''
    }
  }
};

// Payment amounts for testing
export const testAmounts = {
  small: 2499, // $24.99 in cents
  medium: 4998, // $49.98 in cents
  large: 9997, // $99.97 in cents
  minimum: 50   // $0.50 in cents (Stripe minimum)
};

// Currency settings
export const currency = 'nzd';
export const currencySymbol = '$';
