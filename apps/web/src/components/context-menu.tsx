"use client";

import { useEffect, useRef } from "react";
import { Download, Eye, FolderOpen, Move, Pencil, RotateCcw, Star, Trash2 } from "lucide-react";

import type { DriveItem } from "@/lib/types";

export interface ContextMenuActions {
  onOpen: (item: DriveItem) => void;
  onRename: (item: DriveItem) => void;
  onMove: (item: DriveItem) => void;
  onStar: (item: DriveItem) => void;
  onDelete: (item: DriveItem) => void;
  onDownload?: (item: DriveItem) => void;
  onRestore?: (item: DriveItem) => void;
}

interface ContextMenuProps extends ContextMenuActions {
  item: DriveItem;
  x: number;
  y: number;
  onClose: () => void;
  mode?: "normal" | "trash";
}

export function ContextMenu({
  item,
  x,
  y,
  onClose,
  mode = "normal",
  ...actions
}: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [onClose]);

  const isFolder = item.type === "folder";
  const starred = item.data.starred;

  // Ensure menu stays within window bounds on desktop & mobile
  const menuWidth = 220;
  const menuHeight = 280;
  const menuX = Math.max(
    12,
    Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 1000) - menuWidth - 12),
  );
  const menuY = Math.max(
    12,
    Math.min(y, (typeof window !== "undefined" ? window.innerHeight : 800) - menuHeight - 12),
  );

  const items: { label: string; icon: React.ReactNode; danger?: boolean; onClick: () => void }[] =
    mode === "trash"
      ? [
          {
            label: isFolder ? "Buka Folder" : "Pratinjau File",
            icon: isFolder ? <FolderOpen className="size-4" /> : <Eye className="size-4" />,
            onClick: () => {
              actions.onOpen(item);
              onClose();
            },
          },
          ...(actions.onRestore
            ? [
                {
                  label: "Pulihkan",
                  icon: <RotateCcw className="size-4 text-emerald-500" />,
                  onClick: () => {
                    actions.onRestore?.(item);
                    onClose();
                  },
                },
              ]
            : []),
          {
            label: "Hapus Permanen",
            danger: true,
            icon: <Trash2 className="size-4" />,
            onClick: () => {
              actions.onDelete(item);
              onClose();
            },
          },
        ]
      : [
          {
            label: isFolder ? "Buka Folder" : "Pratinjau File",
            icon: isFolder ? <FolderOpen className="size-4" /> : <Eye className="size-4" />,
            onClick: () => {
              actions.onOpen(item);
              onClose();
            },
          },
          {
            label: starred ? "Batal Berbintang" : "Tandai Bintang",
            icon: <Star className={`size-4 ${starred ? "fill-amber-400 text-amber-400" : ""}`} />,
            onClick: () => {
              actions.onStar(item);
              onClose();
            },
          },
          {
            label: "Ganti Nama",
            icon: <Pencil className="size-4" />,
            onClick: () => {
              actions.onRename(item);
              onClose();
            },
          },
          {
            label: "Pindahkan ke...",
            icon: <Move className="size-4" />,
            onClick: () => {
              actions.onMove(item);
              onClose();
            },
          },
          ...(actions.onDownload && !isFolder
            ? [
                {
                  label: "Unduh File",
                  icon: <Download className="size-4 text-blue-500" />,
                  onClick: () => {
                    actions.onDownload?.(item);
                    onClose();
                  },
                },
              ]
            : []),
          {
            label: "Hapus",
            danger: true,
            icon: <Trash2 className="size-4" />,
            onClick: () => {
              actions.onDelete(item);
              onClose();
            },
          },
        ];

  return (
    <>
      {/* Invisible backdrop for touch / mobile dismiss */}
      <div
        className="fixed inset-0 z-50 bg-black/10 backdrop-blur-2xs"
        onClick={onClose}
        onTouchStart={onClose}
      />
      <div
        ref={ref}
        className="fixed z-50 w-56 rounded-2xl border border-zinc-200/90 bg-white/95 p-1.5 shadow-xl backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-150 dark:border-zinc-800/90 dark:bg-zinc-950/95"
        style={{ left: menuX, top: menuY }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-100 px-3 py-2 dark:border-zinc-800/70">
          <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {item.data.name}
          </p>
        </div>
        <div className="mt-1 space-y-0.5">
          {items.map((entry) => (
            <button
              key={entry.label}
              type="button"
              onClick={entry.onClick}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
                entry.danger
                  ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
              }`}
            >
              {entry.icon}
              <span>{entry.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
