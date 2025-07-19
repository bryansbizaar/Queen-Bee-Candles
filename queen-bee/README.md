# Queen Bee Candles

A React-based e-commerce website for selling handcrafted beeswax candles.

## Project Structure

The project is divided into two main parts:

### Client (Frontend)

```
client/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Card.jsx
│   │   ├── CardList.jsx
│   │   ├── Cart.jsx
│   │   ├── CartIcon.jsx
│   │   ├── Header.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Logo.jsx
│   │   └── ProductDetail.jsx
│   ├── context/
│   │   └── CartContext.jsx
│   ├── utils/
│   │   └── formatAmount.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
└── package.json
```

### Server (Backend)

```
server/
├── controllers/
│   └── product.controller.js
├── data/
│   └── data.json
├── images/
│   ├── dragon.jpg
│   ├── corn-cob.jpg
│   ├── bee-and-flower.jpg
│   └── rose.jpg
├── routes/
│   └── product.routes.js
├── server.js
└── package.json
```

## Setup Instructions

1. **Server Setup**:

   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Client Setup**:

   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Required Dependencies**:

   - Server: express, cors, dotenv
   - Client: react, react-dom, react-router-dom

4. **Image Setup**:
   - Create an `images` folder in your server directory
   - Place all product images in this folder
   - Images should match the filenames in your data.json file

## Features

- **Product Catalog**: View all candle products on the homepage
- **Product Detail**: View detailed information about a specific candle
- **Cart Functionality**: Add products to cart, update quantities, remove items
- **Responsive Design**: Looks good on both desktop and mobile devices

## Implementation Notes

1. **Server API**:

   - GET `/api/products` - Returns all products
   - GET `/api/products/:id` - Returns a specific product by ID
   - Static route `/images/` serves product images

2. **Routes**:

   - `/` - Home page with product catalog
   - `/product/:id` - Product detail page
   - `/cart` - Shopping cart page
   - `/about` - About page (to be implemented)
   - `/contact` - Contact page (to be implemented)

3. **Cart Context**:
   The cart functionality is implemented using React Context API, which provides:
   - Add to cart
   - Remove from cart
   - Update quantities
   - Calculate cart total

## Future Enhancements

- Checkout process
- User authentication
- Product categories
- Search functionality
- Product reviews
- Payment integration
# Testing CI
# Testing manual CI
# Test workflow fix
# Test workflow fix
# Test workflow fix
# Test workflow fix
