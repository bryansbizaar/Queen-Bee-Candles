/**
 * Simplified Jest Configuration for Queen Bee Candles Server Testing
 */

export default {
  testEnvironment: 'node',
  
  // Global setup and teardown
  globalSetup: '<rootDir>/tests/setup/globalSetup.js',
  globalTeardown: '<rootDir>/tests/setup/globalTeardown.js',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/testSetup.js'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  
  // Coverage configuration
  collectCoverage: false, // Disable initially to focus on getting tests running
  
  // Test timeout
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Environment variables for testing
  setupFiles: ['<rootDir>/tests/setup/env.js'],
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Force exit
  forceExit: true,
  
  // Sequential execution for database tests
  maxWorkers: 1
};
