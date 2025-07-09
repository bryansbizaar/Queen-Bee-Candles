import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import useCart from "../context/useCart";
import formatAmount from "../utils/formatAmount";

const StripeCheckout = ({ clientSecret, orderId, customerEmail, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCart();
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
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
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
        sessionStorage.setItem("paymentSuccess", JSON.stringify({
          orderId,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert back from cents
          currency: paymentIntent.currency,
          customerEmail,
          timestamp: new Date().toISOString()
        }));

        // Clear cart
        clearCart();

        // Navigate to success page
        navigate("/payment/success");
      } else {
        setError("Payment was not successful. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Payment error:", err);
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
        fontFamily: "system-ui, -apple-system, sans-serif",
      },
      invalid: {
        color: "#9e2146",
      },
    },
    hidePostalCode: true, // Hide postal code field since NZ validation is problematic
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem" }}>
      <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        Complete Your Payment
      </h2>
      
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: "1rem", 
        borderRadius: "0.5rem",
        marginBottom: "2rem"
      }}>
        <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>Order Summary</h3>
        <p style={{ margin: "0.25rem 0", color: "#6b7280" }}>
          Order ID: <strong>{orderId}</strong>
        </p>
        <p style={{ margin: "0.25rem 0", color: "#6b7280" }}>
          Email: <strong>{customerEmail}</strong>
        </p>
        <p style={{ margin: "0.25rem 0", fontSize: "1.2rem", fontWeight: "bold" }}>
          Total: {formatAmount(amount)} NZD
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "0.5rem", 
            fontWeight: "bold",
            color: "#374151"
          }}>
            Card Details
          </label>
          <div style={{
            padding: "1rem",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            backgroundColor: "white"
          }}>
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {error && (
          <div style={{
            color: "#dc2626",
            backgroundColor: "#fef2f2",
            padding: "0.75rem",
            borderRadius: "0.375rem",
            marginBottom: "1rem",
            border: "1px solid #fecaca"
          }}>
            {error}
          </div>
        )}

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
            marginBottom: "1rem"
          }}
        >
          {processing ? "Processing..." : `Pay ${formatAmount(amount)} NZD`}
        </button>

        <div style={{ 
          textAlign: "center", 
          fontSize: "0.875rem", 
          color: "#6b7280",
          marginTop: "1rem"
        }}>
          <p>🔒 Your payment is secured by Stripe</p>
          <p>This is a test payment using Stripe test mode</p>
        </div>
      </form>
    </div>
  );
};

export default StripeCheckout;