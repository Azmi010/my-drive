"use client";

import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  badge?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  badge,
  action,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center px-4 py-16 text-center animate-in fade-in-50 duration-300 ${className}`}
    >
      <div className="relative mb-4 flex items-center justify-center">
        {/* Soft background glow */}
        <div className="absolute size-24 rounded-full bg-gradient-to-b from-amber-500/10 to-transparent blur-xl dark:from-amber-400/10" />
        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-zinc-200/80 bg-zinc-50 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/80">
          <Icon className="size-8 text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
        </div>
      </div>

      {badge && (
        <span className="mb-2 rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          {badge}
        </span>
      )}

      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 sm:text-lg">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-sm">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
