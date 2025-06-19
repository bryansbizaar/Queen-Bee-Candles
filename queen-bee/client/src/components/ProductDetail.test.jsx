import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from '../context/CartContext'
import ProductDetail from './ProductDetail'
import useCart from '../context/useCart'

// Mock window.alert
const mockAlert = vi.fn()
globalThis.alert = mockAlert

// Mock fetch
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' })
  }
})

// Test component to display cart state
const CartDisplay = () => {
  const { cartItems, getCartCount, getCartTotal } = useCart()
  
  return (
    <div data-testid="cart-display">
      <div data-testid="cart-count">{getCartCount()}</div>
      <div data-testid="cart-total">{getCartTotal()}</div>
      <div data-testid="cart-items">
        {cartItems.map(item => (
          <div key={item.id} data-testid={`cart-item-${item.id}`}>
            {item.title} - Qty: {item.quantity} - Price: {item.price}
          </div>
        ))}
      </div>
    </div>
  )
}

const TestWrapper = () => (
  <BrowserRouter>
    <CartProvider>
      <ProductDetail />
      <CartDisplay />
    </CartProvider>
  </BrowserRouter>
)

const mockProduct = {
  id: 1,
  title: 'Honey Lavender Candle',
  price: 3500,
  description: 'A soothing blend of honey and lavender',
  image: 'honey-lavender.jpg'
}

describe('ProductDetail Integration Tests', () => {
  beforeEach(() => {
    mockAlert.mockClear()
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads product successfully and displays details', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct
    })

    render(<TestWrapper />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Honey Lavender Candle')).toBeInTheDocument()
    })

    expect(screen.getByText('$35.00')).toBeInTheDocument()
    expect(screen.getByText('A soothing blend of honey and lavender')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'http://localhost:8080/images/honey-lavender.jpg')
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Honey Lavender Candle')
  })

  it('handles API error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Product not found'))

    render(<TestWrapper />)

    await waitFor(() => {
      expect(screen.getByText('Error: Product not found')).toBeInTheDocument()
    })

    expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument()
  })

  it('handles 404 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    })

    render(<TestWrapper />)

    await waitFor(() => {
      expect(screen.getByText('Error: Product not found')).toBeInTheDocument()
    })
  })

  it('adds product to cart with default quantity', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct
    })

    render(<TestWrapper />)

    await waitFor(() => {
      expect(screen.getByText('Honey Lavender Candle')).toBeInTheDocument()
    })

    const addToCartButton = screen.getByText('Add to Cart')
    await user.click(addToCartButton)

    expect(mockAlert).toHaveBeenCalledWith('Added 1 Honey Lavender Candle to cart!')
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('3500')
    expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Honey Lavender Candle - Qty: 1 - Price: 3500')
  })

  it('adds same product multiple times and increases quantity', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct
    })

    render(<TestWrapper />)

    await waitFor(() => {
      expect(screen.getByText('Honey Lavender Candle')).toBeInTheDocument()
    })

    const addToCartButton = screen.getByText('Add to Cart')
    
    await user.click(addToCartButton)
    await user.click(addToCartButton)

    expect(mockAlert).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId('cart-count')).toHaveTextContent('2')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('7000')
    expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Honey Lavender Candle - Qty: 2 - Price: 3500')
  })

  it('makes correct API call with product ID', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct
    })

    render(<TestWrapper />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/products/1')
    })
  })

  it('has proper form accessibility', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct
    })

    render(<TestWrapper />)

    await waitFor(() => {
      expect(screen.getByText('Honey Lavender Candle')).toBeInTheDocument()
    })

    const quantityInput = screen.getByLabelText('Quantity:')
    expect(quantityInput).toHaveAttribute('type', 'number')
    expect(quantityInput).toHaveAttribute('min', '1')
    expect(quantityInput).toHaveAttribute('id', 'quantity')
    expect(quantityInput).toHaveAttribute('name', 'quantity')

    const addButton = screen.getByText('Add to Cart')
    expect(addButton.tagName).toBe('BUTTON')
  })

  it('displays proper heading hierarchy', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct
    })

    render(<TestWrapper />)

    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: 'Honey Lavender Candle' })
      expect(heading.tagName).toBe('H1')
    })
  })

  it('handles network errors during fetch', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<TestWrapper />)

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument()
    })
  })

  it('does not allow adding to cart when product fails to load', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Product not found'))

    render(<TestWrapper />)

    await waitFor(() => {
      expect(screen.getByText('Error: Product not found')).toBeInTheDocument()
    })

    expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Quantity:')).not.toBeInTheDocument()
  })
})