import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // Also log to console for developer
    // eslint-disable-next-line no-console
    console.error("Uncaught error in React component:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-ivory p-6">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-6 border-2 border-black/10">
            <h2 className="text-2xl font-bold text-gold-dark mb-2">Something went wrong</h2>
            <p className="text-gray-700 mb-4">An unexpected error occurred while rendering the page.</p>
            <details className="text-xs text-gray-600 whitespace-pre-wrap mb-4">
              {String(this.state.error)}
              {this.state.info?.componentStack && "\n\n"}
              {this.state.info?.componentStack}
            </details>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-matte text-white rounded-md font-semibold"
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, info: null })}
                className="px-4 py-2 bg-ivory text-gold-dark rounded-md font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
