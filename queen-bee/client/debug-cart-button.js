// Debug script to check if cart button is visible
console.log('🔍 Checking cart button visibility...');

// Check if cart button exists
const cartButton = document.querySelector('[data-testid="cart-button"]');
console.log('Cart button found:', cartButton);

if (cartButton) {
  // Check visibility
  const styles = window.getComputedStyle(cartButton);
  console.log('Button styles:', {
    display: styles.display,
    visibility: styles.visibility,
    opacity: styles.opacity,
    position: styles.position,
    zIndex: styles.zIndex
  });
  
  // Check if it's actually visible
  const rect = cartButton.getBoundingClientRect();
  console.log('Button position:', {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    isVisible: rect.width > 0 && rect.height > 0
  });
  
  // Check parent elements
  console.log('Parent elements:', {
    parentVisible: cartButton.parentElement?.offsetParent !== null,
    inViewport: rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth
  });
} else {
  console.log('❌ Cart button not found!');
}
