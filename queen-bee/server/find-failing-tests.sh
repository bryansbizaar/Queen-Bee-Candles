#!/bin/bash

# Find the specific failing tests in Phase 1

echo "🔍 IDENTIFYING FAILING PHASE 1 TESTS"
echo "===================================="

cd /Users/bryanowens/Code/Websites/Candles/queen-bee/server

echo "📊 Running tests with detailed output to identify failures..."
echo ""

# Run tests with verbose output and capture results
npm test -- --verbose --no-coverage --detectOpenHandles 2>&1 | tee test-results.log

echo ""
echo "🔍 ANALYZING RESULTS..."
echo "======================"

# Extract failing test information
echo "❌ Failed tests:"
grep -A 5 -B 5 "FAIL\|✕\|failed" test-results.log | head -20

echo ""
echo "📋 Test suite summary:"
grep "Test Suites:" test-results.log

echo ""
echo "📊 Individual test results:"
grep "Tests:" test-results.log

echo ""
echo "🗂️ Looking for specific error patterns..."

# Look for database "NaN" errors
echo ""
echo "🔍 Database NaN errors:"
grep -n "invalid input syntax for type integer.*NaN" test-results.log | head -5

# Look for specific failing test names
echo ""
echo "🔍 Specific test failures:"
grep -B 2 -A 2 "✕" test-results.log | head -10

echo ""
echo "💡 NEXT STEPS:"
echo "=============="
echo "1. Check the test-results.log file for full details"
echo "2. Look for tests with ✕ symbols"
echo "3. Focus on tests mentioning 'NaN' or 'invalid-id'"
echo ""
echo "📁 Full log saved to: test-results.log"