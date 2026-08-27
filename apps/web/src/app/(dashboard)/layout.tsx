import { AuthGuard } from "@/components/auth-guard";
import { ErrorBoundary } from "@/components/error-boundary";
import { SearchBar } from "@/components/search-bar";
import { Sidebar } from "@/components/sidebar";
import { FolderOpen } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen bg-stone-50/40 text-stone-900 transition-colors dark:bg-stone-950 dark:text-stone-100">
      <AuthGuard>
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-white/80 px-4 py-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] backdrop-blur-md dark:bg-stone-950/80 sm:px-6">
            {/* Mobile Brand Logo */}
            <div className="flex items-center gap-2 md:hidden">
              <Link href="/drive" className="flex items-center gap-1.5 font-bold tracking-tight">
                <FolderOpen className="size-5 text-sky-500" />
                <span className="text-sm">MyDrive</span>
              </Link>
            </div>

            {/* Centered / Expanded Search Bar */}
            <div className="flex flex-1 items-center justify-end md:max-w-md md:justify-start">
              <SearchBar className="w-full max-w-md" />
            </div>
          </header>

          {/* Main Page Area */}
          <div className="flex min-h-0 flex-1 flex-col p-4 pb-24 sm:p-6 md:pb-6 lg:p-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </div>
      </AuthGuard>
    </main>
  );
}
