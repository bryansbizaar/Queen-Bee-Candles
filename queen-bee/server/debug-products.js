// Quick API test to see actual products vs test expectations
const testData = {
  "products": [
    {
      "id": 1,
      "name": "Lavender Dreams",
      "price": 24.99,
      "description": "Handcrafted beeswax candle infused with pure lavender essential oil",
      "image": "/images/lavender-dreams.jpg",
      "category": "Essential Oils",
      "stock": 15
    },
    {
      "id": 2,
      "name": "Vanilla Bean Bliss",
      "price": 22.99,
      "description": "Rich vanilla scented beeswax candle for cozy evenings",
      "image": "/images/vanilla-bean-bliss.jpg",
      "category": "Seasonal",
      "stock": 8
    },
    {
      "id": 3,
      "name": "Eucalyptus Fresh",
      "price": 26.99,
      "description": "Invigorating eucalyptus beeswax candle for mental clarity",
      "image": "/images/eucalyptus-fresh.jpg",
      "category": "Essential Oils",
      "stock": 12
    }
  ]
};

async function checkApiVsTestData() {
  try {
    console.log("🔍 Checking API products vs test data...");
    
    const response = await fetch("http://localhost:8080/api/products");
    const apiData = await response.json();
    
    console.log("\n📦 API Response Structure:");
    console.log(JSON.stringify(apiData, null, 2));
    
    console.log("\n🧪 Test Data Expects:");
    console.log(`- ${testData.products.length} products`);
    testData.products.forEach(product => {
      console.log(`  - "${product.name}" ($${product.price})`);
    });
    
    // Extract actual products from API response
    let actualProducts = [];
    if (Array.isArray(apiData)) {
      actualProducts = apiData;
    } else if (apiData.data && Array.isArray(apiData.data)) {
      actualProducts = apiData.data;
    } else if (apiData.success && apiData.data && Array.isArray(apiData.data.products)) {
      actualProducts = apiData.data.products;
    }
    
    console.log("\n🌐 API Actually Returns:");
    console.log(`- ${actualProducts.length} products`);
    actualProducts.forEach(product => {
      console.log(`  - "${product.title || product.name}" ($${product.price})`);
    });
    
    console.log("\n⚠️  Mismatches:");
    if (actualProducts.length !== testData.products.length) {
      console.log(`❌ Count mismatch: Expected ${testData.products.length}, got ${actualProducts.length}`);
    }
    
    const expectedNames = testData.products.map(p => p.name);
    const actualNames = actualProducts.map(p => p.title || p.name);
    
    expectedNames.forEach(name => {
      if (!actualNames.includes(name)) {
        console.log(`❌ Missing product: "${name}"`);
      }
    });
    
    actualNames.forEach(name => {
      if (!expectedNames.includes(name)) {
        console.log(`➕ Extra product: "${name}"`);
      }
    });
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkApiVsTestData();
