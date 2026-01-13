import React from 'react';

/**
 * Global Error Boundary Component
 * 
 * This component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 * 
 * Safe addition: This is a new component that only catches errors, doesn't modify
 * existing behavior. If no errors occur, the app behaves exactly as before.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console (can be replaced with Sentry or other logging service)
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Store error details in state
    this.setState({
      error,
      errorInfo
    });

    // Future: Send to error tracking service like Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when error occurs
      return (
        <div className="min-h-screen bg-black text-cyan-400 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="border border-cyan-400/30 rounded-lg p-8 bg-slate-900/50">
              <h1 className="text-3xl font-bold mb-4 text-red-400">
                Something went wrong
              </h1>
              <p className="text-lg mb-6">
                The application encountered an unexpected error. Please try refreshing the page.
              </p>
              
              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6">
                  <summary className="cursor-pointer text-cyan-400 hover:text-cyan-300 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-sm bg-black/50 p-4 rounded overflow-auto max-h-96">
                    <code className="text-red-300">
                      {this.state.error.toString()}
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </code>
                  </pre>
                </details>
              )}

              <button
                onClick={() => window.location.reload()}
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
