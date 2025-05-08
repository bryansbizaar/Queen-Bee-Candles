// import { useState, useEffect } from "react";
// import Card from "./Card";
// import LoadingSpinner from "./LoadingSpinner";

// const CardList = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       console.log("Loading started");
//       try {
//         const response = await fetch("http://localhost:8080/api/products");
//         if (!response.ok) {
//           throw new Error("Failed to fetch products");
//         }
//         const data = await response.json();
//         setProducts(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         console.log("Loading finished");
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   if (loading) {
//     console.log("Rendering loading spinner");
//     return <LoadingSpinner />;
//   }
//   if (error)
//     return <div className="text-center text-red-600 mt-4">Error: {error}</div>;

//   return (
//     <div className="card-list">
//       {products.map((card) => (
//         <Card
//           key={card.id}
//           title={card.title}
//           price={card.price}
//           description={card.description}
//           image={`http://localhost:8080/images/${card.image}`}
//         />
//       ))}
//     </div>
//   );
// };

// export default CardList;

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
        console.log("Products fetched:", data); // For debugging
        setProducts(data);
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
