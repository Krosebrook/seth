import { describe, it, expect } from 'vitest'
import { createPageUrl } from './index'

/**
 * Tests for createPageUrl utility function
 * 
 * This tests the existing utility function that converts page names to URLs.
 * It replaces spaces with hyphens for URL-friendly paths.
 * 
 * Safe addition: Only tests existing code behavior, doesn't modify functionality.
 */
describe('createPageUrl utility function', () => {
  it('should create URL from page name with single word', () => {
    const result = createPageUrl('home')
    expect(result).toBe('/home')
  })

  it('should replace spaces with hyphens', () => {
    const result = createPageUrl('about us')
    expect(result).toBe('/about-us')
  })

  it('should handle multiple spaces', () => {
    const result = createPageUrl('contact us today')
    expect(result).toBe('/contact-us-today')
  })

  it('should handle page name with no spaces', () => {
    const result = createPageUrl('dashboard')
    expect(result).toBe('/dashboard')
  })

  it('should handle empty string', () => {
    const result = createPageUrl('')
    expect(result).toBe('/')
  })
})
