"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeToggle({
  mode = "desktop",
  showLabels = false,
}: {
  mode?: "desktop" | "mobile" | "compact";
  showLabels?: boolean;
}) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (!mounted) {
    // Skeleton placeholder to prevent layout shift & hydration mismatch
    if (mode === "compact") {
      return <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800" />;
    }
    if (mode === "mobile") {
      return (
        <div className="flex flex-col items-center gap-1 px-3 py-1">
          <div className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-[10px] text-zinc-400">Tema</span>
        </div>
      );
    }
    return (
      <div className="mx-3 my-2 flex h-8 items-center justify-between rounded-lg bg-zinc-100 px-1 dark:bg-zinc-900" />
    );
  }

  const isDark = (resolvedTheme || theme) === "dark";

  function toggleQuick() {
    setTheme(isDark ? "light" : "dark");
  }

  if (mode === "compact") {
    return (
      <button
        type="button"
        onClick={toggleQuick}
        title={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-blue-400" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </button>
    );
  }

  if (mode === "mobile") {
    return (
      <button
        type="button"
        onClick={toggleQuick}
        className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        aria-label="Toggle tema"
      >
        <div className="relative flex h-5 w-5 items-center justify-center">
          {isDark ? (
            <Moon className="h-4 w-4 text-blue-400 transition-transform duration-300" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500 transition-transform duration-300" />
          )}
        </div>
        <span className="text-[10px] font-medium">{isDark ? "Gelap" : "Terang"}</span>
      </button>
    );
  }

  // Desktop segmented control (Light | System | Dark)
  return (
    <div className="mx-3 my-1">
      <div className="flex items-center justify-between rounded-lg border border-zinc-200/80 bg-zinc-100/80 p-0.5 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-400">
        <button
          type="button"
          onClick={() => setTheme("light")}
          title="Mode Terang"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 transition-all ${
            theme === "light"
              ? "bg-white font-medium text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
              : "hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Sun className={`h-3.5 w-3.5 ${theme === "light" ? "text-amber-500" : ""}`} />
          {showLabels && <span>Terang</span>}
        </button>

        <button
          type="button"
          onClick={() => setTheme("system")}
          title="Ikuti Sistem"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 transition-all ${
            theme === "system"
              ? "bg-white font-medium text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
              : "hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Laptop className={`h-3.5 w-3.5 ${theme === "system" ? "text-blue-500" : ""}`} />
          {showLabels && <span>Sistem</span>}
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          title="Mode Gelap"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 transition-all ${
            theme === "dark"
              ? "bg-white font-medium text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
              : "hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Moon className={`h-3.5 w-3.5 ${theme === "dark" ? "text-blue-400" : ""}`} />
          {showLabels && <span>Gelap</span>}
        </button>
      </div>
    </div>
  );
}
