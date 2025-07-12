// server/routes/product.routes.js

import express from "express";
import {
  getAllProducts,
  getProductById,
  getProductCategories,
  getSearchSuggestions,
  healthCheck,
} from "../controllers/product.controller.js";
import { validateRequest, validationRules } from "../middleware/validation.js";
import { rateLimit } from "../middleware/security.js";

const router = express.Router();

// Health check endpoint
router.get("/health", healthCheck);

// Get all products with optional filtering and pagination
// Rate limit: 1000 requests per 15 minutes for API endpoints
router.get(
  "/",
  rateLimit("api"),
  validateRequest([validationRules.pagination, validationRules.search]),
  getAllProducts
);

// Get search suggestions
router.get(
  "/search/suggestions",
  rateLimit("api"),
  validateRequest([validationRules.search]),
  getSearchSuggestions
);

// Get product categories
router.get("/categories", rateLimit("api"), getProductCategories);

// Get product by ID
// Note: This should be last to avoid conflicts with other routes
router.get(
  "/:id",
  rateLimit("api"),
  validateRequest([validationRules.productId]),
  getProductById
);

export default router;
