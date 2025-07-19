/**
 * Fix: Reduce verbose logging during tests
 * 
 * Update the error handler to be less verbose during testing
 */

import { logError } from './errorHandler.js';

// Update the error handler to reduce logging during tests
export const updateErrorHandlerForTests = () => {
  // Check if we're in test environment
  if (process.env.NODE_ENV === 'test') {
    console.log('🔇 Reducing error log verbosity for tests');
    
    // We could modify the logError function or set a flag
    // For now, let's update the test environment settings
  }
};

// Test environment configuration
if (process.env.NODE_ENV === 'test') {
  // Reduce console noise during tests
  const originalError = console.error;
  console.error = (...args) => {
    // Only log actual test failures, not expected validation errors
    const message = args.join(' ');
    if (!message.includes('🚨 Error Details:') && 
        !message.includes('ValidationError') &&
        !message.includes('invalid input syntax for type integer')) {
      originalError.apply(console, args);
    }
  };
}

console.log('✅ Error handler configured for test environment');