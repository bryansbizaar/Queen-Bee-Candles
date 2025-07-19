/**
 * Direct test of ProductService - bypass API and test the service directly
 */

import { ProductService } from './services/productService.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function testProductServiceDirectly() {
  console.log('🔍 TESTING PRODUCTSERVICE DIRECTLY');
  console.log('===================================\n');
  
  try {
    console.log('📋 Environment check:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   DATABASE_NAME: ${process.env.DATABASE_NAME}\n`);
    
    // Test getAllProducts
    console.log('🔍 Testing ProductService.getAllProducts()...');
    const allProducts = await ProductService.getAllProducts();
    
    console.log(`📦 ProductService returned ${allProducts.length} products:\n`);
    
    allProducts.forEach(product => {
      console.log(`📦 Product ${product.id}:`);
      console.log(`   Title: ${product.title}`);
      console.log(`   Description: "${product.description}"`);
      console.log(`   Price: $${(product.price / 100).toFixed(2)}`);
      console.log(`   Stock: ${product.stock_quantity}\n`);
    });
    
    // Test getProductById specifically for Dragon
    console.log('🔍 Testing ProductService.getProductById(1) for Dragon...');
    const dragon = await ProductService.getProductById(1);
    
    if (dragon) {
      console.log('🐉 Dragon product from ProductService:');
      console.log(`   Title: ${dragon.title}`);
      console.log(`   Description: "${dragon.description}"`);
      console.log(`   Price: $${(dragon.price / 100).toFixed(2)}`);
      
      if (dragon.description === "150g 11.5H x 8W") {
        console.log('\n✅ SUCCESS: ProductService returns correct database data!');
        console.log('   The issue must be in the API layer (controller/routes)');
      } else if (dragon.description.includes('Majestic dragon')) {
        console.log('\n❌ PROBLEM: ProductService returns test data!');
        console.log('   The ProductService itself is compromised');
      } else {
        console.log('\n⚠️  UNEXPECTED: ProductService returns different data');
      }
    } else {
      console.log('❌ No Dragon product found');
    }
    
  } catch (error) {
    console.error('❌ Error testing ProductService:', error.message);
  }
  
  process.exit(0);
}

testProductServiceDirectly();