import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught a runtime crash error:", error, errorInfo);
  }

  handleLogout = () => {
    localStorage.clear();
    // Use root redirect path to reset React state cleanly
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cp-bg flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-cp-surface border border-cp-border rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-sm">
            <h2 className="text-lg font-display font-extrabold text-cp-text-primary tracking-tight">
              Something went wrong
            </h2>
            <p className="text-xs text-cp-text-secondary font-medium leading-relaxed">
              An unexpected runtime error occurred. Please try reloading the page or logging out.
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-3 bg-cp-accent text-cp-text-on-accent text-xs font-bold rounded-xl transition-all active:scale-95 shadow-sm"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleLogout}
                className="flex-1 py-2.5 px-3 bg-cp-bg border border-cp-border text-cp-text-primary text-xs font-bold rounded-xl transition-all hover:bg-cp-accent-light"
              >
                Log Out
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
