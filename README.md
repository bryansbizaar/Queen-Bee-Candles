# Queen Bee Candles 🐝

A modern React/Express e-commerce application for selling handcrafted beeswax candles. Features secure Stripe payment processing, PostgreSQL database integration, and comprehensive testing coverage.

## 🎯 Project Overview

An online candle shop that allows customers to browse beautiful handcrafted beeswax candles, add them to their cart, and complete purchases using Stripe's secure payment system. Built with modern web technologies and professional development practices, this project demonstrates enterprise-level software architecture, comprehensive testing strategies, and production-ready deployment considerations.

## 🏗️ Key Features

### E-commerce Functionality
- **Product Catalog**: Browse handcrafted beeswax candles with detailed descriptions
- **Shopping Cart**: Add, remove, and modify quantities with persistent cart state
- **Secure Checkout**: Stripe-powered payment processing with 3D Secure support
- **Order Management**: Complete order tracking from purchase to fulfillment
- **Inventory Management**: Real-time stock tracking

### Technical Highlights
- **Database**: PostgreSQL with Docker containerization
- **Payment Processing**: Secure Stripe integration with webhook handling
- **Security**: Helmet.js, rate limiting, input validation, CORS protection
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Error Handling**: Graceful error boundaries and user feedback
- **Testing**: Comprehensive test coverage across server and client

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker (for PostgreSQL)
- Stripe account for payment processing

### Environment Setup

1. **Database Setup**:
   ```bash
   # Start PostgreSQL with Docker
   docker run --name postgres-db -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres
   ```

2. **Server Configuration**:
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your database and Stripe credentials
   npm install
   npm run dev
   ```

3. **Client Setup**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

### Environment Variables

Create the following environment files (never commit these to git):

**Server (.env)**:
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/queenbee
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=queenbee
PGHOST=localhost
PGPORT=5432

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Server Configuration
PORT=8080
NODE_ENV=development
```

**Client (.env)**:
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_API_URL=http://localhost:8080
```

> **Security Note**: The `.env` files are excluded from git via `.gitignore`. Never commit real API keys or database credentials to version control.

---

## 🧪 Testing

The application includes comprehensive testing across both server and client, including accessibility compliance:

**Server Tests**:
- API endpoint testing (products, orders, Stripe integration)
- Database service testing (CRUD operations, data persistence)
- Payment processing validation
- Security and error handling

**Client Tests**:
- React component testing with user interactions
- API integration testing
- Cart workflow and state management
- Payment flow integration
- Error boundary testing
- **Accessibility testing** with automated axe-core validation

**Run Tests**:
```bash
# Server tests
cd server
npm test

# Client tests  
cd client
npm test

# Run with coverage
npm run test:coverage
```

---

## ♿ Accessibility Features

Recent accessibility enhancements ensure the application is usable by all customers:

**Cart & Navigation**:
- ARIA labels and live regions for cart updates and status announcements
- Enhanced quantity controls with descriptive labels and proper disabled states
- Semantic structure with proper roles and landmarks
- Skip links for keyboard navigation

**User Interface**:
- Enhanced focus indicators for keyboard navigation
- Touch target improvements for mobile accessibility (44px minimum)
- High contrast mode support
- Reduced motion preferences for users with vestibular disorders

**Screen Reader Support**:
- Screen reader-only content for important contextual information
- Proper form validation with accessible error messages
- Live regions announce cart changes and important updates

**Testing & Compliance**:
- Automated accessibility testing with axe-core integration
- Priority 1 accessibility tests for core user flows
- WCAG compliance improvements for browsing and purchasing

*Impact*: Screen reader and keyboard users can now browse products and complete purchases effectively.

---

## 🎨 Project Structure

```
queen-bee/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Header.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── CheckoutForm.jsx
│   │   ├── pages/             # Route-level components
│   │   │   ├── Home.jsx
│   │   │   ├── CartPage.jsx
│   │   │   └── CheckoutSuccess.jsx
│   │   ├── context/           # React Context providers
│   │   │   └── CartContext.jsx
│   │   ├── utils/             # Helper functions
│   │   └── __tests__/         # Test files
│   └── package.json
├── server/                    # Express backend application
│   ├── controllers/           # Route handlers
│   ├── services/              # Business logic layer
│   │   ├── ProductService.js
│   │   └── OrderService.js
│   ├── middleware/            # Custom middleware
│   ├── database/              # Database configuration
│   ├── tests/                 # Test files
│   └── package.json
├── docker-compose.yml         # Database containerization
└── README.md
```

---

## 🔒 Security Features

- **Input Validation**: Joi schema validation on all inputs
- **Rate Limiting**: Protection against abuse and DDoS
- **CORS Configuration**: Secure cross-origin resource sharing
- **Helmet.js**: Security headers and protection middleware
- **Environment Isolation**: Secure credential management
- **Payment Security**: PCI-compliant Stripe integration

---

## 💳 Payment Integration

**Stripe Payment Processing**:
- Secure card collection with Stripe Elements
- Support for major credit/debit cards
- 3D Secure authentication for enhanced security
- Real-time payment validation
- Webhook handling for order completion
- PCI-compliant payment processing

**Supported Payment Methods**:
- Visa, Mastercard, American Express
- Digital wallets (Apple Pay, Google Pay where available)

---

## 📊 Key Features

### E-commerce Functionality
- **Product Catalog**: Dynamic product loading from database
- **Shopping Cart**: Persistent cart with quantity management
- **Secure Checkout**: Stripe-powered payment processing
- **Order Management**: Complete order-to-fulfillment pipeline
- **Inventory Tracking**: Real-time stock management

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Accessibility Features**: ARIA labels, live regions, keyboard navigation, screen reader support, and WCAG compliance improvements
- **Error Handling**: Graceful error boundaries and user feedback
- **Loading States**: Professional loading indicators and skeleton screens
- **Performance**: Optimized bundle sizes and lazy loading

### Developer Experience
- **Comprehensive Testing**: Full test coverage across application layers showcasing modern testing strategies
- **Professional Code Organization**: Clean architecture patterns with separation of concerns  
- **Type Safety**: PropTypes validation and consistent coding patterns
- **Code Quality**: ESLint configuration and consistent formatting standards
- **Development Workflow**: Hot reload, error overlays, and debugging tools
- **CI/CD Pipeline**: Automated testing and build processes with GitHub Actions

---

## 🚀 Deployment

### Production Checklist
- ✅ **Database**: PostgreSQL with migrations and seeding
- ✅ **Security**: Comprehensive security middleware and validation
- ✅ **Testing**: Full test coverage across server and client
- ✅ **Error Handling**: Graceful error boundaries and logging
- ✅ **Performance**: Optimized queries and bundle sizes
- ✅ **Payment Processing**: Secure Stripe integration with webhooks
- ✅ **CI/CD Pipeline**: GitHub Actions automated testing and builds

### CI/CD Pipeline
The project includes automated GitHub Actions workflows that:
- Run comprehensive test suites for both client and server
- Set up PostgreSQL test database automatically  
- Execute build processes and validation
- Ensure code quality before deployment

---

## 📝 API Documentation

### Product Endpoints
- `GET /api/products` - Retrieve all products
- `GET /api/products/:id` - Retrieve specific product

### Order Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Retrieve order details

### Payment Endpoints
- `POST /api/create-payment-intent` - Initialize payment
- `POST /api/webhook` - Stripe webhook handler

### Static Assets
- `GET /images/:filename` - Product image serving

---

*Queen Bee Candles - A modern e-commerce application showcasing professional web development practices with secure payment processing, comprehensive testing, and production-ready architecture.*
