/**
 * Jest Configuration for Queen Bee Candles Server Testing
 * Simplified for ES modules
 */

export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testTimeout: 30000,
  verbose: true,
  setupFiles: ['<rootDir>/tests/setup/env.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/testSetup.js'],
  clearMocks: true,
  maxWorkers: 1,
  forceExit: true,
  
  // No transforms - let Node.js handle ES modules natively
  transform: {}
};
