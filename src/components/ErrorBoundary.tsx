import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <p className="font-display text-xl text-[#f0ede8]">Something went wrong</p>
            <p className="text-[#6e6b65] text-sm">Please refresh the page to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#d4a853] hover:bg-[#e0bb64] text-[#0d0d12] text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
