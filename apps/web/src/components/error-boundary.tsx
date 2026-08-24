"use client";

import { Component, type ReactNode } from "react";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center animate-in fade-in-50">
          <div className="relative mb-4 flex items-center justify-center">
            <div className="absolute size-20 rounded-full bg-red-500/10 blur-xl dark:bg-red-500/20" />
            <div className="relative flex size-16 items-center justify-center rounded-2xl border border-red-200/80 bg-red-50 text-red-600 shadow-xs dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle className="size-8" strokeWidth={1.75} />
            </div>
          </div>

          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 sm:text-lg">
            Terjadi Kesalahan
          </h2>

          <p className="mt-1.5 max-w-md text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-sm">
            {this.state.error?.message || "Gagal memuat komponen. Silakan coba muat ulang halaman."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-xs transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:text-sm"
            >
              <RefreshCw className="size-4" />
              Muat Ulang Halaman
            </button>

            <a
              href="/drive"
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:text-sm"
            >
              <Home className="size-4" />
              Ke My Drive
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
