import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Route-level Error Boundary Component
 * 
 * Similar to the global ErrorBoundary but designed for individual routes.
 * Allows users to navigate back or to home instead of just reloading.
 * 
 * Usage: Wrap individual route components with this boundary
 * Example: <RouteErrorBoundary><YourPage /></RouteErrorBoundary>
 * 
 * Safe addition: Only catches errors in specific routes, doesn't affect
 * other parts of the application.
 */
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleGoBack = () => {
    // Reset error state and use navigate from props
    this.setState({ hasError: false, error: null });
    if (this.props.navigate) {
      this.props.navigate(-1);
    } else {
      window.history.back();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.navigate) {
      this.props.navigate('/');
    } else {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-cyan-400 flex items-center justify-center p-4">
          <div className="max-w-xl w-full">
            <div className="border border-cyan-400/30 rounded-lg p-8 bg-slate-900/50">
              <h2 className="text-2xl font-bold mb-4 text-red-400">
                Page Error
              </h2>
              <p className="text-base mb-6">
                This page encountered an error. You can go back or return to the home page.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6">
                  <summary className="cursor-pointer text-cyan-400 hover:text-cyan-300 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-xs bg-black/50 p-4 rounded overflow-auto max-h-48">
                    <code className="text-red-300">
                      {this.state.error.toString()}
                    </code>
                  </pre>
                </details>
              )}

              <div className="flex gap-4">
                <button
                  onClick={this.handleGoBack}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to inject navigate from useNavigate hook
function RouteErrorBoundaryWrapper({ children }) {
  const navigate = useNavigate();
  return (
    <RouteErrorBoundary navigate={navigate}>
      {children}
    </RouteErrorBoundary>
  );
}

export default RouteErrorBoundaryWrapper;
