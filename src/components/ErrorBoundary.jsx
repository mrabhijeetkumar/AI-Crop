import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[350px] p-6 sm:p-8 rounded-3xl bg-[#0F0F0F] dark:bg-[#0F0F0F] border border-rose-500/40 text-white flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-8 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Something went wrong in this view</h2>
            <p className="text-xs text-rose-200 mt-1 max-w-md">
              {this.state.error?.message || "An unexpected error occurred during rendering."}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#4ade80] text-slate-950 text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry & Reload View</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
