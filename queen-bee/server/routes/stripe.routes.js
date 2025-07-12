// server/routes/stripe.routes.js

import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { validateRequest, validationRules } from "../middleware/validation.js";
import { rateLimit } from "../middleware/security.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  BadRequestError,
  InternalServerError,
} from "../middleware/errors/CustomErrors.js";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Validation rule for payment intent ID
const paymentIntentIdValidation = (req) => {
  const { paymentIntentId } = req.params;

  if (!paymentIntentId) {
    return "Payment intent ID is required";
  }

  if (
    typeof paymentIntentId !== "string" ||
    !paymentIntentId.startsWith("pi_")
  ) {
    return "Invalid payment intent ID format";
  }

  return null;
};

// POST /api/stripe/create-payment-intent
router.post(
  "/create-payment-intent",
  rateLimit("payment", "Too many payment attempts. Please try again later."),
  validateRequest([validationRules.stripePayment]),
  asyncHandler(async (req, res) => {
    try {
      const { amount, orderId, customerEmail, cartItems } = req.body;

      // Convert amount to cents for Stripe
      const amountInCents = Math.round(parseFloat(amount) * 100);

      // Create payment intent with enhanced metadata
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "nzd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          orderId: orderId,
          customerEmail: customerEmail,
          cartItems: JSON.stringify(cartItems),
          itemCount: cartItems.length.toString(),
          totalItems: cartItems
            .reduce((sum, item) => sum + item.quantity, 0)
            .toString(),
          requestId: req.id || "unknown",
        },
        description: `Queen Bee Candles Order ${orderId}`,
        receipt_email: customerEmail,
        statement_descriptor: "Queen Bee Candles",
        // Add shipping information if available
        ...(req.body.shipping && {
          shipping: {
            name: req.body.shipping.name,
            address: {
              line1: req.body.shipping.address.line1,
              line2: req.body.shipping.address.line2,
              city: req.body.shipping.address.city,
              postal_code: req.body.shipping.address.postal_code,
              country: req.body.shipping.address.country || "NZ",
            },
          },
        }),
      });

      const response = {
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Stripe payment intent creation error:", error);

      if (error.type === "StripeInvalidRequestError") {
        throw new BadRequestError(`Payment setup failed: ${error.message}`);
      }

      throw new InternalServerError("Failed to create payment intent");
    }
  })
);

// GET /api/stripe/payment-intent/:paymentIntentId
router.get(
  "/payment-intent/:paymentIntentId",
  rateLimit("api"),
  validateRequest([paymentIntentIdValidation]),
  asyncHandler(async (req, res) => {
    try {
      const { paymentIntentId } = req.params;

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId,
        {
          expand: ["charges"],
        }
      );

      const response = {
        success: true,
        data: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          created: paymentIntent.created,
          metadata: paymentIntent.metadata,
          lastPaymentError: paymentIntent.last_payment_error
            ? {
                type: paymentIntent.last_payment_error.type,
                code: paymentIntent.last_payment_error.code,
                message: paymentIntent.last_payment_error.message,
              }
            : null,
          charges: paymentIntent.charges.data.map((charge) => ({
            id: charge.id,
            status: charge.status,
            amount: charge.amount,
            created: charge.created,
            receipt_url: charge.receipt_url,
          })),
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Stripe payment intent retrieval error:", error);

      if (error.type === "StripeInvalidRequestError") {
        throw new BadRequestError(`Payment intent not found: ${error.message}`);
      }

      throw new InternalServerError("Failed to retrieve payment intent");
    }
  })
);

// POST /api/stripe/webhook - Handle Stripe webhooks
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.warn("⚠️ Stripe webhook secret not configured");
      return res.status(400).send("Webhook secret not configured");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`❌ Webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          console.log(`✅ Payment succeeded: ${paymentIntent.id}`);

          // Here you would typically:
          // 1. Update order status in database
          // 2. Send confirmation email
          // 3. Update inventory
          // 4. Log the successful payment

          break;

        case "payment_intent.payment_failed":
          const failedPayment = event.data.object;
          console.log(`❌ Payment failed: ${failedPayment.id}`);

          // Handle failed payment:
          // 1. Log the failure
          // 2. Notify customer
          // 3. Update order status

          break;

        case "charge.dispute.created":
          const dispute = event.data.object;
          console.log(`⚠️ Dispute created: ${dispute.id}`);

          // Handle dispute:
          // 1. Alert administrators
          // 2. Prepare dispute response

          break;

        default:
          console.log(`🔔 Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error(`❌ Error handling webhook event:`, error);
      res.status(500).json({ error: "Webhook handler failed" });
    }
  })
);

export default router;
