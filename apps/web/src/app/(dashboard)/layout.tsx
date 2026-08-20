import { AuthGuard } from "@/components/auth-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen">
      <AuthGuard>{children}</AuthGuard>
    </main>
  );
}
