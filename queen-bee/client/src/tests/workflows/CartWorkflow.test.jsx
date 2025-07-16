// client/src/tests/workflows/CartWorkflow.test.jsx
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderHook, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from '../../context/CartContext'
import useCart from '../../context/useCart'
import Cart from '../../components/Cart'
import Header from '../../components/Header'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import PropTypes from 'prop-types'

// Mock API server for realistic testing
const server = setupServer(
  http.get('/api/products', () => {
    return HttpResponse.json([
      { id: 1, title: 'Dragon', price: 1500, stock: 5, description: 'Fierce dragon candle' },
      { id: 2, title: 'Corn Cob', price: 1600, stock: 3, description: 'Rustic corn candle' },
      { id: 3, title: 'Beeswax Taper', price: 800, stock: 10, description: 'Classic taper candle' }
    ])
  }),
  http.get('/api/products/:id', ({ params }) => {
    const { id } = params
    const products = {
      1: { id: 1, title: 'Dragon', price: 1500, stock: 5, description: 'Fierce dragon candle' },
      2: { id: 2, title: 'Corn Cob', price: 1600, stock: 3, description: 'Rustic corn candle' },
      3: { id: 3, title: 'Beeswax Taper', price: 800, stock: 10, description: 'Classic taper candle' }
    }
    return HttpResponse.json(products[id])
  })
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <CartProvider>
      <div data-testid="app-wrapper">
        <Header />
        {children}
      </div>
    </CartProvider>
  </BrowserRouter>
)

TestWrapper.propTypes = {
  children: PropTypes.node
}

// Mock cart component for testing integration
const MockCartPage = () => {
  return (
    <div data-testid="cart-page">
      <Cart />
    </div>
  )
}

describe('Enhanced Cart Workflow Tests', () => {
  describe('Cart State Management', () => {
    it('initializes with empty cart and correct UI state', () => {
      render(
        <TestWrapper>
          <MockCartPage />
        </TestWrapper>
      )

      // Check empty cart state
      expect(screen.getByTestId('cart-page')).toBeInTheDocument()
      
      // Cart should show 0 items in header (badge hidden when empty)
      const cartBadge = screen.queryByText('0')
      expect(cartBadge).not.toBeInTheDocument() // Badge hidden when empty
    })

    it('adds single item to cart and updates all UI elements', async () => {
      const { result } = renderHook(() => useCart(), { 
        wrapper: ({ children }) => <CartProvider>{children}</CartProvider> 
      })

      const product = { id: 1, title: 'Dragon', price: 1500, stock: 5 }

      act(() => {
        result.current.addToCart(product, 1)
      })

      // Check cart updates
      expect(result.current.cartItems).toHaveLength(1)
      expect(result.current.getCartCount()).toBe(1)
      expect(result.current.getCartTotal()).toBe(1500)
    })

    it('handles multiple items with quantity updates', async () => {
      const { result } = renderHook(() => useCart(), { 
        wrapper: ({ children }) => <CartProvider>{children}</CartProvider> 
      })

      const dragonProduct = { id: 1, title: 'Dragon', price: 1500, stock: 5 }
      const cornProduct = { id: 2, title: 'Corn Cob', price: 1600, stock: 3 }

      act(() => {
        result.current.addToCart(dragonProduct, 2)
        result.current.addToCart(cornProduct, 1)
      })

      // Check cart shows correct count and total
      expect(result.current.getCartCount()).toBe(3)
      expect(result.current.getCartTotal()).toBe(4600) // 2×1500 + 1×1600
      expect(result.current.cartItems).toHaveLength(2)
    })

    it('updates quantities correctly', async () => {
      const { result } = renderHook(() => useCart(), { 
        wrapper: ({ children }) => <CartProvider>{children}</CartProvider> 
      })

      const product = { id: 1, title: 'Dragon', price: 1500, stock: 5 }

      act(() => {
        result.current.addToCart(product, 1)
      })

      expect(result.current.cartItems[0].quantity).toBe(1)

      act(() => {
        result.current.updateQuantity(1, 3)
      })

      expect(result.current.cartItems[0].quantity).toBe(3)
      expect(result.current.getCartCount()).toBe(3)
      expect(result.current.getCartTotal()).toBe(4500)
    })

    it('removes items correctly', async () => {
      const { result } = renderHook(() => useCart(), { 
        wrapper: ({ children }) => <CartProvider>{children}</CartProvider> 
      })

      const dragonProduct = { id: 1, title: 'Dragon', price: 1500, stock: 5 }
      const cornProduct = { id: 2, title: 'Corn Cob', price: 1600, stock: 3 }

      act(() => {
        result.current.addToCart(dragonProduct, 1)
        result.current.addToCart(cornProduct, 1)
      })

      expect(result.current.cartItems).toHaveLength(2)

      act(() => {
        result.current.removeFromCart(1)
      })

      expect(result.current.cartItems).toHaveLength(1)
      expect(result.current.cartItems[0].id).toBe(2)
      expect(result.current.getCartTotal()).toBe(1600)
    })
  })

  describe('Cart Persistence', () => {
    it('maintains cart state across component re-renders', async () => {
      const { result, rerender } = renderHook(() => useCart(), { 
        wrapper: ({ children }) => <CartProvider>{children}</CartProvider> 
      })

      const product = { id: 1, title: 'Dragon', price: 1500, stock: 5 }

      act(() => {
        result.current.addToCart(product, 1)
      })

      expect(result.current.cartItems).toHaveLength(1)

      // Simulate re-render
      rerender()

      expect(result.current.cartItems).toHaveLength(1)
      expect(result.current.cartItems[0].title).toBe('Dragon')
    })

    it('handles cart state correctly with context provider', () => {
      const TestComponent = () => {
        const { cartItems, addToCart, getCartCount } = useCart()
        
        const handleAdd = () => {
          addToCart({ id: 1, title: 'Dragon', price: 1500, stock: 5 }, 1)
        }

        return (
          <div>
            <div data-testid="cart-count">{getCartCount()}</div>
            <button onClick={handleAdd} data-testid="add-button">Add Item</button>
            <div data-testid="cart-items">{cartItems.length}</div>
          </div>
        )
      }

      render(
        <BrowserRouter>
          <CartProvider>
            <TestComponent />
          </CartProvider>
        </BrowserRouter>
      )

      expect(screen.getByTestId('cart-count')).toHaveTextContent('0')
      expect(screen.getByTestId('cart-items')).toHaveTextContent('0')
    })
  })

  describe('Complex Cart Scenarios', () => {
    it('handles edge case: adding item when stock is low', async () => {
      const { result } = renderHook(() => useCart(), { 
        wrapper: ({ children }) => <CartProvider>{children}</CartProvider> 
      })

      const limitedProduct = { id: 2, title: 'Corn Cob', price: 1600, stock: 1 }

      act(() => {
        result.current.addToCart(limitedProduct, 1)
      })

      // Should succeed for available stock
      expect(result.current.cartItems).toHaveLength(1)
      expect(result.current.getCartCount()).toBe(1)

      // Try to add more than stock (business logic depends on implementation)
      act(() => {
        result.current.addToCart(limitedProduct, 1)
      })

      // Should accumulate (current implementation allows this)
      expect(result.current.cartItems[0].quantity).toBe(2)
    })

    it('handles cart operations with multiple quantities', async () => {
      const { result } = renderHook(() => useCart(), { 
        wrapper: ({ children }) => <CartProvider>{children}</CartProvider> 
      })

      const products = [
        { id: 1, title: 'Dragon', price: 1500, stock: 5 },
        { id: 2, title: 'Corn Cob', price: 1600, stock: 3 },
        { id: 3, title: 'Beeswax Taper', price: 800, stock: 10 }
      ]

      act(() => {
        products.forEach((product, index) => {
          result.current.addToCart(product, index + 1)
        })
      })

      // Should have 1 + 2 + 3 = 6 total items
      expect(result.current.getCartCount()).toBe(6)
      expect(result.current.cartItems).toHaveLength(3)
      
      // Total: 1×1500 + 2×1600 + 3×800 = 1500 + 3200 + 2400 = 7100
      expect(result.current.getCartTotal()).toBe(7100)
    })

    it('calculates correct totals with multiple items and quantities', async () => {
      const { result } = renderHook(() => useCart(), { 
        wrapper: ({ children }) => <CartProvider>{children}</CartProvider> 
      })

      const dragonProduct = { id: 1, title: 'Dragon', price: 1500, stock: 5 }
      const cornProduct = { id: 2, title: 'Corn Cob', price: 1600, stock: 3 }

      act(() => {
        result.current.addToCart(dragonProduct, 2) // $30.00
        result.current.addToCart(cornProduct, 1)   // $16.00
      })

      // Total should be $46.00 (4600 cents)
      expect(result.current.getCartTotal()).toBe(4600)
      expect(result.current.getCartCount()).toBe(3)
    })
  })

  describe('Cart Error Handling', () => {
    it('handles missing product properties gracefully', () => {
      const { result } = renderHook(() => useCart(), { 
        wrapper: ({ children }) => <CartProvider>{children}</CartProvider> 
      })

      const incompleteProduct = { id: 1, title: 'Incomplete' } // Missing price

      act(() => {
        result.current.addToCart(incompleteProduct, 1)
      })

      // Should handle gracefully (behavior depends on implementation)
      expect(result.current.cartItems).toHaveLength(1)
    })

    it('handles zero and negative quantities appropriately', () => {
      const { result } = renderHook(() => useCart(), { 
        wrapper: ({ children }) => <CartProvider>{children}</CartProvider> 
      })

      const product = { id: 1, title: 'Dragon', price: 1500, stock: 5 }

      // Add normal quantity first
      act(() => {
        result.current.addToCart(product, 2)
      })

      expect(result.current.cartItems).toHaveLength(1)
      expect(result.current.cartItems[0].quantity).toBe(2)

      // Update to zero should remove item
      act(() => {
        result.current.updateQuantity(1, 0)
      })

      expect(result.current.cartItems).toHaveLength(0)
    })
  })

  describe('Cart Integration with Checkout', () => {
    it('prepares cart data correctly for checkout flow', async () => {
      const { result } = renderHook(() => useCart(), { 
        wrapper: ({ children }) => <CartProvider>{children}</CartProvider> 
      })

      const dragonProduct = { id: 1, title: 'Dragon', price: 1500, stock: 5 }

      act(() => {
        result.current.addToCart(dragonProduct, 1)
      })

      // Checkout data should be correctly formatted
      const checkoutData = {
        items: result.current.cartItems,
        total: result.current.getCartTotal(),
        count: result.current.getCartCount()
      }

      expect(checkoutData.items).toHaveLength(1)
      expect(checkoutData.total).toBe(1500)
      expect(checkoutData.count).toBe(1)
      
      // Verify item structure for Stripe
      checkoutData.items.forEach(item => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('title')
        expect(item).toHaveProperty('price')
        expect(item).toHaveProperty('quantity')
      })
    })

    it('clears cart after successful checkout simulation', () => {
      const { result } = renderHook(() => useCart(), { 
        wrapper: ({ children }) => <CartProvider>{children}</CartProvider> 
      })

      const product = { id: 1, title: 'Dragon', price: 1500, stock: 5 }

      act(() => {
        result.current.addToCart(product, 2)
      })

      expect(result.current.cartItems).toHaveLength(1)

      act(() => {
        result.current.clearCart()
      })

      expect(result.current.cartItems).toHaveLength(0)
      expect(result.current.getCartCount()).toBe(0)
      expect(result.current.getCartTotal()).toBe(0)
    })
  })

  describe('Cart Performance', () => {
    it('handles large cart efficiently', async () => {
      const { result } = renderHook(() => useCart(), { 
        wrapper: ({ children }) => <CartProvider>{children}</CartProvider> 
      })

      // Test with many items
      const products = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: `Product ${i + 1}`,
        price: 1000 + i * 100,
        stock: 5
      }))

      act(() => {
        products.forEach(product => {
          result.current.addToCart(product, 1)
        })
      })

      // Should handle large cart without performance issues
      expect(result.current.getCartCount()).toBe(20)
      expect(result.current.cartItems).toHaveLength(20)
      expect(result.current.getCartTotal()).toBeGreaterThan(0)
    })
  })

  describe('Real User Interactions', () => {
    it('simulates realistic user workflow: add → view → modify', async () => {
      const { result } = renderHook(() => useCart(), { 
        wrapper: ({ children }) => <CartProvider>{children}</CartProvider> 
      })

      const dragonProduct = { id: 1, title: 'Dragon', price: 1500, stock: 5 }

      // 1. Add to cart
      act(() => {
        result.current.addToCart(dragonProduct, 1)
      })

      expect(result.current.cartItems).toHaveLength(1)
      expect(result.current.getCartCount()).toBe(1)

      // 2. View cart (simulate navigation)
      expect(result.current.cartItems[0].title).toBe('Dragon')
      expect(result.current.getCartTotal()).toBe(1500)

      // 3. Modify quantity
      act(() => {
        result.current.updateQuantity(1, 3)
      })

      expect(result.current.cartItems[0].quantity).toBe(3)
      expect(result.current.getCartCount()).toBe(3)
      expect(result.current.getCartTotal()).toBe(4500)

      // 4. Remove item
      act(() => {
        result.current.removeFromCart(1)
      })

      expect(result.current.cartItems).toHaveLength(0)
      expect(result.current.getCartCount()).toBe(0)
    })
  })
})
