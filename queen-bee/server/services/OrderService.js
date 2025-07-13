// server/services/OrderService.js
import pool from "../config/database.js";

class OrderService {
  // Create a new order with order items
  static async createOrder(orderData) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const {
        customerEmail,
        customerName,
        customerPhone = null,
        shippingAddress,
        billingAddress = null,
        items, // Array of {productId, quantity, price}
        paymentIntentId,
        totalAmount,
        status = "pending",
      } = orderData;

      // 1. Create or get customer
      let customerId;
      const customerResult = await client.query(
        "SELECT id FROM customers WHERE email = $1",
        [customerEmail]
      );

      if (customerResult.rows.length > 0) {
        customerId = customerResult.rows[0].id;
        // Update customer info if provided
        await client.query(
          "UPDATE customers SET name = $1, phone = $2 WHERE id = $3",
          [customerName, customerPhone, customerId]
        );
      } else {
        // Create new customer
        const newCustomerResult = await client.query(
          "INSERT INTO customers (email, name, phone) VALUES ($1, $2, $3) RETURNING id",
          [customerEmail, customerName, customerPhone]
        );
        customerId = newCustomerResult.rows[0].id;
      }

      // 2. Create the order
      const orderResult = await client.query(
        `
        INSERT INTO orders (
          customer_id, 
          total_amount, 
          status, 
          payment_intent_id,
          shipping_address,
          billing_address,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
        RETURNING id, created_at
      `,
        [
          customerId,
          totalAmount,
          status,
          paymentIntentId,
          JSON.stringify(shippingAddress),
          billingAddress ? JSON.stringify(billingAddress) : null,
        ]
      );

      const orderId = orderResult.rows[0].id;

      // 3. Create order items and update inventory
      for (const item of items) {
        // Add order item
        await client.query(
          `
          INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
          VALUES ($1, $2, $3, $4)
        `,
          [orderId, item.productId, item.quantity, item.price]
        );

        // Update product inventory (reduce stock)
        const updateResult = await client.query(
          `
          UPDATE products 
          SET stock_quantity = stock_quantity - $1,
              updated_at = NOW()
          WHERE id = $2 AND stock_quantity >= $1
          RETURNING stock_quantity
        `,
          [item.quantity, item.productId]
        );

        if (updateResult.rows.length === 0) {
          throw new Error(
            `Insufficient stock for product ID ${item.productId}`
          );
        }
      }

      await client.query("COMMIT");

      // Return the complete order
      return await this.getOrderById(orderId);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // Get order by ID with all details
  static async getOrderById(orderId) {
    const query = `
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.payment_intent_id,
        o.shipping_address,
        o.billing_address,
        o.created_at,
        o.updated_at,
        c.email as customer_email,
        c.name as customer_name,
        c.phone as customer_phone,
        json_agg(
          json_build_object(
            'product_id', oi.product_id,
            'product_title', p.title,
            'quantity', oi.quantity,
            'price_at_time', oi.price_at_time,
            'subtotal', oi.quantity * oi.price_at_time
          )
        ) as items
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
      GROUP BY o.id, c.email, c.name, c.phone
    `;

    const result = await pool.query(query, [orderId]);

    if (result.rows.length === 0) {
      return null;
    }

    const order = result.rows[0];

    // Parse JSON fields
    order.shipping_address = JSON.parse(order.shipping_address);
    if (order.billing_address) {
      order.billing_address = JSON.parse(order.billing_address);
    }

    return order;
  }

  // Get orders by customer email
  static async getOrdersByCustomer(customerEmail) {
    const query = `
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE c.email = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    const result = await pool.query(query, [customerEmail]);
    return result.rows;
  }

  // Update order status
  static async updateOrderStatus(orderId, status, notes = null) {
    const query = `
      UPDATE orders 
      SET status = $1, 
          notes = COALESCE($2, notes),
          updated_at = NOW()
      WHERE id = $3
      RETURNING id, status, updated_at
    `;

    const result = await pool.query(query, [status, notes, orderId]);

    if (result.rows.length === 0) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    return result.rows[0];
  }

  // Get all orders (for admin)
  static async getAllOrders(limit = 50, offset = 0, status = null) {
    let query = `
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.created_at,
        o.updated_at,
        c.email as customer_email,
        c.name as customer_name,
        COUNT(oi.id) as item_count
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;

    const params = [];

    if (status) {
      query += " WHERE o.status = $1";
      params.push(status);
    }

    query += `
      GROUP BY o.id, c.email, c.name
      ORDER BY o.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Check if payment intent already has an order
  static async getOrderByPaymentIntent(paymentIntentId) {
    const query = `
      SELECT id, status, total_amount 
      FROM orders 
      WHERE payment_intent_id = $1
    `;

    const result = await pool.query(query, [paymentIntentId]);
    return result.rows[0] || null;
  }

  // Get order statistics
  static async getOrderStats(startDate = null, endDate = null) {
    let dateFilter = "";
    const params = [];

    if (startDate && endDate) {
      dateFilter = "WHERE o.created_at BETWEEN $1 AND $2";
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders o
      ${dateFilter}
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  }
}

export default OrderService;
