#!/bin/bash

# COMPREHENSIVE E2E TESTING CLEANUP
# Based on Phase 3 implementation and cleanup documentation

echo "🧹 COMPREHENSIVE E2E TESTING CLEANUP"
echo "===================================="
echo "📍 Current directory: $(pwd)"

# Create backup directory
BACKUP_DIR="../queen-bee-testing-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Created backup directory: $BACKUP_DIR"

echo ""
echo "🗑️  REMOVING E2E TESTING FILES..."

# ========================================
# 1. CLIENT-SIDE CLEANUP
# ========================================
echo ""
echo "📱 CLIENT-SIDE CLEANUP:"

cd ../client 2>/dev/null || { echo "❌ Client directory not found"; exit 1; }

# Remove E2E directory and all test files
if [ -d "e2e" ]; then
    cp -r "e2e" "$BACKUP_DIR/"
    rm -rf "e2e"
    echo "✅ Removed: e2e/ directory"
fi

# Remove Playwright config
if [ -f "playwright.config.js" ]; then
    cp "playwright.config.js" "$BACKUP_DIR/"
    rm "playwright.config.js"
    echo "✅ Removed: playwright.config.js"
fi

# Remove test results and reports
for dir in playwright-report test-results; do
    if [ -d "$dir" ]; then
        rm -rf "$dir"
        echo "✅ Removed: $dir/"
    fi
done

# Remove debug screenshots
if ls *.png 1> /dev/null 2>&1; then
    mv *.png "$BACKUP_DIR/" 2>/dev/null
    echo "✅ Moved debug screenshots to backup"
fi

# Remove test environment files
for file in .env.test .env.test.example; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/"
        rm "$file"
        echo "✅ Removed: $file"
    fi
done

# Clean package.json of Playwright dependencies
echo "📦 Checking client package.json for test dependencies..."
if [ -f "package.json" ]; then
    cp "package.json" "$BACKUP_DIR/client-package.json.backup"
    
    # Show current test-related scripts and dependencies
    echo "Current test dependencies and scripts:"
    grep -E "(playwright|@axe-core)" package.json || echo "No E2E dependencies found"
    grep -A 10 '"scripts"' package.json | grep -E "(e2e|playwright)" || echo "No E2E scripts found"
fi

# ========================================
# 2. SERVER-SIDE CLEANUP  
# ========================================
echo ""
echo "🖥️  SERVER-SIDE CLEANUP:"

cd ../server 2>/dev/null || { echo "❌ Server directory not found"; exit 1; }

# Remove Jest configuration files
for file in jest.config.js jest.config.simple.js; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/"
        rm "$file"
        echo "✅ Removed: $file"
    fi
done

# Remove test environment files
for file in .env.test .env.test.example; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/"
        rm "$file"
        echo "✅ Removed: $file"
    fi
done

# Remove entire tests directory
if [ -d "tests" ]; then
    cp -r "tests" "$BACKUP_DIR/"
    rm -rf "tests"
    echo "✅ Removed: tests/ directory (including testDatabase.js and env.js)"
fi

# Remove test database scripts
for file in test-db-setup.sh test-db.js; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/"
        rm "$file"
        echo "✅ Removed: $file"
    fi
done

# Remove diagnostic scripts we created
for file in debug-connection.js inspect-database.js test-productservice.js fix-production-db.js comprehensive-cleanup.sh cleanup-test-artifacts.sh; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/" 2>/dev/null
        rm "$file" 2>/dev/null
        echo "✅ Removed: $file"
    fi
done

# Clean package.json of test dependencies and scripts
echo "📦 Checking server package.json for test dependencies..."
if [ -f "package.json" ]; then
    cp "package.json" "$BACKUP_DIR/server-package.json.backup"
    
    # Show current test-related content
    echo "Current test dependencies and scripts:"
    grep -E "(jest|@.*test|supertest)" package.json || echo "No test dependencies found"
    grep -A 15 '"scripts"' package.json | grep -E "(test|jest)" || echo "No test scripts found"
fi

# ========================================
# 3. ROOT LEVEL CLEANUP
# ========================================
echo ""
echo "🏠 ROOT LEVEL CLEANUP:"

cd .. 2>/dev/null

# Remove root level test files
for file in fix-database.js check-database.js debug-database.js server-db-diagnostic.js; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/" 2>/dev/null
        rm "$file" 2>/dev/null
        echo "✅ Removed: $file"
    fi
done

# ========================================
# 4. SCAN FOR REMAINING REFERENCES
# ========================================
echo ""
echo "🔍 SCANNING FOR REMAINING TEST REFERENCES..."

# Find files that might still reference problematic configurations
echo "Files mentioning 'queen_bee_test':"
find . -name "*.js" -not -path "./node_modules/*" -not -path "./$BACKUP_DIR/*" -exec grep -l "queen_bee_test" {} \; 2>/dev/null | head -5 || echo "None found"

echo "Files mentioning 'testDatabase':"
find . -name "*.js" -not -path "./node_modules/*" -not -path "./$BACKUP_DIR/*" -exec grep -l "testDatabase" {} \; 2>/dev/null | head -5 || echo "None found"

echo "Files mentioning problematic ports (8081, 3001, 5173):"
find . -name "*.js" -not -path "./node_modules/*" -not -path "./$BACKUP_DIR/*" -exec grep -l -E "(8081|3001|5173)" {} \; 2>/dev/null | head -5 || echo "None found"

echo "Files mentioning 'NODE_ENV.*test':"
find . -name "*.js" -not -path "./node_modules/*" -not -path "./$BACKUP_DIR/*" -exec grep -l "NODE_ENV.*test" {} \; 2>/dev/null | head -5 || echo "None found"

# ========================================
# 5. VERIFY PRODUCTION CONFIGURATION
# ========================================
echo ""
echo "✅ VERIFYING PRODUCTION CONFIGURATION..."

echo "Current server .env file:"
if [ -f "server/.env" ]; then
    echo "NODE_ENV: $(grep NODE_ENV server/.env || echo 'not set')"
    echo "DATABASE_NAME: $(grep DATABASE_NAME server/.env || echo 'not set')"
    echo "PORT: $(grep '^PORT=' server/.env || echo 'not set')"
else
    echo "❌ server/.env not found!"
fi

echo ""
echo "🎯 CLEANUP COMPLETE!"
echo "==================="
echo "✅ All E2E testing files removed and backed up"
echo "✅ Test environment overrides eliminated"
echo "✅ Jest configurations removed"
echo "✅ Database test configurations removed"
echo ""
echo "📁 All removed files backed up to: $BACKUP_DIR"
echo ""
echo "🚀 NEXT STEPS:"
echo "1. Check scan results above for any remaining references"
echo "2. Restart your server: cd server && npm run dev"
echo "3. Test API: curl http://localhost:8080/api/products/1"
echo "4. Expected: Should return '150g 11.5H x 8W' description"
echo ""
echo "🔧 If still having issues:"
echo "- Check shell environment: env | grep -E '(DATABASE|NODE_ENV)'"
echo "- Restart terminal completely"
echo "- Clear any global NODE_ENV: unset NODE_ENV"