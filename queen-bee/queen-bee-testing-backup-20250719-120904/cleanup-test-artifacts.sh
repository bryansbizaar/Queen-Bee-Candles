#!/bin/bash

# Clean up test artifacts that are interfering with production

echo "🧹 CLEANING UP TEST ARTIFACTS"
echo "=============================="

echo "📁 Current directory: $(pwd)"

# 1. Remove or rename problematic test setup files
echo "🗑️  Removing test environment override files..."

if [ -f "tests/setup/env.js" ]; then
    mv tests/setup/env.js tests/setup/env.js.disabled
    echo "✅ Disabled tests/setup/env.js (renamed to .disabled)"
fi

if [ -f "jest.config.js" ]; then
    mv jest.config.js jest.config.js.disabled  
    echo "✅ Disabled jest.config.js (renamed to .disabled)"
fi

# 2. Remove test environment files
echo "🗑️  Removing test environment files..."

if [ -f ".env.test" ]; then
    mv .env.test .env.test.disabled
    echo "✅ Disabled .env.test"
fi

# 3. Check for other test files that might interfere
echo "🔍 Checking for other test interference..."

# List files that might be causing issues
find . -name "*.test.js" -not -path "./node_modules/*" | head -5
find . -name "*playwright*" -not -path "./node_modules/*" | head -5

echo ""
echo "🎯 RESULTS:"
echo "✅ Test environment overrides disabled"
echo "✅ Jest configuration disabled" 
echo "✅ Test environment file disabled"
echo ""
echo "🚀 Next steps:"
echo "1. Restart your server: npm run dev"
echo "2. Test API: curl http://localhost:8080/api/products/1"
echo "3. Should now return correct data from your real database"
echo ""
echo "💡 If you want to run tests later, rename .disabled files back"