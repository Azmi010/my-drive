"use client";

import { MoreVertical, Star } from "lucide-react";

import type { DriveItem, ViewMode } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/utils";
import { FileTypeIcon, FolderTypeIcon } from "./file-icon";

interface DriveItemProps {
  item: DriveItem;
  view: ViewMode;
  selected?: boolean;
  onOpen: (item: DriveItem) => void;
  onContextMenu: (e: React.MouseEvent, item: DriveItem) => void;
  onToggleStar: (item: DriveItem) => void;
  onSelect?: (item: DriveItem) => void;
}

export function DriveItem({
  item,
  view,
  selected = false,
  onOpen,
  onContextMenu,
  onToggleStar,
  onSelect,
}: DriveItemProps) {
  const isFolder = item.type === "folder";
  const icon = isFolder ? (
    <FolderTypeIcon className="size-8 sm:size-10 shrink-0" />
  ) : (
    <FileTypeIcon file={item.data} className="size-8 sm:size-10 shrink-0" />
  );

  function handleTriggerMenu(e: React.MouseEvent) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onContextMenu(
      {
        preventDefault: () => {},
        clientX: rect.left,
        clientY: rect.bottom + 4,
      } as unknown as React.MouseEvent,
      item,
    );
  }

  function handleClick(e: React.MouseEvent) {
    if (onSelect) {
      onSelect(item);
    }
  }

  if (view === "list") {
    return (
      <div
        tabIndex={0}
        role="button"
        className={`group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 outline-none transition-all hover:bg-zinc-100/80 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-zinc-800/60 dark:focus-visible:ring-zinc-600 ${
          selected ? "bg-zinc-100 dark:bg-zinc-800/80 ring-1 ring-zinc-300 dark:ring-zinc-700" : ""
        }`}
        onClick={handleClick}
        onDoubleClick={() => onOpen(item)}
        onContextMenu={(e) => onContextMenu(e, item)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(item);
          }
        }}
      >
        <span className="shrink-0">{icon}</span>
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-900 dark:text-zinc-100 sm:text-sm">
          {item.data.name}
        </span>
        <span className="hidden w-24 shrink-0 text-right text-xs text-zinc-400 dark:text-zinc-500 sm:block">
          {isFolder ? "—" : formatBytes(item.data.size)}
        </span>
        <span className="hidden w-28 shrink-0 text-right text-xs text-zinc-400 dark:text-zinc-500 md:block">
          {formatDate(item.data.updatedAt)}
        </span>
        <div className="flex items-center gap-1">
          <StarToggleButton item={item} onClick={onToggleStar} />
          <button
            type="button"
            onClick={handleTriggerMenu}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
            aria-label="Menu opsi"
          >
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      role="button"
      className={`group relative flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border p-4 text-center outline-none transition-all hover:bg-zinc-100/70 hover:shadow-xs focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-zinc-800/50 dark:focus-visible:ring-zinc-600 ${
        selected
          ? "border-zinc-300 bg-zinc-100 shadow-xs dark:border-zinc-700 dark:bg-zinc-800/80"
          : "border-zinc-200/70 bg-white dark:border-zinc-800/60 dark:bg-zinc-950/60"
      }`}
      onClick={handleClick}
      onDoubleClick={() => onOpen(item)}
      onContextMenu={(e) => onContextMenu(e, item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(item);
        }
      }}
    >
      {/* Top right quick actions */}
      <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <StarToggleButton item={item} onClick={onToggleStar} />
        <button
          type="button"
          onClick={handleTriggerMenu}
          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          aria-label="Menu opsi"
        >
          <MoreVertical className="size-4" />
        </button>
      </div>

      <div className="mt-1 flex items-center justify-center">{icon}</div>

      <span className="w-full truncate text-xs font-medium text-zinc-900 dark:text-zinc-100 sm:text-sm">
        {item.data.name}
      </span>
    </div>
  );
}

function StarToggleButton({
  item,
  onClick,
}: {
  item: DriveItem;
  onClick: (item: DriveItem) => void;
}) {
  const starred = item.data.starred;
  return (
    <button
      type="button"
      aria-label={starred ? "Batal tandai" : "Tandai"}
      onClick={(e) => {
        e.stopPropagation();
        onClick(item);
      }}
      className={`rounded-lg p-1 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
        starred ? "text-amber-400" : "text-zinc-300 dark:text-zinc-600"
      }`}
    >
      <Star className="size-4" fill={starred ? "currentColor" : "none"} />
    </button>
  );
}
