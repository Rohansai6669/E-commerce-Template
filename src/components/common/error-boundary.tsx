'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  name?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Granular React Error Boundary component for wrapping individual UI sections
 * (such as widgets, recommendation carousels, charts, or payment components).
 * Prevents local component errors from taking down the entire page.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`ErrorBoundary caught error in widget [${this.props.name || 'Anonymous'}]:`, error, errorInfo);
    }
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public reset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.reset);
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive shadow-sm my-2">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">
                Failed to load {this.props.name || 'this component'}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {this.state.error.message || 'An unexpected rendering error occurred.'}
              </p>
            </div>
            <button
              onClick={this.reset}
              className="inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1.5 text-xs font-medium text-foreground border border-input shadow-xs hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
