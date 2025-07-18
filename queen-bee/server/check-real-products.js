// Quick script to check actual database products
import { query } from "./config/database.js";

async function checkActualProducts() {
  try {
    console.log('🔍 Checking actual products in database...');
    
    const result = await query(
      "SELECT id, title, price, image, category, stock_quantity FROM products WHERE is_active = true ORDER BY id"
    );
    
    console.log(`\n📦 Found ${result.rows.length} products in database:`);
    console.log('==========================================');
    
    result.rows.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Price: $${product.price}`);
      console.log(`   Image: ${product.image}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Stock: ${product.stock_quantity}`);
      console.log('');
    });
    
    console.log('✅ Test data should match these exact product names and details');
    
    // Generate the correct test data format
    console.log('\n🎯 Correct test data format:');
    console.log('const testData = {');
    console.log('  "products": [');
    
    result.rows.forEach((product, index) => {
      const isLast = index === result.rows.length - 1;
      console.log(`    {`);
      console.log(`      "id": ${product.id},`);
      console.log(`      "name": "${product.title}",`);
      console.log(`      "price": ${product.price},`);
      console.log(`      "image": "${product.image}",`);
      console.log(`      "category": "${product.category}",`);
      console.log(`      "stock": ${product.stock_quantity}`);
      console.log(`    }${isLast ? '' : ','}`);
    });
    
    console.log('  ]');
    console.log('};');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    process.exit(0);
  }
}

checkActualProducts();
