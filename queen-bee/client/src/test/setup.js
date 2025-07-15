import '@testing-library/jest-dom'
import { vi, beforeEach, afterEach } from 'vitest'

// Mock fetch for tests
globalThis.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
globalThis.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
globalThis.sessionStorage = sessionStorageMock

// Mock Image for image loading tests
globalThis.Image = class {
  constructor() {
    setTimeout(() => {
      this.onload()
    }, 100)
  }
}

// Mock IntersectionObserver for lazy loading tests
globalThis.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock ResizeObserver for responsive components
globalThis.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock scrollTo for navigation tests
globalThis.scrollTo = vi.fn()

// Mock console methods for cleaner test output
console.error = vi.fn()
console.warn = vi.fn()

// Clean up mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
  
  // Reset localStorage
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  
  // Reset sessionStorage
  sessionStorageMock.getItem.mockClear()
  sessionStorageMock.setItem.mockClear()
  sessionStorageMock.removeItem.mockClear()
  sessionStorageMock.clear.mockClear()
  
  // Reset fetch
  globalThis.fetch.mockClear()
})

afterEach(() => {
  vi.resetAllMocks()
})
