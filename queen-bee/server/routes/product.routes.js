import express from "express";
import { ProductService } from "../services/productService.js";

const router = express.Router();

// GET /api/products - Get all products
router.get("/", async (req, res) => {
  try {
    const products = await ProductService.getAllProducts();

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
      message: error.message,
    });
  }
});

// GET /api/products/:id - Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
    }

    const product = await ProductService.getProductById(parseInt(id));

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
      message: error.message,
    });
  }
});

// GET /api/products/category/:category - Get products by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;

    // Basic category validation
    if (!category || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid category",
      });
    }

    const products = await ProductService.getProductsByCategory(
      category.toLowerCase()
    );

    res.json({
      success: true,
      data: products,
      count: products.length,
      category: category,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products by category",
      message: error.message,
    });
  }
});

// POST /api/products - Create new product (for future admin functionality)
router.post("/", async (req, res) => {
  try {
    const { title, description, price, image, category, stock_quantity } =
      req.body;

    // Basic validation
    if (!title || !price) {
      return res.status(400).json({
        success: false,
        error: "Title and price are required",
      });
    }

    if (isNaN(price) || parseInt(price) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Price must be a positive number",
      });
    }

    const productData = {
      title: title.trim(),
      description: description?.trim() || "",
      price: parseInt(price),
      image: image?.trim() || "",
      category: category?.trim() || "candles",
      stock_quantity: parseInt(stock_quantity) || 0,
    };

    const newProduct = await ProductService.createProduct(productData);

    res.status(201).json({
      success: true,
      data: newProduct,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create product",
      message: error.message,
    });
  }
});

// PUT /api/products/:id/stock - Update product stock
router.put("/:id/stock", async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity } = req.body;

    // Validation
    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
    }

    if (isNaN(stock_quantity) || parseInt(stock_quantity) < 0) {
      return res.status(400).json({
        success: false,
        error: "Stock quantity must be a non-negative number",
      });
    }

    const updatedProduct = await ProductService.updateStock(
      parseInt(id),
      parseInt(stock_quantity)
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.json({
      success: true,
      data: updatedProduct,
      message: "Stock updated successfully",
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update stock",
      message: error.message,
    });
  }
});

export default router;
