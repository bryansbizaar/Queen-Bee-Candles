#!/bin/bash

# Comprehensive cleanup of ALL testing artifacts

echo "🧹 COMPREHENSIVE TEST CLEANUP"
echo "============================="

echo "📁 Working directory: $(pwd)"

# Create backup directory
mkdir -p ../test-cleanup-backup
echo "📦 Created backup directory: ../test-cleanup-backup"

echo ""
echo "🗑️  REMOVING TEST FILES..."

# 1. Remove Jest configuration files
echo "🔧 Jest configurations:"
for file in jest.config.js jest.config.simple.js; do
    if [ -f "$file" ]; then
        cp "$file" "../test-cleanup-backup/"
        rm "$file"
        echo "✅ Removed: $file"
    fi
done

# 2. Remove test environment files  
echo "🌍 Environment files:"
for file in .env.test .env.test.example; do
    if [ -f "$file" ]; then
        cp "$file" "../test-cleanup-backup/"
        rm "$file"
        echo "✅ Removed: $file"
    fi
done

# 3. Remove entire tests directory
echo "📁 Test directories:"
if [ -d "tests" ]; then
    cp -r "tests" "../test-cleanup-backup/"
    rm -rf "tests"
    echo "✅ Removed: tests/ directory"
fi

# 4. Remove test-related scripts and files
echo "📜 Test scripts:"
for file in test-db-setup.sh test-db.js; do
    if [ -f "$file" ]; then
        cp "$file" "../test-cleanup-backup/"
        rm "$file" 
        echo "✅ Removed: $file"
    fi
done

# 5. Check package.json for test scripts
echo "📦 Checking package.json for test scripts..."
if [ -f "package.json" ]; then
    # Show current test scripts
    echo "Current test scripts in package.json:"
    grep -A 10 '"scripts"' package.json | grep -E "(test|jest|playwright)" || echo "No test scripts found"
fi

echo ""
echo "🔍 SCANNING FOR REMAINING TEST REFERENCES..."

# Find files that might still reference test configurations
echo "Files that mention 'queen_bee_test':"
find . -type f -name "*.js" -not -path "./node_modules/*" -exec grep -l "queen_bee_test" {} \; 2>/dev/null || echo "None found"

echo "Files that mention 'testDatabase':"
find . -type f -name "*.js" -not -path "./node_modules/*" -exec grep -l "testDatabase" {} \; 2>/dev/null || echo "None found"

echo "Files that mention port 8081:"
find . -type f -name "*.js" -not -path "./node_modules/*" -exec grep -l "8081" {} \; 2>/dev/null || echo "None found"

echo "Files that mention port 3001:"
find . -type f -name "*.js" -not -path "./node_modules/*" -exec grep -l "3001" {} \; 2>/dev/null || echo "None found"

echo ""
echo "🎯 CLEANUP COMPLETE!"
echo "=================="
echo "✅ All test files backed up to: ../test-cleanup-backup"
echo "✅ Test configurations removed"
echo "✅ Test directories removed"
echo ""
echo "🚀 NEXT STEPS:"
echo "1. Check above scan results for any remaining references"
echo "2. Restart your server: npm run dev"
echo "3. Test API: curl http://localhost:8080/api/products/1"
echo "4. Should now return: '150g 11.5H x 8W'"
echo ""
echo "💾 All removed files are safely backed up and can be restored if needed"