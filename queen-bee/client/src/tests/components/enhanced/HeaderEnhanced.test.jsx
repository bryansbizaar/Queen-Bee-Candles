// HeaderEnhanced.test.jsx - Advanced Header Component Testing
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

// Import enhanced testing utilities
import { enhancedTestUtils } from '../../setup/enhancedTestSetup'

// Import existing cart test utilities
import { CartProvider } from '../../../context/CartContext'

// Import component
import Header from '../../../components/Header'

// Test wrapper that includes cart context and routing
const TestWrapper = ({ children }) => {
  return (
    <BrowserRouter>
      <CartProvider>
        {children}
      </CartProvider>
    </BrowserRouter>
  )
}

// Add PropTypes validation
TestWrapper.propTypes = {
  children: PropTypes.node.isRequired,
}

describe('HeaderEnhanced - Advanced Navigation Tests', () => {
  beforeEach(() => {
    enhancedTestUtils.simulateDesktop()
  })

  test('handles menu toggle interactions', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    const menuToggle = screen.getByLabelText(/toggle menu/i)
    expect(menuToggle).toBeInTheDocument()
    
    await user.click(menuToggle)
    
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  test('provides navigation through all links', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    const homeLink = screen.getByRole('link', { name: /home/i })
    const aboutLink = screen.getByRole('link', { name: /about/i })
    const contactLink = screen.getByRole('link', { name: /contact/i })
    
    expect(homeLink).toBeInTheDocument()
    expect(aboutLink).toBeInTheDocument()
    expect(contactLink).toBeInTheDocument()
    
    await user.click(homeLink)
    expect(homeLink).toBeInTheDocument()
  })

  test('handles mobile menu interactions', async () => {
    enhancedTestUtils.simulateMobile()
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    const menuButton = screen.getByLabelText(/toggle menu/i)
    expect(menuButton).toBeInTheDocument()
    
    await user.click(menuButton)
    
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  test('maintains header structure across interactions', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    const logo = screen.getByAltText(/queen bee candles logo/i)
    expect(logo).toBeInTheDocument()
    
    const cartLinks = screen.getAllByRole('link')
    const cartLink = cartLinks.find(link => link.getAttribute('href') === '/cart')
    expect(cartLink).toBeInTheDocument()
    
    await user.click(cartLink)
    
    expect(logo).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  test('cart badge updates when items are added', async () => {
    // Mock localStorage to simulate cart with items
    const mockCartItems = [
      { id: 1, name: 'Test Candle', price: 25, quantity: 2 },
      { id: 2, name: 'Another Candle', price: 30, quantity: 1 }
    ]
    
    // Mock localStorage.getItem to return our test cart
    window.localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(mockCartItems))
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Check cart badge shows correct count (2 + 1 = 3)
    await waitFor(() => {
      // Look for cart badge elements by class
      const cartBadgeElements = document.querySelectorAll('.cart-badge')
      expect(cartBadgeElements.length).toBeGreaterThan(0)
      
      // Check that at least one badge shows the correct count
      const badgeWithCount = Array.from(cartBadgeElements).some(badge => badge.textContent === '3')
      expect(badgeWithCount).toBe(true)
    }, { timeout: 5000 })
  })

  test('menu closes when navigation links are clicked', async () => {
    enhancedTestUtils.simulateMobile()
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Open mobile menu
    const menuToggle = screen.getByLabelText(/toggle menu/i)
    await user.click(menuToggle)
    
    // Verify menu is open
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('is-open')
    
    // Click a navigation link
    const aboutLink = screen.getByRole('link', { name: /about/i })
    await user.click(aboutLink)
    
    // Verify menu is closed
    expect(nav).not.toHaveClass('is-open')
  })
})

describe('HeaderEnhanced - Accessibility Tests', () => {
  test('has proper ARIA labels and semantic structure', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Check semantic HTML structure
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    
    const navigation = screen.getByRole('navigation')
    expect(navigation).toBeInTheDocument()
    
    // Check menu toggle has proper ARIA label
    const menuToggle = screen.getByLabelText(/toggle menu/i)
    expect(menuToggle).toBeInTheDocument()
    
    // Check logo has proper alt text
    const logo = screen.getByAltText(/queen bee candles logo/i)
    expect(logo).toBeInTheDocument()
    
    // Check all navigation links are accessible
    const homeLink = screen.getByRole('link', { name: /home/i })
    const aboutLink = screen.getByRole('link', { name: /about/i })
    const contactLink = screen.getByRole('link', { name: /contact/i })
    
    expect(homeLink).toBeInTheDocument()
    expect(aboutLink).toBeInTheDocument()
    expect(contactLink).toBeInTheDocument()
  })
})

describe('HeaderEnhanced - Responsive Design Tests', () => {
  test('displays cart icon correctly on mobile and desktop', () => {
    // Test mobile view
    enhancedTestUtils.simulateMobile()
    
    const { rerender } = render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // On mobile, cart should be in mobile-cart container
    const mobileCartContainer = document.querySelector('.mobile-cart')
    expect(mobileCartContainer).toBeInTheDocument()
    
    // Test desktop view
    enhancedTestUtils.simulateDesktop()
    
    rerender(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Cart icon should be in navigation
    const cartNavItem = document.querySelector('.cart-nav-item')
    expect(cartNavItem).toBeInTheDocument()
    
    // Cart links should be present (one in mobile, one in nav)
    const cartLinks = screen.getAllByRole('link')
    const cartLinksToCart = cartLinks.filter(link => link.getAttribute('href') === '/cart')
    expect(cartLinksToCart.length).toBeGreaterThan(0)
  })
})
