import { AuthGuard } from "@/components/auth-guard";
import { SearchBar } from "@/components/search-bar";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen">
      <AuthGuard>
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="hidden items-center justify-end border-b border-zinc-200 px-6 py-3 dark:border-zinc-800 md:flex">
            <SearchBar />
          </header>
          <div className="flex min-h-0 flex-1 flex-col p-4 pb-24 sm:p-6 md:pb-6">{children}</div>
        </div>
      </AuthGuard>
    </main>
  );
}
