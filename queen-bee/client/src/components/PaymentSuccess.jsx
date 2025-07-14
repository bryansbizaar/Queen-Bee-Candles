// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import formatAmount from "../utils/formatAmount";

// const PaymentSuccess = () => {
//   const [paymentData, setPaymentData] = useState(null);
//   const [orderDetails, setOrderDetails] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const storedPaymentData = sessionStorage.getItem("paymentSuccess");
//     if (storedPaymentData) {
//       const data = JSON.parse(storedPaymentData);
//       setPaymentData(data);

//       // If we have a database order ID, fetch the full order details
//       if (data.databaseOrderId) {
//         fetchOrderDetails(data.databaseOrderId);
//       } else {
//         setLoading(false);
//       }
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const fetchOrderDetails = async (orderId) => {
//     try {
//       const response = await fetch(
//         `http://localhost:8080/api/orders/${orderId}`
//       );
//       if (response.ok) {
//         const data = await response.json();
//         setOrderDetails(data.order);
//       }
//     } catch (error) {
//       console.error("Failed to fetch order details:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div
//         style={{
//           textAlign: "center",
//           padding: "3rem",
//           maxWidth: "600px",
//           margin: "0 auto",
//         }}
//       >
//         <div
//           style={{
//             fontSize: "1.5rem",
//             color: "#6b7280",
//             marginBottom: "1rem",
//           }}
//         >
//           Loading order details...
//         </div>
//       </div>
//     );
//   }

//   if (!paymentData) {
//     return (
//       <div
//         style={{
//           textAlign: "center",
//           padding: "3rem",
//           maxWidth: "600px",
//           margin: "0 auto",
//         }}
//       >
//         <h2 style={{ color: "#dc2626", marginBottom: "1rem" }}>
//           No Payment Information Found
//         </h2>
//         <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
//           We couldn&apos;t find your payment information. This page is only
//           accessible after a successful payment.
//         </p>
//         <Link
//           to="/"
//           style={{
//             display: "inline-block",
//             backgroundColor: "#4f46e5",
//             color: "white",
//             padding: "0.75rem 1.5rem",
//             borderRadius: "0.375rem",
//             textDecoration: "none",
//             fontWeight: "bold",
//           }}
//         >
//           Continue Shopping
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div
//       style={{
//         textAlign: "center",
//         padding: "3rem",
//         maxWidth: "700px",
//         margin: "0 auto",
//       }}
//     >
//       <div
//         style={{
//           fontSize: "4rem",
//           color: "#10b981",
//           marginBottom: "1rem",
//         }}
//       >
//         ✅
//       </div>

//       <h1
//         style={{
//           color: "#10b981",
//           marginBottom: "1rem",
//           fontSize: "2rem",
//         }}
//       >
//         Payment Successful!
//       </h1>

//       <p
//         style={{
//           color: "#6b7280",
//           fontSize: "1.1rem",
//           marginBottom: "2rem",
//         }}
//       >
//         Thank you for your purchase from Queen Bee Candles!
//       </p>

//       {/* Payment Details */}
//       <div
//         style={{
//           backgroundColor: "#f0fdf4",
//           border: "1px solid #bbf7d0",
//           borderRadius: "0.5rem",
//           padding: "1.5rem",
//           marginBottom: "2rem",
//           textAlign: "left",
//         }}
//       >
//         <h3
//           style={{
//             margin: "0 0 1rem 0",
//             color: "#065f46",
//             fontSize: "1.2rem",
//           }}
//         >
//           Payment Details
//         </h3>

//         <div style={{ display: "grid", gap: "0.5rem" }}>
//           <div style={{ display: "flex", justifyContent: "space-between" }}>
//             <span style={{ color: "#6b7280" }}>Order ID:</span>
//             <span style={{ fontWeight: "bold" }}>{paymentData.orderId}</span>
//           </div>

//           <div style={{ display: "flex", justifyContent: "space-between" }}>
//             <span style={{ color: "#6b7280" }}>Payment ID:</span>
//             <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
//               {paymentData.paymentIntentId}
//             </span>
//           </div>

//           <div style={{ display: "flex", justifyContent: "space-between" }}>
//             <span style={{ color: "#6b7280" }}>Amount:</span>
//             <span
//               style={{
//                 fontWeight: "bold",
//                 fontSize: "1.1rem",
//                 color: "#10b981",
//               }}
//             >
//               {formatAmount(paymentData.amount)}{" "}
//               {paymentData.currency?.toUpperCase()}
//             </span>
//           </div>

//           <div style={{ display: "flex", justifyContent: "space-between" }}>
//             <span style={{ color: "#6b7280" }}>Email:</span>
//             <span>{paymentData.customerEmail}</span>
//           </div>

//           <div style={{ display: "flex", justifyContent: "space-between" }}>
//             <span style={{ color: "#6b7280" }}>Date:</span>
//             <span>{new Date(paymentData.timestamp).toLocaleDateString()}</span>
//           </div>
//         </div>
//       </div>

//       {/* Order Details (if available) */}
//       {orderDetails && (
//         <div
//           style={{
//             backgroundColor: "#fefce8",
//             border: "1px solid #fde68a",
//             borderRadius: "0.5rem",
//             padding: "1.5rem",
//             marginBottom: "2rem",
//             textAlign: "left",
//           }}
//         >
//           <h3
//             style={{
//               margin: "0 0 1rem 0",
//               color: "#92400e",
//               fontSize: "1.2rem",
//             }}
//           >
//             Order Items
//           </h3>

//           {orderDetails.items && orderDetails.items.length > 0 ? (
//             <div style={{ display: "grid", gap: "0.75rem" }}>
//               {orderDetails.items.map((item, index) => (
//                 <div
//                   key={index}
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     padding: "0.5rem",
//                     backgroundColor: "white",
//                     borderRadius: "0.25rem",
//                     border: "1px solid #e5e7eb",
//                   }}
//                 >
//                   <div>
//                     <div style={{ fontWeight: "bold", color: "#1f2937" }}>
//                       {item.product_title}
//                     </div>
//                     <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
//                       Quantity: {item.quantity}
//                     </div>
//                   </div>
//                   <div style={{ textAlign: "right" }}>
//                     <div style={{ fontWeight: "bold" }}>
//                       {formatAmount(item.subtotal)}
//                     </div>
//                     <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
//                       {formatAmount(item.price_at_time)} each
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p style={{ color: "#6b7280" }}>
//               Order items will be processed shortly.
//             </p>
//           )}

//           <div
//             style={{
//               marginTop: "1rem",
//               paddingTop: "1rem",
//               borderTop: "1px solid #e5e7eb",
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               fontSize: "1.1rem",
//               fontWeight: "bold",
//             }}
//           >
//             <span>Total:</span>
//             <span style={{ color: "#10b981" }}>
//               {formatAmount(orderDetails.total_amount)}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Error Message (if order creation failed) */}
//       {paymentData.orderCreationError && (
//         <div
//           style={{
//             backgroundColor: "#fef2f2",
//             border: "1px solid #fecaca",
//             borderRadius: "0.5rem",
//             padding: "1rem",
//             marginBottom: "2rem",
//             textAlign: "left",
//           }}
//         >
//           <h4 style={{ margin: "0 0 0.5rem 0", color: "#dc2626" }}>⚠️ Note</h4>
//           <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>
//             Your payment was successful, but we encountered an issue saving your
//             order details. Our team will process your order manually. You will
//             receive a confirmation email shortly.
//           </p>
//         </div>
//       )}

//       {/* Next Steps */}
//       <div
//         style={{
//           backgroundColor: "#f8fafc",
//           border: "1px solid #e2e8f0",
//           borderRadius: "0.5rem",
//           padding: "1.5rem",
//           marginBottom: "2rem",
//           textAlign: "left",
//         }}
//       >
//         <h3
//           style={{
//             margin: "0 0 1rem 0",
//             color: "#1e293b",
//             fontSize: "1.1rem",
//           }}
//         >
//           What happens next?
//         </h3>

//         <ul
//           style={{
//             margin: 0,
//             paddingLeft: "1.5rem",
//             color: "#64748b",
//             lineHeight: "1.6",
//           }}
//         >
//           <li>You&apos;ll receive an email confirmation shortly</li>
//           <li>Your candles will be carefully handcrafted</li>
//           <li>
//             We&apos;ll notify you when your order is ready for pickup or
//             shipping
//           </li>
//           <li>Expected processing time: 3-5 business days</li>
//         </ul>
//       </div>

//       {/* Action Buttons */}
//       <div
//         style={{
//           display: "flex",
//           gap: "1rem",
//           justifyContent: "center",
//           flexWrap: "wrap",
//         }}
//       >
//         <Link
//           to="/"
//           style={{
//             display: "inline-block",
//             backgroundColor: "#4f46e5",
//             color: "white",
//             padding: "0.75rem 1.5rem",
//             borderRadius: "0.375rem",
//             textDecoration: "none",
//             fontWeight: "bold",
//           }}
//         >
//           Continue Shopping
//         </Link>

//         {paymentData.customerEmail && (
//           <Link
//             to={`/orders/customer/${encodeURIComponent(
//               paymentData.customerEmail
//             )}`}
//             style={{
//               display: "inline-block",
//               backgroundColor: "#059669",
//               color: "white",
//               padding: "0.75rem 1.5rem",
//               borderRadius: "0.375rem",
//               textDecoration: "none",
//               fontWeight: "bold",
//             }}
//           >
//             View Order History
//           </Link>
//         )}
//       </div>

//       {/* Contact Information */}
//       <div
//         style={{
//           marginTop: "2rem",
//           padding: "1rem",
//           backgroundColor: "#f1f5f9",
//           borderRadius: "0.375rem",
//           fontSize: "0.875rem",
//           color: "#64748b",
//         }}
//       >
//         <p style={{ margin: "0 0 0.5rem 0" }}>
//           <strong>Questions about your order?</strong>
//         </p>
//         <p style={{ margin: 0 }}>
//           Contact us at orders@queenbeecandles.co.nz or call (09) 123-4567
//         </p>
//       </div>
//     </div>
//   );
// };

// export default PaymentSuccess;

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
      <div className="success-container">
        <h2 className="success-error-title">
          No Payment Information Found
        </h2>
        <p className="success-error-text">
          We couldn&apos;t find your payment information. This page is only
          accessible after a successful payment.
        </p>
        <Link
          to="/"
          className="action-button action-button-primary"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Check if there was an order creation issue
  const hasOrderIssue =
    paymentData.orderStatus === "payment_succeeded_order_pending";

  return (
    <div className="success-container">
      <div className={`success-icon ${hasOrderIssue ? 'success-icon-warning' : 'success-icon-green'}`}>
        {hasOrderIssue ? "⚠️" : "✅"}
      </div>

      <h1 className={`success-title ${hasOrderIssue ? 'success-title-warning' : 'success-title-green'}`}>
        {hasOrderIssue ? "Payment Received!" : "Order Confirmed!"}
      </h1>

      <p className="success-subtitle">
        {hasOrderIssue
          ? "Your payment was successful, but we're still processing your order details."
          : "Thank you for your purchase from Queen Bee Candles!"}
      </p>

      <div className={`order-details-card ${hasOrderIssue ? 'order-details-warning' : 'order-details-green'}`}>
        <h3 className={`order-details-title ${hasOrderIssue ? 'order-details-title-warning' : 'order-details-title-green'}`}>
          {hasOrderIssue ? "Payment Details" : "Order Details"}
        </h3>

        <div className="order-details-grid">
          <div className="order-details-row">
            <span className="order-details-label">Order ID:</span>
            <span className="order-details-value">{paymentData.orderId}</span>
          </div>

          <div className="order-details-row">
            <span className="order-details-label">Payment ID:</span>
            <span className="order-details-value-small">
              {paymentData.paymentIntentId}
            </span>
          </div>

          <div className="order-details-row">
            <span className="order-details-label">Amount:</span>
            <span className="order-details-value">
              {formatAmount(paymentData.amount * 100)}
            </span>
          </div>

          <div className="order-details-row">
            <span className="order-details-label">Email:</span>
            <span>{paymentData.customerEmail}</span>
          </div>

          {paymentData.itemCount && (
            <div className="order-details-row">
              <span className="order-details-label">Items:</span>
              <span>{paymentData.itemCount}</span>
            </div>
          )}

          <div className="order-details-row">
            <span className="order-details-label">Status:</span>
            <span className={hasOrderIssue ? 'order-details-status-warning' : 'order-details-status-green'}>
              {hasOrderIssue ? "Processing" : "Confirmed"}
            </span>
          </div>

          <div className="order-details-row">
            <span className="order-details-label">Date:</span>
            <span>{new Date(paymentData.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {hasOrderIssue && (
        <div className="next-steps-card next-steps-warning">
          <h4 className="next-steps-title next-steps-title-warning">
            What happens next?
          </h4>
          <p className="next-steps-text next-steps-text-warning">
            Your payment was successful and we&apos;ll process your order
            shortly. If you don&apos;t receive a confirmation email within 24
            hours, please contact us with your Payment ID:{" "}
            <strong>{paymentData.paymentIntentId}</strong>
          </p>
        </div>
      )}

      {!hasOrderIssue && (
        <div className="next-steps-card next-steps-success">
          <h4 className="next-steps-title next-steps-title-success">
            What happens next?
          </h4>
          <ul className="next-steps-list next-steps-list-success">
            <li>You&apos;ll receive a confirmation email shortly</li>
            <li>We&apos;ll prepare your handcrafted candles with care</li>
            <li>Your order will be shipped within 2-3 business days</li>
            <li>You&apos;ll receive tracking information via email</li>
          </ul>
        </div>
      )}

      <div className="action-buttons">
        <Link
          to="/"
          className="action-button action-button-primary"
        >
          Continue Shopping
        </Link>

        <a
          href={`mailto:support@queenbeecandles.co.nz?subject=Order Inquiry - ${paymentData.orderId}&body=Hi, I have a question about my order ${paymentData.orderId} (Payment ID: ${paymentData.paymentIntentId})`}
          className="action-button action-button-secondary"
        >
          Contact Support
        </a>
      </div>

      <div className="contact-info">
        <p className="contact-info-text">
          <strong>Need help?</strong> Contact us at
          support@queenbeecandles.co.nz or reference your Order ID:{" "}
          <strong>{paymentData.orderId}</strong>
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
