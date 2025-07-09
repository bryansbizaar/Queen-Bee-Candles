import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import formatAmount from "../utils/formatAmount";

const PaymentSuccess = () => {
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const storedPaymentData = sessionStorage.getItem("paymentSuccess");
    if (storedPaymentData) {
      setPaymentData(JSON.parse(storedPaymentData));
    }
  }, []);

  if (!paymentData) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "3rem",
        maxWidth: "600px",
        margin: "0 auto"
      }}>
        <h2 style={{ color: "#dc2626", marginBottom: "1rem" }}>
          No Payment Information Found
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
          We couldn't find your payment information. This page is only accessible after a successful payment.
        </p>
        <Link
          to="/"
          style={{
            display: "inline-block",
            backgroundColor: "#4f46e5",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.375rem",
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ 
      textAlign: "center", 
      padding: "3rem",
      maxWidth: "600px",
      margin: "0 auto"
    }}>
      <div style={{ 
        fontSize: "4rem", 
        color: "#10b981",
        marginBottom: "1rem"
      }}>
        ✅
      </div>
      
      <h1 style={{ 
        color: "#10b981", 
        marginBottom: "1rem",
        fontSize: "2rem"
      }}>
        Payment Successful!
      </h1>
      
      <p style={{ 
        color: "#6b7280", 
        fontSize: "1.1rem",
        marginBottom: "2rem"
      }}>
        Thank you for your purchase from Queen Bee Candles!
      </p>

      <div style={{
        backgroundColor: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "0.5rem",
        padding: "1.5rem",
        marginBottom: "2rem",
        textAlign: "left"
      }}>
        <h3 style={{ 
          margin: "0 0 1rem 0", 
          color: "#065f46",
          fontSize: "1.2rem"
        }}>
          Order Details
        </h3>
        
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Order ID:</span>
            <span style={{ fontWeight: "bold" }}>{paymentData.orderId}</span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Payment ID:</span>
            <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
              {paymentData.paymentIntentId}
            </span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Amount Paid:</span>
            <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
              {formatAmount(paymentData.amount)} {paymentData.currency.toUpperCase()}
            </span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Email:</span>
            <span style={{ fontWeight: "bold" }}>{paymentData.customerEmail}</span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Date:</span>
            <span style={{ fontWeight: "bold" }}>
              {new Date(paymentData.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: "0.5rem",
        padding: "1rem",
        marginBottom: "2rem"
      }}>
        <p style={{ 
          color: "#1e40af", 
          margin: "0",
          fontSize: "0.95rem"
        }}>
          📧 A confirmation email has been sent to {paymentData.customerEmail}
        </p>
      </div>

      <div style={{ 
        display: "flex", 
        gap: "1rem", 
        justifyContent: "center",
        flexWrap: "wrap"
      }}>
        <Link
          to="/"
          style={{
            backgroundColor: "#4f46e5",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.375rem",
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Continue Shopping
        </Link>
        
        <button
          onClick={() => window.print()}
          style={{
            backgroundColor: "#6b7280",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.375rem",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;