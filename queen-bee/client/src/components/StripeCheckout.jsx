import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import useCart from "../context/useCart";
import formatAmount from "../utils/formatAmount";
import PropTypes from "prop-types";

const StripeCheckout = ({ clientSecret, orderId, customerEmail, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart, cartItems } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = async (paymentIntentId) => {
    try {
      console.log("Creating order for payment intent:", paymentIntentId);

      const response = await fetch(
        "http://localhost:8080/api/stripe/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentIntentId,
            customerEmail,
            cartItems: cartItems.map((item) => ({
              id: item.id,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
            })),
            customerName: null, // Could be collected from a form field later
            shippingAddress: {
              line1: "Address to be provided",
              city: "Whangarei",
              state: "Northland",
              postal_code: "",
              country: "NZ",
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to create order");
      }

      console.log("Order created successfully:", data);
      return data.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Step 1: Confirm the payment with Stripe
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: customerEmail,
              address: {
                country: "NZ",
              },
            },
          },
        });

      if (confirmError) {
        console.error("Stripe confirmation error:", confirmError);
        setError(confirmError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        console.log("Payment succeeded, creating order...");

        try {
          // Step 2: Create order in our database
          const orderData = await createOrder(paymentIntent.id);

          // Step 3: Store success data for the success page
          sessionStorage.setItem(
            "paymentSuccess",
            JSON.stringify({
              orderId: orderData.orderId,
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount / 100, // Convert back from cents
              currency: paymentIntent.currency,
              customerEmail,
              timestamp: new Date().toISOString(),
              orderStatus: orderData.status,
              itemCount: orderData.itemCount,
            })
          );

          // Step 4: Clear cart and navigate to success page
          clearCart();
          navigate("/payment/success");
        } catch (orderError) {
          console.error("Order creation failed:", orderError);

          // Payment succeeded but order creation failed
          // Store partial success data and show a different message
          sessionStorage.setItem(
            "paymentSuccess",
            JSON.stringify({
              orderId: orderId, // Use the original order ID
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              customerEmail,
              timestamp: new Date().toISOString(),
              orderStatus: "payment_succeeded_order_pending",
              error:
                "Order creation pending - please contact support with your payment ID",
            })
          );

          clearCart();
          navigate("/payment/success");
        }
      } else {
        setError("Payment was not successful. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h3 style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        Complete Your Payment
      </h3>

      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "1rem",
          borderRadius: "0.5rem",
          marginBottom: "1.5rem",
          border: "1px solid #e9ecef",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
          Order Summary
        </h4>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.25rem",
          }}
        >
          <span>Order ID:</span>
          <span style={{ fontWeight: "bold" }}>{orderId}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.25rem",
          }}
        >
          <span>Email:</span>
          <span>{customerEmail}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #dee2e6",
            paddingTop: "0.5rem",
            marginTop: "0.5rem",
          }}
        >
          <span style={{ fontWeight: "bold" }}>Total:</span>
          <span style={{ fontWeight: "bold" }}>{formatAmount(amount)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            padding: "1rem",
            marginBottom: "1rem",
            backgroundColor: "#ffffff",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "#374151",
            }}
          >
            Card Details
          </label>
          <CardElement options={cardElementOptions} />
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "0.375rem",
              padding: "0.75rem",
              marginBottom: "1rem",
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || processing}
          style={{
            width: "100%",
            backgroundColor: processing ? "#9ca3af" : "#10b981",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            padding: "0.75rem",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: processing ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
          }}
        >
          {processing ? "Processing..." : `Pay ${formatAmount(amount)}`}
        </button>
      </form>

      <div
        style={{
          marginTop: "1rem",
          padding: "0.75rem",
          backgroundColor: "#f0f9ff",
          border: "1px solid #bfdbfe",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          color: "#1e40af",
        }}
      >
        <p style={{ margin: "0" }}>
          🔒 Your payment is secured by Stripe. Your card details are never
          stored on our servers.
        </p>
      </div>
    </div>
  );
};

StripeCheckout.propTypes = {
  clientSecret: PropTypes.string.isRequired,
  orderId: PropTypes.string.isRequired,
  customerEmail: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
};

export default StripeCheckout;
