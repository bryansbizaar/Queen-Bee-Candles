/**
 * SAFE Jest Configuration for Queen Bee Candles Server Testing
 * Modified to prevent production environment interference
 */

export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testTimeout: 30000,
  verbose: true,
  
  // SAFE: Only load env.js when actually running tests
  setupFiles: ['<rootDir>/tests/setup/env.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/testSetup.js'],
  
  clearMocks: true,
  maxWorkers: 1,
  forceExit: true,
  
  // Coverage settings
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // No transforms - let Node.js handle ES modules natively
  transform: {}
};
