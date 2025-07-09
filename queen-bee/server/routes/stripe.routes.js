import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/stripe/create-payment-intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, orderId, customerEmail, cartItems } = req.body;

    // Validation
    if (!amount || !orderId || !customerEmail || !cartItems || cartItems.length === 0) {
      return res.status(400).json({
        error: "Missing required fields: amount, orderId, customerEmail, cartItems"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        error: "Invalid email format"
      });
    }

    // Validate amount (convert to cents for Stripe)
    const amountInCents = Math.round(parseFloat(amount) * 100);
    if (amountInCents < 50) { // Minimum 50 cents
      return res.status(400).json({
        error: "Amount must be at least $0.50 NZD"
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "nzd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: orderId,
        customerEmail: customerEmail,
        cartItems: JSON.stringify(cartItems)
      },
      description: `Queen Bee Candles Order ${orderId}`,
      receipt_email: customerEmail,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      error: "Failed to create payment intent",
      details: error.message
    });
  }
});

// GET /api/stripe/payment-intent/:paymentIntentId
router.get("/payment-intent/:paymentIntentId", async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return res.status(400).json({
        error: "Payment intent ID is required"
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      metadata: paymentIntent.metadata
    });

  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    res.status(500).json({
      error: "Failed to retrieve payment intent",
      details: error.message
    });
  }
});

export default router;