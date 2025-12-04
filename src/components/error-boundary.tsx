'use client';

import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console for debugging
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-3xl font-bold text-white">
              Something went wrong
            </h1>
            <p className="mb-6 text-neutral-400">
              An unexpected error occurred. The error details have been logged.
            </p>
            {this.state.error && (
              <details className="mb-6 rounded border border-neutral-700 bg-neutral-900/50 p-4 text-left">
                <summary className="cursor-pointer font-mono text-sm text-neutral-300">
                  Error details (click to expand)
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-neutral-400">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-2 text-sm font-medium text-white"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
