import { describe, it, expect } from 'vitest'
import { cn } from '../lib/utils'

/**
 * Tests for cn utility function
 * 
 * This tests existing working code to ensure the cn (className) utility
 * function works correctly. It merges Tailwind CSS classes using clsx and tailwind-merge.
 * 
 * Safe addition: Only tests existing code behavior, doesn't modify functionality.
 */
describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-4', 'py-2')
    expect(result).toBe('px-4 py-2')
  })

  it('should handle conditional classes', () => {
    const result = cn('base-class', false && 'hidden', 'visible')
    expect(result).toBe('base-class visible')
  })

  it('should merge conflicting Tailwind classes correctly', () => {
    // tailwind-merge should keep the last value for conflicting classes
    const result = cn('px-2', 'px-4')
    expect(result).toBe('px-4')
  })

  it('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle null and undefined inputs', () => {
    const result = cn('text-base', null, undefined, 'text-sm')
    expect(result).toBe('text-sm')
  })
})
