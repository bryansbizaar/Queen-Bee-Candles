/**
 * Update database with correct Queen Bee product data
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

// Your REAL Queen Bee product data
const REAL_QUEEN_BEE_PRODUCTS = [
  {
    id: 1,
    title: 'Dragon',
    description: '150g 11.5H x 8W',
    price: 1500,
    stock_quantity: 12
  },
  {
    id: 2,
    title: 'Corn Cob', 
    description: '160g 15.5H x 4.5W',
    price: 1600,
    stock_quantity: 8
  },
  {
    id: 3,
    title: 'Bee and Flower',
    description: '45g 3H X 6.5W', 
    price: 850,
    stock_quantity: 15
  },
  {
    id: 4,
    title: 'Rose',
    description: '40g 3H X 6.5W',
    price: 800,
    stock_quantity: 20
  }
];

async function updateDatabaseWithRealData() {
  console.log('🔧 UPDATING DATABASE WITH REAL QUEEN BEE DATA');
  console.log('===============================================\n');
  
  try {
    console.log('📦 Current products (BEFORE update):');
    const beforeResult = await pool.query('SELECT id, title, description FROM products ORDER BY id');
    beforeResult.rows.forEach(product => {
      console.log(`   ${product.id}: ${product.title} - "${product.description}"`);
    });
    
    console.log('\n🔄 Updating with correct Queen Bee descriptions...');
    
    // Update each product with the correct description
    for (const product of REAL_QUEEN_BEE_PRODUCTS) {
      await pool.query(
        'UPDATE products SET description = $1, stock_quantity = $2 WHERE id = $3',
        [product.description, product.stock_quantity, product.id]
      );
      console.log(`✅ Updated ${product.title}: "${product.description}"`);
    }
    
    console.log('\n📦 Products (AFTER update):');
    const afterResult = await pool.query('SELECT id, title, description, stock_quantity FROM products ORDER BY id');
    afterResult.rows.forEach(product => {
      console.log(`   ${product.id}: ${product.title} - "${product.description}" (Stock: ${product.stock_quantity})`);
    });
    
    console.log('\n🎉 SUCCESS! Database updated with real Queen Bee data');
    console.log('💡 Your API should now return the correct descriptions');
    console.log('🧪 Test with: curl http://localhost:8080/api/products/1');
    
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
  } finally {
    await pool.end();
  }
}

updateDatabaseWithRealData();