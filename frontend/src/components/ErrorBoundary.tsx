import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-6 bg-slate-900 border border-slate-800 rounded-3xl text-center shadow-xl">
          <div className="text-4xl mb-3">🛡️</div>
          <h3 className="text-xl font-bold font-outfit text-white mb-2">Analysis Display Shielded</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
            An unexpected format was received from the scan service. Your session is safe.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg active:scale-95"
          >
            Retry Display
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
