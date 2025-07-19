/**
 * Safely inspect current Docker database contents
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
});

async function inspectCurrentDatabase() {
  console.log('🔍 INSPECTING CURRENT DOCKER DATABASE');
  console.log('=====================================\n');
  
  try {
    // Database info
    const dbInfo = await pool.query('SELECT current_database(), version()');
    console.log(`📁 Database: ${dbInfo.rows[0].current_database}`);
    console.log(`🐘 PostgreSQL Version: ${dbInfo.rows[0].version.split(' ').slice(0, 2).join(' ')}\n`);
    
    // Check if products table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Products table does not exist!');
      return;
    }
    
    // Get table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Products table structure:');
    columns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
    });
    
    // Count products
    const count = await pool.query('SELECT COUNT(*) as total FROM products');
    console.log(`\n📦 Total products: ${count.rows[0].total}`);
    
    if (count.rows[0].total > 0) {
      console.log('\n📋 Current products in database:');
      console.log(''.padEnd(80, '='));
      
      const products = await pool.query(`
        SELECT id, title, description, price, category, stock_quantity, is_active, created_at 
        FROM products 
        ORDER BY id
      `);
      
      products.rows.forEach(product => {
        console.log(`\n📦 Product ID: ${product.id}`);
        console.log(`   Title: ${product.title}`);
        console.log(`   Description: "${product.description}"`);
        console.log(`   Price: $${(product.price / 100).toFixed(2)} NZD`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Stock: ${product.stock_quantity}`);
        console.log(`   Active: ${product.is_active}`);
        console.log(`   Created: ${product.created_at}`);
      });
      
      console.log('\n'.padEnd(80, '='));
      
      // Check for test data indicators
      const testDataCheck = await pool.query(`
        SELECT COUNT(*) as test_count 
        FROM products 
        WHERE description LIKE '%Majestic dragon%' 
           OR description LIKE '%hand-crafted with intricate details%'
           OR description LIKE '%pure beeswax, perfect for country decor%'
      `);
      
      if (testDataCheck.rows[0].test_count > 0) {
        console.log('🚨 TEST DATA DETECTED!');
        console.log(`   Found ${testDataCheck.rows[0].test_count} products with test descriptions`);
        console.log('   This explains why your API is returning test data');
      } else {
        console.log('✅ No obvious test data detected');
        console.log('   Descriptions look like production data');
      }
      
    } else {
      console.log('📭 Database is empty - no products found');
    }
    
    // Check other tables
    const allTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`\n🗂️  All tables in database (${allTables.rows.length} total):`);
    allTables.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Check orders if they exist
    const ordersExist = allTables.rows.some(table => table.table_name === 'orders');
    if (ordersExist) {
      const orderCount = await pool.query('SELECT COUNT(*) as total FROM orders');
      console.log(`\n📋 Orders in database: ${orderCount.rows[0].total}`);
    }
    
  } catch (error) {
    console.error('❌ Error inspecting database:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Cannot connect to database. Is Docker running?');
      console.log('   Try: docker-compose up -d');
    } else if (error.code === '3D000') {
      console.log('\n💡 Database does not exist');
    } else if (error.code === '28P01') {
      console.log('\n💡 Authentication failed - check credentials');
    }
  } finally {
    await pool.end();
  }
}

inspectCurrentDatabase();