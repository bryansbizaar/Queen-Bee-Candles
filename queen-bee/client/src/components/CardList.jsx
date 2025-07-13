import { useState, useEffect } from "react";
import CardWithLink from "./CardWithLink";
import LoadingSpinner from "./LoadingSpinner";

const CardList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch from your API endpoint
        const response = await fetch("http://localhost:8080/api/products");

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        console.log("API Response:", data); // For debugging

        // Handle the new nested response structure
        if (data.success && data.data && data.data.products) {
          console.log("Using nested structure - products:", data.data.products);
          setProducts(data.data.products);
        } else if (Array.isArray(data)) {
          console.log("Using simple array structure:", data);
          setProducts(data);
        } else {
          console.log("Unexpected response structure:", data);
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (products.length === 0) {
    return <div className="no-products">No products found.</div>;
  }

  return (
    <div className="card-list">
      {products.map((product) => (
        <CardWithLink
          key={product.id}
          id={product.id}
          title={product.title}
          price={product.price}
          description={product.description}
          image={product.image}
        />
      ))}
    </div>
  );
};

export default CardList;
