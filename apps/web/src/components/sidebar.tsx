"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderOpen, LogOut, Search, Star, Trash2 } from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";

const NAV_ITEMS = [
  { href: "/drive", label: "My Drive", icon: FolderOpen },
  { href: "/starred", label: "Berbintang", icon: Star },
  { href: "/trash", label: "Sampah", icon: Trash2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 md:flex">
        <Link
          href="/drive"
          className="flex items-center gap-2 px-5 py-5 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          <FolderOpen className="h-5 w-5 text-amber-400" />
          MyDrive
        </Link>

        <nav className="mt-2 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800/70 dark:text-zinc-100"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/70"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <div className="mb-2 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {user?.name}
          </div>
          <div className="mb-3 truncate text-xs text-zinc-500">{user?.email}</div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-zinc-200 bg-white py-2 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 text-xs ${
              isActive(item.href) ? "font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-500"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
        <Link
          href="/search"
          className="flex flex-col items-center gap-0.5 px-4 py-1 text-xs text-zinc-500"
        >
          <Search className="h-5 w-5" />
          Cari
        </Link>
      </nav>
    </>
  );
}
