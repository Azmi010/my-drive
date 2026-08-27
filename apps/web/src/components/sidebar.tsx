"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderOpen, Keyboard, LogOut, Search, Star, Trash2 } from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { ShortcutsDialog } from "./shortcuts-dialog";
import { ThemeToggle } from "./theme-toggle";

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
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/drive") {
      return pathname === "/drive" || pathname.startsWith("/drive/");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col bg-white shadow-[1px_0_4px_rgba(0,0,0,0.03)] dark:bg-stone-950 md:flex">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:bg-sky-400/10 dark:text-sky-400">
            <FolderOpen className="size-5" />
          </div>
          <div>
            <Link
              href="/drive"
              className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100"
            >
              MyDrive
            </Link>
            <p className="text-[10px] text-stone-400">Cloud Storage</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="mt-2 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-stone-800 text-white shadow-xs dark:bg-stone-100 dark:text-stone-900"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-stone-100"
                }`}
              >
                <Icon
                  className={`size-4.5 ${
                    active ? "text-white dark:text-stone-900" : "text-stone-400 dark:text-stone-500"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions and user profile */}
        <div className="mt-auto border-t border-stone-100 p-3 dark:border-stone-800/80">
          {/* Theme switcher */}
          <div className="mb-2">
            <ThemeToggle mode="desktop" showLabels />
          </div>

          {/* Shortcuts trigger */}
          <button
            type="button"
            onClick={() => setShortcutsOpen(true)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-stone-200"
          >
            <div className="flex items-center gap-2">
              <Keyboard className="size-3.5" />
              <span>Pintasan Keyboard</span>
            </div>
            <kbd className="rounded border border-stone-200 bg-stone-50 px-1 font-mono text-[10px] dark:border-stone-800 dark:bg-stone-800">
              ?
            </kbd>
          </button>

          {/* User profile */}
          <div className="mt-2 flex items-center justify-between rounded-xl border border-stone-200/60 bg-stone-50/60 p-2.5 dark:border-stone-800/60 dark:bg-stone-900/40">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-blue-400 text-xs font-bold text-white shadow-2xs">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-stone-900 dark:text-stone-100">
                  {user?.name || "Pengguna"}
                </p>
                <p className="truncate text-[10px] text-stone-400">{user?.email || ""}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Keluar"
              className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              aria-label="Keluar"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-stone-200/80 bg-white/90 px-2 py-1.5 shadow-lg backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-950/90 md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px] transition-colors ${
                active
                  ? "font-semibold text-sky-500 dark:text-sky-400"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              }`}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <Link
          href="/search"
          className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px] transition-colors ${
            pathname === "/search"
              ? "font-semibold text-sky-500 dark:text-sky-400"
              : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          }`}
        >
          <Search className="size-5" />
          <span>Cari</span>
        </Link>

        <ThemeToggle mode="mobile" />
      </nav>

      {/* Global Shortcuts Dialog */}
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </>
  );
}
