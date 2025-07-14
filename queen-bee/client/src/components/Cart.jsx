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
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link
          to="/"
          className="cart-empty-link"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Show payment step
  if (step === "payment" && clientSecret) {
    return (
      <div className="cart-container">
        <button
          onClick={handleBackToReview}
          className="cart-back-btn"
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
    <div className="cart-container">
      <h2 className="cart-title">
        Your Cart
      </h2>

      <div className="cart-items">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="cart-item"
          >
            <div className="cart-item-image">
              <img
                src={`http://localhost:8080/images/${item.image}`}
                alt={item.title}
                className="cart-item-img"
              />
            </div>

            <div className="cart-item-info">
              <h3 className="cart-item-title">{item.title}</h3>
              <p className="cart-item-price">
                {formatAmount(item.price)}
              </p>
            </div>

            <div className="cart-item-controls">
              <div className="cart-item-quantity">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="cart-quantity-btn"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="cart-quantity-btn"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="cart-remove-btn"
              >
                Remove
              </button>
            </div>

            <div className="cart-item-total">
              {formatAmount(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div className="cart-checkout-section">
        <div className="cart-total">
          <span>Total:</span>
          <span>{formatAmount(getCartTotal())}</span>
        </div>

        {/* Customer Email Input */}
        <div className="cart-form-group">
          <label
            htmlFor="customerEmail"
            className="cart-form-label"
          >
            Email Address *
          </label>
          <input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={handleEmailChange}
            placeholder="Enter your email address"
            className={`cart-email-input ${emailError ? 'error' : ''}`}
            onFocus={() => setEmailError("")}
          />
          {emailError && (
            <span className="cart-error-text">
              {emailError}
            </span>
          )}
        </div>

        {/* Payment Method Selection */}
        <div className="cart-form-group">
          <label className="cart-form-label">
            Payment Method *
          </label>
          <div className="cart-payment-methods">
            <label
              className={`cart-payment-option ${paymentMethod === "stripe" ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === "stripe"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>💳 Card Payment (Stripe)</span>
            </label>
            <label
              className={`cart-payment-option ${paymentMethod === "account2account" ? 'selected' : ''} disabled`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="account2account"
                checked={paymentMethod === "account2account"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled
              />
              <span>🏦 Account2Account (Coming Soon)</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="cart-error-message">
            {error}
          </div>
        )}

        <div className="cart-actions">
          <Link
            to="/"
            className="cart-continue-shopping"
          >
            Continue Shopping
          </Link>

          <button
            onClick={handleProceedToPayment}
            disabled={loading || !customerEmail || !paymentMethod}
            className={`cart-proceed-btn ${loading || !customerEmail || !paymentMethod ? 'disabled' : 'active'}`}
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
