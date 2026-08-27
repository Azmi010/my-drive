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

  function handleClick() {
    if (onSelect) {
      onSelect(item);
    }
  }

  if (view === "list") {
    return (
      <div
        tabIndex={0}
        role="button"
        className={`group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 outline-none transition-all hover:bg-stone-100/80 focus-visible:ring-2 focus-visible:ring-stone-400 dark:hover:bg-stone-800/60 dark:focus-visible:ring-stone-600 ${
          selected
            ? "bg-stone-100 dark:bg-stone-800/80 ring-1 ring-stone-300 dark:ring-stone-700"
            : ""
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
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-stone-900 dark:text-stone-100 sm:text-sm">
          {item.data.name}
        </span>
        <span className="hidden w-24 shrink-0 text-right text-xs text-stone-400 dark:text-stone-500 sm:block">
          {isFolder ? "—" : formatBytes(item.data.size)}
        </span>
        <span className="hidden w-28 shrink-0 text-right text-xs text-stone-400 dark:text-stone-500 md:block">
          {formatDate(item.data.updatedAt)}
        </span>
        <div className="flex items-center gap-1">
          <StarToggleButton item={item} onClick={onToggleStar} />
          <button
            type="button"
            onClick={handleTriggerMenu}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 dark:hover:bg-stone-700 dark:hover:text-stone-200"
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
      className={`group relative flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl p-4 text-center outline-none shadow-sm transition-all duration-200 hover:bg-stone-100/70 hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-stone-400 dark:hover:bg-stone-800/50 dark:focus-visible:ring-stone-600 ${
        selected
          ? "bg-stone-100 ring-1 ring-stone-300 dark:bg-stone-800/80 dark:ring-stone-700"
          : "bg-white dark:bg-stone-950/60"
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
          className="rounded-lg p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-700 dark:hover:bg-stone-700 dark:hover:text-stone-200"
          aria-label="Menu opsi"
        >
          <MoreVertical className="size-4" />
        </button>
      </div>

      <div className="mt-1 flex items-center justify-center">{icon}</div>

      <span className="w-full truncate text-xs font-medium text-stone-900 dark:text-stone-100 sm:text-sm">
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
      className={`rounded-lg p-1 transition-colors hover:bg-stone-200 dark:hover:bg-stone-700 ${
        starred ? "text-amber-400" : "text-stone-300 dark:text-stone-600"
      }`}
    >
      <Star className="size-4" fill={starred ? "currentColor" : "none"} />
    </button>
  );
}
