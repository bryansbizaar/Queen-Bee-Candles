import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import formatAmount from "../utils/formatAmount";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven&apos;t added any candles to your cart yet.</p>
        <Link to="/" className="continue-shopping">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2 className="cart-title">Your Cart</h2>

      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-image">
              <img
                src={`http://localhost:8080/images/${item.image}`}
                alt={item.title}
              />
            </div>

            <div className="cart-item-info">
              <h3>{item.title}</h3>
              <p>{formatAmount(item.price)}</p>
            </div>

            <div className="cart-item-actions">
              <div className="quantity-control">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="remove-btn"
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

      <div className="cart-summary">
        <div className="cart-total">
          <span>Total:</span>
          <span>{formatAmount(getCartTotal())}</span>
        </div>

        <button className="checkout-btn">Proceed to Checkout</button>

        <Link to="/" className="continue-shopping">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default Cart;
