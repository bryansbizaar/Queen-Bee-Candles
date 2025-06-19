import '@testing-library/jest-dom'
import { vi } from 'vitest'

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

// Mock Image for image loading tests
globalThis.Image = class {
  constructor() {
    setTimeout(() => {
      this.onload()
    }, 100)
  }
}