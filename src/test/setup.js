import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/**
 * Test Setup File
 * 
 * This file runs before all tests and sets up the testing environment.
 * - Imports jest-dom matchers for better assertions (e.g., toBeInTheDocument)
 * - Automatically cleans up after each test to prevent memory leaks
 * 
 * Safe addition: Only affects test environment, not production code.
 */

// Cleanup after each test to prevent memory leaks
afterEach(() => {
  cleanup()
})
