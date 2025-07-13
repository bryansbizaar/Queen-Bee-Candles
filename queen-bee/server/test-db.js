// Simple database connection test
import { query, closePool } from "./config/database.js";

async function testDatabaseConnection() {
  try {
    console.log("🔍 Testing database connection...");

    // Test basic connection
    const result = await query("SELECT NOW() as current_time");
    console.log("⏰ Database time:", result.rows[0].current_time);

    // Test products table
    const productsResult = await query(
      "SELECT COUNT(*) as product_count FROM products"
    );
    console.log(
      "📦 Products in database:",
      productsResult.rows[0].product_count
    );

    // Test sample product data
    const sampleProduct = await query(
      "SELECT title, price FROM products LIMIT 1"
    );
    console.log("🕯️  Sample product:", sampleProduct.rows[0]);

    console.log("✅ Database connection test successful!");
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
  } finally {
    // Close the connection pool
    await closePool();
    console.log("👋 Database connection closed");
    process.exit(0);
  }
}

// Run the test
testDatabaseConnection();
