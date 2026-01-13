import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'
import React from 'react'

/**
 * Tests for ErrorBoundary component
 * 
 * This tests the newly added ErrorBoundary component to ensure it properly
 * catches errors and displays fallback UI.
 * 
 * Safe addition: Tests new error boundary functionality without affecting existing code.
 */

// Component that throws an error for testing
const ThrowError = () => {
  throw new Error('Test error')
}

// Component that renders normally
const NormalComponent = () => <div>Normal content</div>

describe('ErrorBoundary component', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })

  it('should catch errors and display fallback UI', () => {
    // Suppress console.error for this test since we expect an error
    const originalError = console.error
    console.error = () => {}

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    // Check for error boundary fallback UI
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/encountered an unexpected error/i)).toBeInTheDocument()

    // Restore console.error
    console.error = originalError
  })

  it('should have a reload button in fallback UI', () => {
    const originalError = console.error
    console.error = () => {}

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()

    console.error = originalError
  })
})
