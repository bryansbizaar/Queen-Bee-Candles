import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useCart from "../context/useCart";
import formatAmount from "../utils/formatAmount";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(
          `http://localhost:8080/api/products/${id}`
        );
        if (!response.ok) {
          throw new Error("Product not found");
        }
        const data = await response.json();

        // Extract product from the data property
        const productData = data.data || data; // Handle both new and old API response format
        setProduct(productData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantity(value > 0 ? value : 1);
  };

  // Add to cart functionality
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail">
      <div className="product-image">
        <img
          src={`http://localhost:8080/images/${product.image}`}
          alt={product.title}
          className="card-img"
        />
      </div>

      <div className="product-info">
        <h1 className="product-title">{product.title}</h1>
        <p className="product-price">{formatAmount(product.price)}</p>
        <p className="product-description">{product.description}</p>

        <div className="product-actions">
          <div className="quantity-selector">
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="quantity-input"
            />
          </div>

          <button onClick={handleAddToCart} className="add-to-cart-btn">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
