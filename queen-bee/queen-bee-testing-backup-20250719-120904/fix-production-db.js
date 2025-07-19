/**
 * Fix Production Database - Replace test data with real Queen Bee products
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

// Your REAL Queen Bee products (based on what you told me earlier)
const REAL_QUEEN_BEE_PRODUCTS = [
  {
    title: 'Dragon',
    description: '150g 11.5H x 8W', // Your real description
    price: 1500,
    image: 'dragon.jpg',
    category: 'candles',
    stock_quantity: 12
  },
  {
    title: 'Corn Cob',
    description: '160g 15.5H x 4.5W', // Your real description
    price: 1600,
    image: 'corn-cob.jpg',
    category: 'candles',
    stock_quantity: 8
  },
  {
    title: 'Bee and Flower',
    description: '45g 3H X 6.5W', // Your real description
    price: 850,
    image: 'bee-and-flower.jpg',
    category: 'candles',
    stock_quantity: 15
  },
  {
    title: 'Rose',
    description: '40g 3H X 6.5W', // Your real description
    price: 800,
    image: 'rose.jpg',
    category: 'candles',
    stock_quantity: 20
  }
];

async function fixProductionDatabase() {
  console.log('🔧 FIXING PRODUCTION DATABASE');
  console.log('==============================\n');
  
  try {
    console.log('🗑️  Clearing test data from production database...');
    
    // Clear the test data
    await pool.query('DELETE FROM products');
    
    // Reset the ID sequence
    await pool.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');
    
    console.log('✅ Test data cleared');
    
    console.log('\n🍯 Inserting REAL Queen Bee products...');
    
    // Insert your real products
    for (const product of REAL_QUEEN_BEE_PRODUCTS) {
      const result = await pool.query(
        `INSERT INTO products (title, description, price, image, category, stock_quantity, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         RETURNING id, title`,
        [
          product.title,
          product.description,
          product.price,
          product.image,
          product.category,
          product.stock_quantity
        ]
      );
      
      console.log(`✅ Added: ${result.rows[0].title} (ID: ${result.rows[0].id})`);
    }
    
    console.log('\n🎉 SUCCESS! Production database now contains your real products:');
    
    // Verify the fix
    const products = await pool.query('SELECT id, title, description FROM products ORDER BY id');
    products.rows.forEach(product => {
      console.log(`   ${product.id}: ${product.title} - "${product.description}"`);
    });
    
    console.log('\n✅ Your API should now return the correct data!');
    console.log('💡 Test it: http://localhost:8080/api/products/1');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
  } finally {
    await pool.end();
  }
}

fixProductionDatabase();