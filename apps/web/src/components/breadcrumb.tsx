"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { api } from "@/lib/api";
import type { FolderTreeItem } from "@/lib/types";

export function Breadcrumb({ folderId }: { folderId: string | null }) {
  const [tree, setTree] = useState<FolderTreeItem[]>([]);

  useEffect(() => {
    if (!folderId) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      api
        .getFolderTree(folderId)
        .then((items) => {
          if (!cancelled) setTree(items);
        })
        .catch(() => {
          if (!cancelled) setTree([]);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [folderId]);

  const crumbs = folderId === null ? [] : tree;

  return (
    <nav className="flex min-w-0 items-center text-sm" aria-label="Breadcrumb">
      <Link
        href="/drive"
        className="truncate rounded px-2 py-1 font-medium text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        My Drive
      </Link>
      {crumbs.map((item) => (
        <span key={item.id} className="flex min-w-0 items-center">
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />
          {item.id === folderId ? (
            <span className="truncate px-2 py-1 font-medium text-zinc-900 dark:text-zinc-100">
              {item.name}
            </span>
          ) : (
            <Link
              href={`/drive?folder=${item.id}`}
              className="truncate rounded px-2 py-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              {item.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
