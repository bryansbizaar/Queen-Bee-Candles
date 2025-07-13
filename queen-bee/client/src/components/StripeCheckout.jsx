// client/src/components/StripeCheckout.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import useCart from "../context/useCart";
import formatAmount from "../utils/formatAmount";

const StripeCheckout = ({ clientSecret, orderId, customerEmail, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Save cart items to sessionStorage BEFORE processing payment
      // This ensures the PaymentSuccess component can access them to create the order
      sessionStorage.setItem("cartItems", JSON.stringify(cartItems));

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
        // Store payment results in sessionStorage
        sessionStorage.setItem(
          "paymentSuccess",
          JSON.stringify({
            orderId,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100, // Convert back from cents
            currency: paymentIntent.currency,
            customerEmail,
            timestamp: new Date().toISOString(),
          })
        );

        // Clear cart from context (but keep in sessionStorage for order creation)
        clearCart();

        // Navigate to success page
        navigate("/payment/success");
      } else {
        setError("Payment was not successful. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Payment processing error:", err);
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
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h3
        style={{
          marginBottom: "1.5rem",
          textAlign: "center",
          color: "#374151",
        }}
      >
        Complete Your Payment
      </h3>

      {/* Order Summary */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
          }}
        >
          <span style={{ color: "#6b7280" }}>Order ID:</span>
          <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
            {orderId}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
          }}
        >
          <span style={{ color: "#6b7280" }}>Customer:</span>
          <span style={{ fontSize: "0.9rem" }}>{customerEmail}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
          }}
        >
          <span style={{ color: "#6b7280" }}>Items:</span>
          <span>{cartItems.length} item(s)</span>
        </div>
        <hr
          style={{
            margin: "0.75rem 0",
            border: "none",
            borderTop: "1px solid #e5e7eb",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
          }}
        >
          <span>Total:</span>
          <span style={{ color: "#059669", fontSize: "1.1rem" }}>
            {formatAmount(amount)} NZD
          </span>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "0.75rem",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            padding: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <CardElement options={cardElementOptions} />
        </div>

        <button
          type="submit"
          disabled={!stripe || processing}
          style={{
            width: "100%",
            backgroundColor: processing ? "#9ca3af" : "#4f46e5",
            color: "white",
            padding: "1rem",
            border: "none",
            borderRadius: "0.375rem",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: processing ? "not-allowed" : "pointer",
            marginBottom: "1rem",
          }}
        >
          {processing ? "Processing..." : `Pay ${formatAmount(amount)} NZD`}
        </button>

        <div
          style={{
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#6b7280",
            marginTop: "1rem",
          }}
        >
          <p>🔒 Your payment is secured by Stripe</p>
          <p>This is a test payment using Stripe test mode</p>
        </div>
      </form>
    </div>
  );
};

// PropTypes validation
StripeCheckout.propTypes = {
  clientSecret: PropTypes.string.isRequired,
  orderId: PropTypes.string.isRequired,
  customerEmail: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
};

export default StripeCheckout;
