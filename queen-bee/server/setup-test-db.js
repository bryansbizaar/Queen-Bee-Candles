// setup-test-db.js - Simple script to setup test database
import { initTestDb, setupSchema, seedTestData, closeTestDb } from './tests/setup/testDatabase.js';

async function setupDatabase() {
  try {
    console.log('🔧 Initializing test database...');
    await initTestDb();
    
    console.log('📋 Setting up database schema...');
    await setupSchema();
    
    console.log('🌱 Seeding test data...');
    await seedTestData();
    
    console.log('✅ Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await closeTestDb();
  }
}

setupDatabase();