// client/src/tests/setup/mockApiHandlers.js
import { rest } from 'msw'
import { mockProducts } from './mockProducts'

export const cartApiHandlers = [
  // Get all products
  rest.get('/api/products', (req, res, ctx) => {
    const category = req.url.searchParams.get('category')
    const search = req.url.searchParams.get('search')
    
    let products = mockProducts
    
    if (category) {
      products = products.filter(p => p.category === category)
    }
    
    if (search) {
      products = products.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    return res(ctx.json(products))
  }),

  // Get single product
  rest.get('/api/products/:id', (req, res, ctx) => {
    const { id } = req.params
    const product = mockProducts.find(p => p.id === parseInt(id))
    
    if (!product) {
      return res(ctx.status(404), ctx.json({ error: 'Product not found' }))
    }
    
    return res(ctx.json(product))
  }),

  // Create payment intent
  rest.post('/api/stripe/create-payment-intent', (req, res, ctx) => {
    return res(
      ctx.json({
        clientSecret: 'pi_test_client_secret_12345',
        orderId: 'QBC-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      })
    )
  }),

  // Create order
  rest.post('/api/orders', (req, res, ctx) => {
    const orderId = 'QBC-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    return res(
      ctx.json({
        id: orderId,
        status: 'confirmed',
        total: req.body.total,
        items: req.body.items,
        customer: req.body.customer,
        createdAt: new Date().toISOString()
      })
    )
  }),

  // Get order
  rest.get('/api/orders/:id', (req, res, ctx) => {
    const { id } = req.params
    return res(
      ctx.json({
        id,
        status: 'confirmed',
        total: 1500,
        items: [{ id: 1, title: 'Dragon', price: 1500, quantity: 1 }],
        customer: { email: 'test@example.com' },
        createdAt: new Date().toISOString()
      })
    )
  }),

  // Error handlers for testing
  rest.get('/api/products/error', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Internal server error' }))
  }),

  rest.post('/api/stripe/error', (req, res, ctx) => {
    return res(ctx.status(400), ctx.json({ error: 'Payment failed' }))
  })
]

// Enhanced error handlers for testing edge cases
export const errorHandlers = [
  rest.get('/api/products', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Database connection failed' }))
  }),

  rest.get('/api/products/:id', (req, res, ctx) => {
    return res.networkError('Network error')
  }),

  rest.post('/api/stripe/create-payment-intent', (req, res, ctx) => {
    return res(ctx.status(400), ctx.json({ 
      error: 'Your card was declined',
      code: 'card_declined'
    }))
  })
]
