import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Sapana Park Resident App:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetState = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-100 mb-2">Something unexpected happened</h2>
          <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
            The application encountered a runtime issue. Your cached resident data is preserved.
          </p>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 mb-6 max-w-md w-full text-left font-mono text-[11px] text-rose-300 overflow-x-auto">
            {this.state.error?.message || 'Unknown runtime error'}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReload}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/40 active:scale-95 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload App</span>
            </button>

            <button
              onClick={this.handleResetState}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition"
            >
              <Home className="w-4 h-4" />
              <span>Reset & Reopen</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
