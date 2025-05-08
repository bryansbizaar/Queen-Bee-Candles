// import { Link } from "react-router-dom";
// import { useCart } from "../context/CartContext";

// const CartIcon = () => {
//   const { getCartCount } = useCart();
//   const itemCount = getCartCount();

//   return (
//     <Link to="/cart" className="cart-icon">
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="24"
//         height="24"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       >
//         <circle cx="9" cy="21" r="1"></circle>
//         <circle cx="20" cy="21" r="1"></circle>
//         <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
//       </svg>
//       {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
//     </Link>
//   );
// };

// export default CartIcon;

import { Link } from "react-router-dom";
import useCart from "../context/useCart";
import formatAmount from "../utils/formatAmount";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

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
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "2rem",
            fontSize: "1.25rem",
            fontWeight: "bold",
          }}
        >
          <span>Total:</span>
          <span>{formatAmount(getCartTotal())}</span>
        </div>

        <button
          style={{
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.25rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Proceed to Checkout
        </button>

        <Link
          to="/"
          style={{
            color: "#4b5563",
            textDecoration: "none",
            marginTop: "1rem",
          }}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default Cart;
