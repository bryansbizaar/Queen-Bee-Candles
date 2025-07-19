#!/bin/bash

# SURGICAL E2E CLEANUP - PRESERVE PHASE 2 CLIENT TESTS
# Only removes E2E and server testing artifacts, keeps legitimate client tests

echo "🧹 SURGICAL E2E TESTING CLEANUP"
echo "==============================="
echo "📍 Current directory: $(pwd)"
echo "⚠️  PRESERVING Phase 2 client tests (Vitest)"

# Create backup directory
BACKUP_DIR="../queen-bee-testing-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Created backup directory: $BACKUP_DIR"

echo ""
echo "🗑️  REMOVING ONLY E2E AND SERVER TEST ARTIFACTS..."

# ========================================
# 1. CLIENT-SIDE CLEANUP (E2E ONLY)
# ========================================
echo ""
echo "📱 CLIENT-SIDE E2E CLEANUP (preserving Vitest tests):"

if [ -d "client" ]; then
    cd client
    
    # Remove ONLY E2E directory (preserve src/**/*.test.jsx files)
    if [ -d "e2e" ]; then
        cp -r "e2e" "$BACKUP_DIR/"
        rm -rf "e2e"
        echo "✅ Removed: client/e2e/ directory (E2E tests)"
    else
        echo "ℹ️  No e2e directory found (already clean)"
    fi

    # Remove Playwright config (preserve vitest.config.js)
    if [ -f "playwright.config.js" ]; then
        cp "playwright.config.js" "$BACKUP_DIR/"
        rm "playwright.config.js"
        echo "✅ Removed: client/playwright.config.js"
    else
        echo "ℹ️  No playwright.config.js found"
    fi

    # Remove Playwright test results and reports
    for dir in playwright-report test-results; do
        if [ -d "$dir" ]; then
            rm -rf "$dir"
            echo "✅ Removed: client/$dir/"
        fi
    done

    # Remove debug screenshots from Playwright
    if ls *.png 1> /dev/null 2>&1; then
        mv *.png "$BACKUP_DIR/" 2>/dev/null
        echo "✅ Moved debug screenshots to backup"
    fi

    # Check what tests we're preserving
    echo ""
    echo "✅ PRESERVING these legitimate Phase 2 tests:"
    find . -name "*.test.jsx" -o -name "*.test.js" | grep -v node_modules | head -10 || echo "No test files found to preserve"
    
    cd ..
else
    echo "❌ Client directory not found!"
fi

# ========================================
# 2. SERVER-SIDE CLEANUP (ALL SERVER TESTS)
# ========================================
echo ""
echo "🖥️  SERVER-SIDE CLEANUP (removing ALL server tests):"

if [ -d "server" ]; then
    cd server

    # Remove Jest configuration files (these are interfering)
    for file in jest.config.js jest.config.simple.js; do
        if [ -f "$file" ]; then
            cp "$file" "$BACKUP_DIR/"
            rm "$file"
            echo "✅ Removed: server/$file"
        fi
    done

    # Remove server test environment files (these override production)
    for file in .env.test .env.test.example; do
        if [ -f "$file" ]; then
            cp "$file" "$BACKUP_DIR/"
            rm "$file"
            echo "✅ Removed: server/$file"
        fi
    done

    # THE KEY PART: Remove server tests directory (includes testDatabase.js and env.js)
    if [ -d "tests" ]; then
        cp -r "tests" "$BACKUP_DIR/"
        rm -rf "tests"
        echo "✅ Removed: server/tests/ directory (including problematic testDatabase.js and env.js)"
        echo "   This removes the environment variable overrides causing your issue!"
    else
        echo "ℹ️  No server tests directory found"
    fi

    # Remove test database scripts
    for file in test-db-setup.sh test-db.js; do
        if [ -f "$file" ]; then
            cp "$file" "$BACKUP_DIR/"
            rm "$file"
            echo "✅ Removed: server/$file"
        fi
    done

    # Remove diagnostic scripts we created during troubleshooting
    for file in debug-connection.js inspect-database.js test-productservice.js fix-production-db.js; do
        if [ -f "$file" ]; then
            cp "$file" "$BACKUP_DIR/" 2>/dev/null
            rm "$file" 2>/dev/null
            echo "✅ Removed: server/$file"
        fi
    done

    cd ..
else
    echo "❌ Server directory not found!"
fi

# ========================================
# 3. ROOT LEVEL CLEANUP
# ========================================
echo ""
echo "🏠 ROOT LEVEL CLEANUP:"

# Remove root level diagnostic files we created
for file in fix-database.js check-database.js debug-database.js server-db-diagnostic.js; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/" 2>/dev/null
        rm "$file" 2>/dev/null
        echo "✅ Removed: $file"
    fi
done

# ========================================
# 4. VERIFY WHAT'S PRESERVED
# ========================================
echo ""
echo "✅ VERIFYING PRESERVED TESTS:"

echo "Phase 2 client tests still intact:"
find client -name "*.test.jsx" -o -name "*.test.js" | grep -v node_modules | head -5 || echo "No client tests found"

echo "Client vitest.config.js preserved:"
if [ -f "client/vitest.config.js" ]; then
    echo "✅ client/vitest.config.js still exists"
else
    echo "ℹ️  No vitest.config.js found"
fi

# ========================================
# 5. SCAN FOR REMAINING PROBLEMATIC REFERENCES
# ========================================
echo ""
echo "🔍 SCANNING FOR REMAINING PROBLEMATIC REFERENCES..."

echo "Files still mentioning 'testDatabase' (should be none):"
find . -name "*.js" -not -path "./node_modules/*" -not -path "./$BACKUP_DIR/*" -exec grep -l "testDatabase" {} \; 2>/dev/null | head -3 || echo "✅ None found"

echo "Files still mentioning 'queen_bee_test' (should be none):"
find . -name "*.js" -not -path "./node_modules/*" -not -path "./$BACKUP_DIR/*" -exec grep -l "queen_bee_test" {} \; 2>/dev/null | head -3 || echo "✅ None found"

echo "Files still mentioning 'NODE_ENV.*test' (should be none):"
find . -name "*.js" -not -path "./node_modules/*" -not -path "./$BACKUP_DIR/*" -exec grep -l "NODE_ENV.*test" {} \; 2>/dev/null | head -3 || echo "✅ None found"

# ========================================
# 6. VERIFY PRODUCTION CONFIGURATION
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
echo "🎯 SURGICAL CLEANUP COMPLETE!"
echo "============================="
echo "✅ E2E testing artifacts removed"
echo "✅ Server test environment overrides eliminated"  
echo "✅ Phase 2 client tests preserved"
echo "✅ Problematic testDatabase.js and env.js removed"
echo ""
echo "📁 All removed files backed up to: $BACKUP_DIR"
echo ""
echo "🚀 NEXT STEPS:"
echo "1. Your Phase 2 client tests should still work: cd client && npm test"
echo "2. Restart your server: cd server && npm run dev"
echo "3. Test API: curl http://localhost:8080/api/products/1"
echo "4. Expected: Should return '150g 11.5H x 8W' description"
echo ""
echo "💡 The key fix: Removed server/tests/setup/env.js that was overriding your environment!"