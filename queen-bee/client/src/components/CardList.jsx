// import { useState, useEffect } from "react";
// import CardWithLink from "./CardWithLink";
// import LoadingSpinner from "./LoadingSpinner";

// const CardList = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         // Fetch from your API endpoint
//         const response = await fetch("http://localhost:8080/api/products");

//         if (!response.ok) {
//           throw new Error("Failed to fetch products");
//         }

//         const data = await response.json();
//         console.log("Products fetched:", data); // For debugging

//         // Extract products from the data property
//         const productsArray = data.data || data; // Handle both new and old API response format
//         setProducts(productsArray);
//       } catch (err) {
//         console.error("Error fetching products:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   if (error) {
//     return <div className="error">Error: {error}</div>;
//   }

//   if (products.length === 0) {
//     return <div className="no-products">No products found.</div>;
//   }

//   return (
//     <div className="card-list">
//       {products.map((product) => (
//         <CardWithLink
//           key={product.id}
//           id={product.id}
//           title={product.title}
//           price={product.price}
//           description={product.description}
//           image={product.image}
//         />
//       ))}
//     </div>
//   );
// };

// export default CardList;
// client/src/components/CardList.jsx
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

        const result = await response.json();
        console.log("Full API response:", result); // Enhanced debugging
        console.log("result.data:", result.data); // Check what's in data
        console.log("result.data.products:", result.data?.products); // Check products specifically

        // Handle new API response format with better error checking
        if (
          result.success &&
          result.data &&
          Array.isArray(result.data.products)
        ) {
          setProducts(result.data.products);
        } else if (Array.isArray(result)) {
          // Fallback for old format
          setProducts(result);
        } else if (Array.isArray(result.data)) {
          // Another possible format
          setProducts(result.data);
        } else {
          console.error("Unexpected response format:", result);
          throw new Error("Invalid response format - products not found");
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
          stockQuantity={product.stock_quantity} // Pass stock info to cards
        />
      ))}
    </div>
  );
};

export default CardList;
