"use client";

import type { ViewMode } from "@/lib/types";

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-zinc-200/60 bg-zinc-50/50 p-4 transition-all dark:border-zinc-800/60 dark:bg-zinc-900/40"
        >
          <div className="h-12 w-12 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3.5 w-24 max-w-full animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 8 }: { count?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-950">
      <div className="flex items-center gap-3 border-b border-zinc-100 bg-zinc-50/50 px-4 py-2.5 text-xs text-zinc-400 dark:border-zinc-800/60 dark:bg-zinc-900/30">
        <span className="flex-1 pl-8">Nama</span>
        <span className="hidden w-24 text-right sm:block">Ukuran</span>
        <span className="hidden w-28 text-right md:block">Terakhir Diubah</span>
        <span className="w-8" />
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3.5 flex-1 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="hidden h-3 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800 sm:block" />
            <div className="hidden h-3 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800 md:block" />
            <div className="h-4 w-4 shrink-0 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-zinc-200/70 bg-white p-3.5 dark:border-zinc-800/70 dark:bg-zinc-900/40"
        >
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/4 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-2.5 w-1/2 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonBreadcrumb() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-16 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-3.5 w-3.5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export function SkeletonPreview() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="h-16 w-16 animate-pulse rounded-2xl bg-zinc-800" />
      <div className="space-y-2">
        <div className="h-4 w-48 animate-pulse rounded-md bg-zinc-800" />
        <div className="h-3 w-32 animate-pulse rounded-md bg-zinc-800" />
      </div>
    </div>
  );
}

export function SkeletonView({ view = "grid", count = 12 }: { view?: ViewMode; count?: number }) {
  return view === "grid" ? <SkeletonGrid count={count} /> : <SkeletonList count={count} />;
}
