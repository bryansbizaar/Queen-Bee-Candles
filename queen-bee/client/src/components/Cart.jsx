import { useState } from "react";
import { Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import useCart from "../context/useCart";
import formatAmount from "../utils/formatAmount";
import StripeCheckout from "./StripeCheckout";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [step, setStep] = useState("review"); // "review" or "payment"
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [emailError, setEmailError] = useState("");
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `QBC-${timestamp}-${random}`;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setCustomerEmail(email);
    if (emailError && validateEmail(email)) {
      setEmailError("");
    }
  };

  const handleProceedToPayment = async () => {
    if (!customerEmail) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(customerEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (paymentMethod === "stripe") {
      setLoading(true);
      setError(null);

      try {
        const newOrderId = generateOrderId();
        const total = getCartTotal();

        const response = await fetch(
          "http://localhost:8080/api/stripe/create-payment-intent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: total,
              orderId: newOrderId,
              customerEmail: customerEmail,
              cartItems: cartItems.map((item) => ({
                id: item.id,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
              })),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create payment intent");
        }

        // Handle the consistent wrapped response structure
        if (data.success && data.data && data.data.clientSecret) {
          setClientSecret(data.data.clientSecret);
          setOrderId(newOrderId);
          setStep("payment");
        } else {
          throw new Error("Invalid response: missing clientSecret");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBackToReview = () => {
    setStep("review");
    setClientSecret(null);
    setOrderId(null);
    setError(null);
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link
          to="/"
          style={{
            display: "inline-block",
            marginTop: "1rem",
            color: "#4f46e5",
            textDecoration: "none",
          }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Show payment step
  if (step === "payment" && clientSecret) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
        <button
          onClick={handleBackToReview}
          style={{
            backgroundColor: "#f3f4f6",
            border: "1px solid #d1d5db",
            padding: "0.5rem 1rem",
            borderRadius: "0.25rem",
            cursor: "pointer",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          ← Back to Cart Review
        </button>
        <Elements stripe={stripePromise} options={{ locale: "en" }}>
          <StripeCheckout
            clientSecret={clientSecret}
            orderId={orderId}
            customerEmail={customerEmail}
            amount={getCartTotal()}
          />
        </Elements>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
      <h2
        style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "0.5rem" }}
      >
        Your Cart
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {cartItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              padding: "1rem",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
            }}
          >
            <div style={{ width: "80px" }}>
              <img
                src={`http://localhost:8080/images/${item.image}`}
                alt={item.title}
                style={{ width: "100%", borderRadius: "0.25rem" }}
              />
            </div>

            <div style={{ flex: "1" }}>
              <h3 style={{ margin: "0 0 0.5rem 0" }}>{item.title}</h3>
              <p style={{ margin: "0", color: "#4b5563" }}>
                {formatAmount(item.price)}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f3f4f6",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                  }}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f3f4f6",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                style={{
                  padding: "0.25rem 0.5rem",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.25rem",
                  cursor: "pointer",
                  color: "#4b5563",
                }}
              >
                Remove
              </button>
            </div>

            <div
              style={{
                minWidth: "80px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              {formatAmount(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          borderTop: "2px solid #e5e7eb",
          paddingTop: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "2rem",
            fontSize: "1.25rem",
            fontWeight: "bold",
            justifyContent: "flex-end",
          }}
        >
          <span>Total:</span>
          <span>{formatAmount(getCartTotal())}</span>
        </div>

        {/* Customer Email Input */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label
            htmlFor="customerEmail"
            style={{
              fontWeight: "bold",
              color: "#374151",
              fontSize: "0.95rem",
            }}
          >
            Email Address *
          </label>
          <input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={handleEmailChange}
            placeholder="Enter your email address"
            style={{
              padding: "0.75rem",
              border: emailError ? "1px solid #dc2626" : "1px solid #d1d5db",
              borderRadius: "0.25rem",
              fontSize: "1rem",
              outline: "none",
              backgroundColor: "white",
            }}
            onFocus={() => setEmailError("")}
          />
          {emailError && (
            <span style={{ color: "#dc2626", fontSize: "0.875rem" }}>
              {emailError}
            </span>
          )}
        </div>

        {/* Payment Method Selection */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label
            style={{
              fontWeight: "bold",
              color: "#374151",
              fontSize: "0.95rem",
            }}
          >
            Payment Method *
          </label>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.25rem",
                backgroundColor:
                  paymentMethod === "stripe" ? "#eff6ff" : "white",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === "stripe"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ margin: 0 }}
              />
              <span>💳 Card Payment (Stripe)</span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.25rem",
                backgroundColor:
                  paymentMethod === "account2account" ? "#eff6ff" : "white",
                opacity: 0.6,
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="account2account"
                checked={paymentMethod === "account2account"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ margin: 0 }}
                disabled
              />
              <span>🏦 Account2Account (Coming Soon)</span>
            </label>
          </div>
        </div>

        {error && (
          <div
            style={{
              color: "#dc2626",
              backgroundColor: "#fef2f2",
              padding: "0.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #fecaca",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}
        >
          <Link
            to="/"
            style={{
              color: "#6b7280",
              textDecoration: "none",
              padding: "0.75rem 1.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.25rem",
              fontWeight: "bold",
            }}
          >
            Continue Shopping
          </Link>

          <button
            onClick={handleProceedToPayment}
            disabled={loading || !customerEmail || !paymentMethod}
            style={{
              backgroundColor:
                loading || !customerEmail || !paymentMethod
                  ? "#9ca3af"
                  : "#4f46e5",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.25rem",
              cursor:
                loading || !customerEmail || !paymentMethod
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "bold",
            }}
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
