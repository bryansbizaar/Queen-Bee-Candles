// client/src/components/PaymentSuccess.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import formatAmount from "../utils/formatAmount";

const PaymentSuccess = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get payment data from sessionStorage
    const stored = sessionStorage.getItem("paymentSuccess");
    if (stored) {
      const data = JSON.parse(stored);
      setPaymentData(data);

      // Automatically create order in database
      createOrderInDatabase(data);
    }
  }, []);

  const createOrderInDatabase = async (paymentData) => {
    setCreating(true);
    setError(null);

    try {
      // First, get the cart items from sessionStorage (they should be stored before payment)
      const cartItems = JSON.parse(sessionStorage.getItem("cartItems") || "[]");

      if (cartItems.length === 0) {
        throw new Error(
          "No cart items found. Order may have already been processed."
        );
      }

      // Prepare order data for the database
      const orderPayload = {
        customerEmail: paymentData.customerEmail,
        customerName: "Guest Customer", // We'll improve this in the next step
        customerPhone: null,
        shippingAddress: {
          name: "Guest Customer",
          email: paymentData.customerEmail,
          line1: "Address to be collected",
          city: "City",
          postal_code: "0000",
          country: "NZ",
        },
        billingAddress: null, // Same as shipping for now
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentIntentId: paymentData.paymentIntentId,
        totalAmount: paymentData.amount,
        status: "completed",
      };

      // Create order in database
      const response = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        // If order already exists for this payment intent, that's actually okay
        if (response.status === 409) {
          console.log("Order already exists for this payment intent");
          setOrderCreated(true);
          return;
        }
        throw new Error(result.message || "Failed to create order");
      }

      setOrderData(result.data);
      setOrderCreated(true);

      // Clear cart items from sessionStorage since order is now created
      sessionStorage.removeItem("cartItems");

      console.log("Order created successfully:", result.data);
    } catch (err) {
      console.error("Error creating order:", err);
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (!paymentData) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ color: "#dc2626", marginBottom: "1rem" }}>
          Payment Information Not Found
        </h1>
        <p style={{ marginBottom: "2rem", color: "#6b7280" }}>
          We couldn&apos;t find your payment information. This might happen if
          you navigated directly to this page.
        </p>
        <Link
          to="/"
          style={{
            backgroundColor: "#4f46e5",
            color: "white",
            padding: "0.75rem 1.5rem",
            textDecoration: "none",
            borderRadius: "0.375rem",
            display: "inline-block",
          }}
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      {/* Success Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            fontSize: "4rem",
            marginBottom: "1rem",
            color: "#10b981",
          }}
        >
          ✅
        </div>
        <h1
          style={{
            color: "#10b981",
            marginBottom: "0.5rem",
            fontSize: "2rem",
          }}
        >
          Payment Successful!
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>
          Thank you for your purchase from Queen Bee Candles
        </p>
      </div>

      {/* Payment Details */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          marginBottom: "2rem",
          textAlign: "left",
        }}
      >
        <h3 style={{ marginBottom: "1rem", color: "#374151" }}>
          Payment Details
        </h3>
        <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.95rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Order ID:</span>
            <span style={{ fontWeight: "bold" }}>{paymentData.orderId}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Amount:</span>
            <span style={{ fontWeight: "bold" }}>
              {formatAmount(paymentData.amount)}{" "}
              {paymentData.currency.toUpperCase()}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Email:</span>
            <span>{paymentData.customerEmail}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Payment ID:</span>
            <span style={{ fontSize: "0.85rem", fontFamily: "monospace" }}>
              {paymentData.paymentIntentId}
            </span>
          </div>
        </div>
      </div>

      {/* Order Creation Status */}
      <div
        style={{
          backgroundColor: creating
            ? "#fef3c7"
            : orderCreated
            ? "#d1fae5"
            : "#fee2e2",
          border: `1px solid ${
            creating ? "#fbbf24" : orderCreated ? "#10b981" : "#ef4444"
          }`,
          borderRadius: "0.5rem",
          padding: "1rem",
          marginBottom: "2rem",
        }}
      >
        {creating && (
          <div>
            <div
              style={{
                display: "inline-block",
                width: "1rem",
                height: "1rem",
                border: "2px solid #fbbf24",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginRight: "0.5rem",
              }}
            ></div>
            <span style={{ color: "#92400e" }}>
              Creating your order record...
            </span>
          </div>
        )}

        {orderCreated && !creating && (
          <div style={{ color: "#065f46" }}>
            <span style={{ marginRight: "0.5rem" }}>✅</span>
            Order successfully saved to our system!
          </div>
        )}

        {error && (
          <div style={{ color: "#991b1b" }}>
            <span style={{ marginRight: "0.5rem" }}>⚠️</span>
            {error}
            <div style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Don&apos;t worry - your payment was successful. We&apos;ll follow
              up via email.
            </div>
          </div>
        )}
      </div>

      {/* Order Details (if order was created) */}
      {orderData && (
        <div
          style={{
            backgroundColor: "#f0f9ff",
            border: "1px solid #0ea5e9",
            borderRadius: "0.5rem",
            padding: "1.5rem",
            marginBottom: "2rem",
            textAlign: "left",
          }}
        >
          <h3 style={{ marginBottom: "1rem", color: "#0c4a6e" }}>
            Order Information
          </h3>
          <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.95rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#0369a1" }}>Database Order ID:</span>
              <span style={{ fontWeight: "bold" }}>{orderData.id}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#0369a1" }}>Status:</span>
              <span
                style={{
                  color: "#10b981",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                }}
              >
                {orderData.status}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#0369a1" }}>Items:</span>
              <span>{orderData.items?.length || 0} item(s)</span>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "#374151" }}>
          What happens next?
        </h3>
        <div
          style={{
            textAlign: "left",
            color: "#6b7280",
            lineHeight: "1.6",
          }}
        >
          <p style={{ marginBottom: "0.5rem" }}>
            📧 You&apos;ll receive an email confirmation shortly
          </p>
          <p style={{ marginBottom: "0.5rem" }}>
            🕯️ Your handcrafted candles will be prepared with care
          </p>
          <p style={{ marginBottom: "0.5rem" }}>
            📦 We&apos;ll notify you when your order ships
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          to="/"
          style={{
            backgroundColor: "#4f46e5",
            color: "white",
            padding: "0.75rem 1.5rem",
            textDecoration: "none",
            borderRadius: "0.375rem",
            display: "inline-block",
          }}
        >
          Continue Shopping
        </Link>

        {paymentData.customerEmail && (
          <a
            href={`mailto:${paymentData.customerEmail}?subject=Queen Bee Candles Order ${paymentData.orderId}&body=Thank you for your order! We'll be in touch soon.`}
            style={{
              backgroundColor: "#059669",
              color: "white",
              padding: "0.75rem 1.5rem",
              textDecoration: "none",
              borderRadius: "0.375rem",
              display: "inline-block",
            }}
          >
            Email Support
          </a>
        )}
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
