"use client";

import { useMemo, useState } from "react";
import { FolderOpen, Inbox } from "lucide-react";

import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import type { DriveItem, ViewMode } from "@/lib/types";
import { ContextMenu, type ContextMenuActions } from "./context-menu";
import { DriveItem as DriveItemView } from "./drive-item";
import { EmptyState } from "./empty-state";

interface FileGridProps extends ContextMenuActions {
  items: DriveItem[];
  view: ViewMode;
  onOpen: (item: DriveItem) => void;
  mode?: "normal" | "trash";
}

export function FileGrid({ items, view, onOpen, mode = "normal", ...actions }: FileGridProps) {
  const [menu, setMenu] = useState<{ item: DriveItem; x: number; y: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedItem = useMemo(
    () => items.find((i) => i.data.id === selectedId) ?? null,
    [items, selectedId],
  );

  function handleContextMenu(e: React.MouseEvent, item: DriveItem) {
    e.preventDefault();
    setSelectedId(item.data.id);
    setMenu({ item, x: e.clientX, y: e.clientY });
  }

  function handleSelect(item: DriveItem) {
    setSelectedId(item.data.id);
  }

  // Active keyboard shortcuts for selected item
  const shortcuts = useMemo(
    () => ({
      escape: () => {
        setSelectedId(null);
        setMenu(null);
      },
      delete: () => {
        if (selectedItem) actions.onDelete(selectedItem);
      },
      backspace: () => {
        if (selectedItem) actions.onDelete(selectedItem);
      },
      f2: () => {
        if (selectedItem && mode !== "trash") actions.onRename(selectedItem);
      },
      s: () => {
        if (selectedItem && mode !== "trash") actions.onStar(selectedItem);
      },
      m: () => {
        if (selectedItem && mode !== "trash") actions.onMove(selectedItem);
      },
      enter: () => {
        if (selectedItem) onOpen(selectedItem);
      },
    }),
    [selectedItem, actions, mode, onOpen],
  );

  useKeyboardShortcuts(shortcuts);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={mode === "trash" ? Inbox : FolderOpen}
        title={mode === "trash" ? "Sampah kosong" : "Tidak ada item di sini"}
        description={
          mode === "trash"
            ? "File dan folder yang dihapus akan muncul di sini"
            : "Folder ini belum memiliki file atau subfolder"
        }
      />
    );
  }

  return (
    <div
      className="flex flex-1 flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedId(null);
        }
      }}
    >
      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <DriveItemView
              key={`${item.type}-${item.data.id}`}
              item={item}
              view="grid"
              selected={selectedId === item.data.id}
              onOpen={onOpen}
              onSelect={handleSelect}
              onContextMenu={handleContextMenu}
              onToggleStar={actions.onStar}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xs dark:border-zinc-800/80 dark:bg-zinc-950">
          <div className="flex items-center gap-3 border-b border-zinc-100 bg-zinc-50/50 px-4 py-2.5 text-xs font-medium text-zinc-400 dark:border-zinc-800/60 dark:bg-zinc-900/30">
            <span className="flex-1 pl-9">Nama</span>
            <span className="hidden w-24 text-right sm:block">Ukuran</span>
            <span className="hidden w-28 text-right md:block">Terakhir Diubah</span>
            <span className="w-16" />
          </div>
          <div className="divide-y divide-zinc-100 p-1 dark:divide-zinc-800/50">
            {items.map((item) => (
              <DriveItemView
                key={`${item.type}-${item.data.id}`}
                item={item}
                view="list"
                selected={selectedId === item.data.id}
                onOpen={onOpen}
                onSelect={handleSelect}
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
    </div>
  );
}
