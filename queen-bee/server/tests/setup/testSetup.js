/**
 * Simplified Test Setup - No database dependency
 * 
 * Provides basic test utilities without database operations
 */

// Global test timeout
jest.setTimeout(30000);

// Setup before each test
beforeEach(async () => {
  // Reset any global state
  jest.clearAllMocks();
});

// Suppress console.log in tests unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  if (process.env.NODE_ENV === 'test' && !process.env.DEBUG_TESTS) {
    console.log = jest.fn();
    // Keep error logging for debugging
    console.error = originalConsoleError;
  }
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
