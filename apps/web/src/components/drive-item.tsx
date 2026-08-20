"use client";

import { Star } from "lucide-react";

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
}

export function DriveItem({
  item,
  view,
  selected = false,
  onOpen,
  onContextMenu,
  onToggleStar,
}: DriveItemProps) {
  const isFolder = item.type === "folder";
  const icon = isFolder ? (
    <FolderTypeIcon className="h-10 w-10" />
  ) : (
    <FileTypeIcon file={item.data} className="h-10 w-10" />
  );

  if (view === "list") {
    return (
      <div
        className={`group flex cursor-default items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 ${
          selected ? "bg-zinc-100 dark:bg-zinc-800/70" : ""
        }`}
        onDoubleClick={() => onOpen(item)}
        onContextMenu={(e) => onContextMenu(e, item)}
      >
        <span className="shrink-0">{icon}</span>
        <span className="min-w-0 flex-1 truncate text-sm">{item.data.name}</span>
        <span className="hidden w-24 shrink-0 text-right text-xs text-zinc-500 sm:block">
          {isFolder ? "—" : formatBytes(item.data.size)}
        </span>
        <span className="hidden w-24 shrink-0 text-right text-xs text-zinc-500 md:block">
          {formatDate(item.data.updatedAt)}
        </span>
        <StarToggleButton item={item} onClick={onToggleStar} />
      </div>
    );
  }

  return (
    <div
      className={`group relative flex cursor-default flex-col items-center gap-2 rounded-xl border p-4 text-center hover:bg-zinc-100 dark:hover:bg-zinc-800/70 ${
        selected
          ? "border-zinc-400 bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800/70"
          : "border-transparent"
      }`}
      onDoubleClick={() => onOpen(item)}
      onContextMenu={(e) => onContextMenu(e, item)}
    >
      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <StarToggleButton item={item} onClick={onToggleStar} />
      </div>
      {icon}
      <span className="w-full truncate text-sm">{item.data.name}</span>
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
      className={`rounded-md p-1.5 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
        starred ? "text-amber-400" : "text-zinc-300 dark:text-zinc-600"
      }`}
    >
      <Star className="h-4 w-4" fill={starred ? "currentColor" : "none"} />
    </button>
  );
}
