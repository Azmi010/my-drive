"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!user) {
      void fetchMe();
    }
  }, [token, user, fetchMe, router]);

  if (!token) return null;

  return <>{user ? children : null}</>;
}
