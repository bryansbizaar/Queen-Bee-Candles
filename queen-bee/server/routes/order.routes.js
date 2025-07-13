// server/routes/order.routes.js
import express from "express";
import OrderController from "../controllers/order.controller.js";

const router = express.Router();

// Create a new order (typically called after successful Stripe payment)
router.post("/", OrderController.createOrder);

// Get order by ID
router.get("/:id", OrderController.getOrderById);

// Get orders by customer email
router.get("/customer/:email", OrderController.getCustomerOrders);

// Update order status (admin function)
router.patch("/:id/status", OrderController.updateOrderStatus);

// Get order by payment intent ID (to prevent duplicates)
router.get(
  "/payment-intent/:paymentIntentId",
  OrderController.getOrderByPaymentIntent
);

// Admin routes
router.get("/", OrderController.getAllOrders); // Get all orders with pagination
router.get("/admin/stats", OrderController.getOrderStats); // Get order statistics

export default router;
