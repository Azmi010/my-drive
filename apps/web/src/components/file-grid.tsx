"use client";

import { useState } from "react";
import { FolderOpen, Inbox } from "lucide-react";

import type { DriveItem, ViewMode } from "@/lib/types";
import { ContextMenu, type ContextMenuActions } from "./context-menu";
import { DriveItem as DriveItemView } from "./drive-item";

interface FileGridProps extends ContextMenuActions {
  items: DriveItem[];
  view: ViewMode;
  onOpen: (item: DriveItem) => void;
  mode?: "normal" | "trash";
}

export function FileGrid({ items, view, onOpen, mode = "normal", ...actions }: FileGridProps) {
  const [menu, setMenu] = useState<{ item: DriveItem; x: number; y: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleContextMenu(e: React.MouseEvent, item: DriveItem) {
    e.preventDefault();
    setSelectedId(item.data.id);
    setMenu({ item, x: e.clientX, y: e.clientY });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
        <Inbox className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
        <p className="text-sm text-zinc-500">Tidak ada item di sini</p>
      </div>
    );
  }

  return (
    <div onClick={() => setSelectedId(null)}>
      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <DriveItemView
              key={`${item.type}-${item.data.id}`}
              item={item}
              view="grid"
              selected={selectedId === item.data.id}
              onOpen={onOpen}
              onContextMenu={handleContextMenu}
              onToggleStar={actions.onStar}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-500">
            <span className="flex-1 pl-9">Nama</span>
            <span className="hidden w-24 text-right sm:block">Ukuran</span>
            <span className="hidden w-24 text-right md:block">Diubah</span>
            <span className="w-8" />
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
            {items.map((item) => (
              <DriveItemView
                key={`${item.type}-${item.data.id}`}
                item={item}
                view="list"
                selected={selectedId === item.data.id}
                onOpen={onOpen}
                onContextMenu={handleContextMenu}
                onToggleStar={actions.onStar}
              />
            ))}
          </div>
        </div>
      )}

      {menu && (
        <ContextMenu
          item={menu.item}
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          onOpen={onOpen}
          onRename={actions.onRename}
          onMove={actions.onMove}
          onStar={actions.onStar}
          onDelete={actions.onDelete}
          onDownload={actions.onDownload}
          onRestore={actions.onRestore}
          mode={mode}
        />
      )}

      {items.length > 0 && (
        <div className="pointer-events-none mt-4 hidden items-center gap-1 text-xs text-zinc-400">
          <FolderOpen className="h-3 w-3" />
          Klik dua kali untuk membuka
        </div>
      )}
    </div>
  );
}
