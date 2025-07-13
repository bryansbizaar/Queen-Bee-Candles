import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const PaymentFailure = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's error information in sessionStorage
    const storedError = sessionStorage.getItem("paymentError");
    if (storedError) {
      setErrorMessage(JSON.parse(storedError).message);
      // Clear the error after displaying it
      sessionStorage.removeItem("paymentError");
    } else {
      // If no error information, show generic message
      setErrorMessage("Your payment could not be processed at this time.");
    }
  }, []);

  const handleRetry = () => {
    // Navigate back to cart to retry payment
    navigate("/cart");
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "3rem",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          fontSize: "4rem",
          color: "#dc2626",
          marginBottom: "1rem",
        }}
      >
        ❌
      </div>

      <h1
        style={{
          color: "#dc2626",
          marginBottom: "1rem",
          fontSize: "2rem",
        }}
      >
        Payment Failed
      </h1>

      <p
        style={{
          color: "#6b7280",
          fontSize: "1.1rem",
          marginBottom: "2rem",
        }}
      >
        We&apos;re sorry, but your payment could not be processed.
      </p>

      <div
        style={{
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          marginBottom: "2rem",
          textAlign: "left",
        }}
      >
        <h3
          style={{
            margin: "0 0 1rem 0",
            color: "#991b1b",
            fontSize: "1.1rem",
          }}
        >
          What went wrong?
        </h3>

        <p
          style={{
            color: "#7f1d1d",
            margin: "0",
            fontSize: "0.95rem",
          }}
        >
          {errorMessage}
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#fffbeb",
          border: "1px solid #fed7aa",
          borderRadius: "0.5rem",
          padding: "1rem",
          marginBottom: "2rem",
        }}
      >
        <h4
          style={{
            margin: "0 0 0.5rem 0",
            color: "#92400e",
            fontSize: "1rem",
          }}
        >
          Common reasons for payment failure:
        </h4>
        <ul
          style={{
            color: "#b45309",
            margin: "0",
            paddingLeft: "1.5rem",
            fontSize: "0.9rem",
            textAlign: "left",
          }}
        >
          <li>Insufficient funds</li>
          <li>Incorrect card details</li>
          <li>Card expired or blocked</li>
          <li>Network connectivity issues</li>
          <li>Bank security restrictions</li>
        </ul>
      </div>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleRetry}
          style={{
            backgroundColor: "#4f46e5",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.375rem",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Try Again
        </button>

        <Link
          to="/"
          style={{
            backgroundColor: "#6b7280",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.375rem",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Continue Shopping
        </Link>
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#f9fafb",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
        }}
      >
        <p
          style={{
            color: "#6b7280",
            margin: "0",
            fontSize: "0.9rem",
          }}
        >
          💡 <strong>Need help?</strong> Contact our support team if you
          continue to experience issues.
        </p>
      </div>
    </div>
  );
};

export default PaymentFailure;
