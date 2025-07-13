-- Queen Bee Candles Database Initialization
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create the database schema
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- stored in cents (2500 = $25.00)
    image VARCHAR(500),
    category VARCHAR(100) DEFAULT 'candles',
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL, -- QBC-timestamp-random format
    customer_id INTEGER REFERENCES customers(id),
    customer_email VARCHAR(255) NOT NULL, -- denormalized for guest orders
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, cancelled
    total_amount INTEGER NOT NULL, -- in cents
    currency VARCHAR(3) DEFAULT 'NZD',
    payment_intent_id VARCHAR(255), -- Stripe payment intent ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_title VARCHAR(255) NOT NULL, -- denormalized for historical records
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL, -- price at time of purchase (in cents)
    total_price INTEGER NOT NULL, -- quantity * unit_price
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Insert sample data matching your current products
INSERT INTO products (title, description, price, image, stock_quantity) VALUES
('Dragon', '150g 11.5H x 8W', 1500, 'dragon.jpg', 10),
('Corn Cob', '160g 15.5H x 4.5W', 1600, 'corn-cob.jpg', 8),
('Bee and Flower', '45g 3H X 6.5W', 850, 'bee-and-flower.jpg', 15),
('Rose', '40g 3H X 6.5W', 800, 'rose.jpg', 12)
ON CONFLICT DO NOTHING; -- Prevents duplicate inserts if script runs multiple times

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at timestamps
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();