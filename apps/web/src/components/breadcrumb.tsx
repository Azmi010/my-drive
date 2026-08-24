"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Folder } from "lucide-react";

import { api } from "@/lib/api";
import type { FolderTreeItem } from "@/lib/types";
import { SkeletonBreadcrumb } from "./skeleton";

export function Breadcrumb({ folderId }: { folderId: string | null }) {
  const [tree, setTree] = useState<FolderTreeItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!folderId) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      api
        .getFolderTree(folderId)
        .then((items) => {
          if (!cancelled) setTree(items);
        })
        .catch(() => {
          if (!cancelled) setTree([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [folderId]);

  if (loading && folderId) {
    return <SkeletonBreadcrumb />;
  }

  const crumbs = folderId === null ? [] : tree;

  return (
    <nav
      className="flex min-w-0 max-w-full items-center overflow-x-auto py-1 text-sm no-scrollbar"
      aria-label="Breadcrumb"
    >
      <Link
        href="/drive"
        className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <Folder className="size-4 text-amber-500" />
        <span>My Drive</span>
      </Link>
      {crumbs.map((item) => (
        <div key={item.id} className="flex shrink-0 items-center">
          <ChevronRight className="size-4 shrink-0 text-zinc-400 dark:text-zinc-600" />
          {item.id === folderId ? (
            <span className="max-w-[160px] truncate px-2 py-1 font-semibold text-zinc-900 dark:text-zinc-100 sm:max-w-[240px]">
              {item.name}
            </span>
          ) : (
            <Link
              href={`/drive?folder=${item.id}`}
              className="max-w-[120px] truncate rounded-lg px-2 py-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:max-w-[180px]"
            >
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
