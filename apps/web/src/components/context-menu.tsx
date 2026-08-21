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
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
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

  const menuX = Math.min(x, window.innerWidth - 220);
  const menuY = Math.min(y, window.innerHeight - 240);

  const items: { label: string; icon: React.ReactNode; danger?: boolean; onClick: () => void }[] =
    mode === "trash"
      ? [
          {
            label: isFolder ? "Buka" : "Pratinjau",
            icon: isFolder ? <FolderOpen className="h-4 w-4" /> : <Eye className="h-4 w-4" />,
            onClick: () => {
              actions.onOpen(item);
              onClose();
            },
          },
          ...(actions.onRestore
            ? [
                {
                  label: "Pulihkan",
                  icon: <RotateCcw className="h-4 w-4" />,
                  onClick: () => {
                    actions.onRestore?.(item);
                    onClose();
                  },
                },
              ]
            : []),
          {
            label: "Hapus permanen",
            danger: true,
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => {
              actions.onDelete(item);
              onClose();
            },
          },
        ]
      : [
          {
            label: isFolder ? "Buka" : "Pratinjau",
            icon: isFolder ? <FolderOpen className="h-4 w-4" /> : <Eye className="h-4 w-4" />,
            onClick: () => {
              actions.onOpen(item);
              onClose();
            },
          },
          {
            label: starred ? "Batal tandai" : "Tandai",
            icon: <Star className="h-4 w-4" fill={starred ? "currentColor" : "none"} />,
            onClick: () => {
              actions.onStar(item);
              onClose();
            },
          },
          {
            label: "Ganti nama",
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => {
              actions.onRename(item);
              onClose();
            },
          },
          {
            label: "Pindahkan ke...",
            icon: <Move className="h-4 w-4" />,
            onClick: () => {
              actions.onMove(item);
              onClose();
            },
          },
          ...(actions.onDownload && !isFolder
            ? [
                {
                  label: "Unduh",
                  icon: <Download className="h-4 w-4" />,
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
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => {
              actions.onDelete(item);
              onClose();
            },
          },
        ];

  return (
    <div
      ref={ref}
      className="fixed z-50 w-52 rounded-lg border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
      style={{ left: menuX, top: menuY }}
    >
      <p className="truncate border-b border-zinc-100 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800">
        {item.data.name}
      </p>
      {items.map((entry) => (
        <button
          key={entry.label}
          type="button"
          onClick={entry.onClick}
          className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
            entry.danger ? "text-red-600 dark:text-red-400" : ""
          }`}
        >
          {entry.icon}
          {entry.label}
        </button>
      ))}
    </div>
  );
}
