// server/controllers/product.controller.js

import { readFileSync } from "fs";
import {
  NotFoundError,
  InternalServerError,
} from "../middleware/errors/CustomErrors.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// Load products data with error handling
let products = [];
try {
  const productsData = readFileSync(
    new URL("../data/data.json", import.meta.url),
    "utf-8"
  );
  products = JSON.parse(productsData);

  // Validate products data structure
  if (!Array.isArray(products)) {
    throw new Error("Products data must be an array");
  }

  // Validate each product has required fields
  products.forEach((product, index) => {
    const requiredFields = ["id", "title", "price", "description"];
    for (const field of requiredFields) {
      if (!product[field]) {
        throw new Error(
          `Product at index ${index} is missing required field: ${field}`
        );
      }
    }

    // Ensure price is a number
    if (typeof product.price !== "number" || product.price <= 0) {
      throw new Error(
        `Product at index ${index} has invalid price: ${product.price}`
      );
    }

    // Ensure id is a number
    if (typeof product.id !== "number" || product.id <= 0) {
      throw new Error(
        `Product at index ${index} has invalid id: ${product.id}`
      );
    }
  });

  console.log(`✅ Loaded ${products.length} products successfully`);
} catch (error) {
  console.error("❌ Failed to load products data:", error.message);
  // In production, you might want to exit the process or use default data
  products = [];
}

// Helper function to filter and sort products
const processProductsQuery = (productsArray, query) => {
  let filteredProducts = [...productsArray];

  // Search functionality
  if (query.q) {
    const searchTerm = query.q.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        (product.category &&
          product.category.toLowerCase().includes(searchTerm))
    );
  }

  // Category filter
  if (query.category) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.category &&
        product.category.toLowerCase() === query.category.toLowerCase()
    );
  }

  // Price range filter
  if (query.minPrice) {
    const minPrice = parseFloat(query.minPrice);
    filteredProducts = filteredProducts.filter(
      (product) => product.price >= minPrice
    );
  }

  if (query.maxPrice) {
    const maxPrice = parseFloat(query.maxPrice);
    filteredProducts = filteredProducts.filter(
      (product) => product.price <= maxPrice
    );
  }

  // Sorting
  if (query.sortBy) {
    filteredProducts.sort((a, b) => {
      switch (query.sortBy) {
        case "price":
          return query.sortOrder === "desc"
            ? b.price - a.price
            : a.price - b.price;
        case "name":
          return query.sortOrder === "desc"
            ? b.title.localeCompare(a.title)
            : a.title.localeCompare(b.title);
        case "created":
          // Assuming you add createdAt field later
          const aDate = new Date(a.createdAt || 0);
          const bDate = new Date(b.createdAt || 0);
          return query.sortOrder === "desc" ? bDate - aDate : aDate - bDate;
        default:
          return 0;
      }
    });
  }

  return filteredProducts;
};

// GET /api/products - Get all products with optional filtering and pagination
export const getAllProducts = asyncHandler(async (req, res) => {
  try {
    // Process query parameters (already validated by middleware)
    const filteredProducts = processProductsQuery(products, req.query);

    // Pagination
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Calculate pagination info
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = endIndex < totalProducts;
    const hasPrevPage = startIndex > 0;

    // Response with metadata
    const response = {
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNextPage,
          hasPrevPage,
          limit,
        },
        filters: {
          search: req.query.q || null,
          category: req.query.category || null,
          priceRange: {
            min: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
            max: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
          },
          sortBy: req.query.sortBy || null,
          sortOrder: req.query.sortOrder || "asc",
        },
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    throw new InternalServerError("Failed to retrieve products");
  }
});

// GET /api/products/:id - Get product by ID
export const getProductById = asyncHandler(async (req, res) => {
  try {
    // ID is already validated and parsed by middleware
    const productId = req.params.id;

    const product = products.find((p) => p.id === productId);

    if (!product) {
      throw new NotFoundError("Product");
    }

    // Add related products (simple recommendation based on category or price range)
    const relatedProducts = products
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.category === product.category ||
            Math.abs(p.price - product.price) <= product.price * 0.3)
      )
      .slice(0, 4); // Limit to 4 related products

    const response = {
      success: true,
      data: {
        product,
        relatedProducts,
        availability: {
          inStock: true, // This would come from inventory system
          stockLevel: Math.floor(Math.random() * 50) + 1, // Mock stock level
          estimatedDelivery: "3-5 business days",
        },
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError("Failed to retrieve product");
  }
});

// GET /api/products/categories - Get all product categories
export const getProductCategories = asyncHandler(async (req, res) => {
  try {
    const categories = [
      ...new Set(
        products
          .filter((product) => product.category)
          .map((product) => product.category)
      ),
    ];

    const categoriesWithCounts = categories.map((category) => ({
      name: category,
      count: products.filter((product) => product.category === category).length,
      priceRange: {
        min: Math.min(
          ...products.filter((p) => p.category === category).map((p) => p.price)
        ),
        max: Math.max(
          ...products.filter((p) => p.category === category).map((p) => p.price)
        ),
      },
    }));

    const response = {
      success: true,
      data: {
        categories: categoriesWithCounts,
        totalCategories: categories.length,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    throw new InternalServerError("Failed to retrieve categories");
  }
});

// GET /api/products/search/suggestions - Get search suggestions
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: { suggestions: [] },
        timestamp: new Date().toISOString(),
      });
    }

    const searchTerm = q.toLowerCase();
    const suggestions = new Set();

    products.forEach((product) => {
      // Add matching titles
      if (product.title.toLowerCase().includes(searchTerm)) {
        suggestions.add(product.title);
      }

      // Add matching categories
      if (
        product.category &&
        product.category.toLowerCase().includes(searchTerm)
      ) {
        suggestions.add(product.category);
      }

      // Add matching words from description
      const words = product.description.toLowerCase().split(" ");
      words.forEach((word) => {
        if (word.includes(searchTerm) && word.length > 3) {
          suggestions.add(word);
        }
      });
    });

    const response = {
      success: true,
      data: {
        suggestions: Array.from(suggestions).slice(0, 10), // Limit to 10 suggestions
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    throw new InternalServerError("Failed to retrieve search suggestions");
  }
});

// Health check endpoint for products service
export const healthCheck = asyncHandler(async (req, res) => {
  const response = {
    success: true,
    data: {
      status: "healthy",
      productsLoaded: products.length,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    },
  };

  res.status(200).json(response);
});
