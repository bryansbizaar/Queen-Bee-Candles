/**
 * SAFE Test Environment Variables
 * 
 * CRITICAL: This file ONLY sets environment variables for Jest tests
 * It does NOT override production environment when server runs normally
 */

// Only override environment if we're actually running tests
if (process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('jest'))) {
  console.log('🧪 Loading TEST environment for Jest tests');
  
  // Override database configuration for tests ONLY
  process.env.DATABASE_HOST = 'localhost';
  process.env.DATABASE_PORT = '5432';
  process.env.DATABASE_NAME = 'queen_bee_test';
  process.env.DATABASE_USER = 'bryanowens';
  process.env.DATABASE_PASSWORD = 'testpassword';

  // Test Stripe keys
  process.env.STRIPE_SECRET_KEY = 'sk_test_51KiUsHJeFn5NEp5heW6QNiC5NgNX4hEKigH8fpRoQlscBQmXkVIQDxjjf1UfP01wpfr5XXqIKa6m0Y0xWvBhIPxT00qMIUe49p';
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_51KiUsHJeFn5NEp5hPErex1Pxw5SZMnlkBoSvS28FjvTeGNhrc8Xu5Hj4kP4GlYlEugzyhZiIja20EZFZuNXPbBl100A2oVoUN4';

  // Test-specific flags - REDUCE NOISE
  process.env.DISABLE_RATE_LIMITING = 'true';
  process.env.DISABLE_CORS = 'true';
  process.env.LOG_LEVEL = 'silent'; // Reduce test noise
  process.env.SUPPRESS_VALIDATION_LOGS = 'true'; // Hide expected validation errors
  
} else {
  console.log('🚀 Production mode - NOT loading test environment overrides');
}
