import React from 'react';
import Button from '../ui/Button';
import { AlertOctagon } from 'lucide-react';

/**
 * Standard React Class Component Error Boundary to intercept UI runtime exceptions.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-12 border border-secondary-200 dark:border-secondary-800 rounded-2xl bg-white dark:bg-secondary-900 shadow-lg">
          <div className="h-12 w-12 rounded-full bg-error-50 dark:bg-error-950/20 flex items-center justify-center text-error-600 dark:text-error-400 mb-4 animate-bounce">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-6">
            An unexpected error occurred in this view. Please try reloading the page.
          </p>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </Button>
            <Button variant="primary" size="sm" onClick={this.handleReset}>
              Go to Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
