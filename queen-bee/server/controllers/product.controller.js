// import products from "../../client/src/data.json" assert { type: "json" };

// export const getAllProducts = (req, res) => {
//   try {
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getProductById = (req, res) => {
//   try {
//     const product = products.find((p) => p.id === parseInt(req.params.id));
//     if (product) {
//       res.json(product);
//     } else {
//       res.status(404).json({ message: "Product not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

import { readFileSync } from "fs";

const productsData = readFileSync(
  new URL("../data/data.json", import.meta.url)
);
const products = JSON.parse(productsData);

export const getAllProducts = (req, res) => {
  try {
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = (req, res) => {
  try {
    const product = products.find((p) => p.id === parseInt(req.params.id));
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
