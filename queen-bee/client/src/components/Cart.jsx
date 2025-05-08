// import { Link } from "react-router-dom";
// import { useCart } from "../context/CartContext";
// import formatAmount from "../utils/formatAmount";

// const Cart = () => {
//   const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

//   if (cartItems.length === 0) {
//     return (
//       <div className="cart-empty">
//         <h2>Your cart is empty</h2>
//         <p>Looks like you haven&apos;t added any candles to your cart yet.</p>
//         <Link to="/" className="continue-shopping">
//           Continue Shopping
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="cart">
//       <h2 className="cart-title">Your Cart</h2>

//       <div className="cart-items">
//         {cartItems.map((item) => (
//           <div key={item.id} className="cart-item">
//             <div className="cart-item-image">
//               <img
//                 src={`http://localhost:8080/images/${item.image}`}
//                 alt={item.title}
//               />
//             </div>

//             <div className="cart-item-info">
//               <h3>{item.title}</h3>
//               <p>{formatAmount(item.price)}</p>
//             </div>

//             <div className="cart-item-actions">
//               <div className="quantity-control">
//                 <button
//                   onClick={() => updateQuantity(item.id, item.quantity - 1)}
//                   className="quantity-btn"
//                 >
//                   -
//                 </button>
//                 <span className="quantity">{item.quantity}</span>
//                 <button
//                   onClick={() => updateQuantity(item.id, item.quantity + 1)}
//                   className="quantity-btn"
//                 >
//                   +
//                 </button>
//               </div>

//               <button
//                 onClick={() => removeFromCart(item.id)}
//                 className="remove-btn"
//               >
//                 Remove
//               </button>
//             </div>

//             <div className="cart-item-total">
//               {formatAmount(item.price * item.quantity)}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="cart-summary">
//         <div className="cart-total">
//           <span>Total:</span>
//           <span>{formatAmount(getCartTotal())}</span>
//         </div>

//         <button className="checkout-btn">Proceed to Checkout</button>

//         <Link to="/" className="continue-shopping">
//           Continue Shopping
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default Cart;

import { Link } from "react-router-dom";
import useCart from "../context/useCart";

const CartIcon = () => {
  const { getCartCount } = useCart();
  const itemCount = getCartCount();

  return (
    <Link
      to="/cart"
      className="cart-icon"
      style={{ position: "relative", display: "inline-block" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      {itemCount > 0 && (
        <span
          className="cart-count"
          style={{
            position: "absolute",
            top: "-8px",
            right: "-8px",
            backgroundColor: "#f59e0b",
            color: "white",
            borderRadius: "50%",
            width: "18px",
            height: "18px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
