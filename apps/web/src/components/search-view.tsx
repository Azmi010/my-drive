"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, LayoutGrid, List, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { DriveFile, DriveFolder, DriveItem, ViewMode } from "@/lib/types";
import { errorMessage, updateDriveItem } from "@/lib/utils";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ConfirmDialog, MoveDialog, RenameDialog } from "./dialogs";
import { EmptyState } from "./empty-state";
import { FileGrid } from "./file-grid";
import { PreviewModal } from "./preview-modal";
import { SkeletonView } from "./skeleton";

export function SearchView({ query }: { query: string }) {
  const router = useRouter();
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("mydrive-view") as ViewMode) === "list"
        ? "list"
        : "grid"
      : "grid",
  );
  const [action, setAction] = useState<{
    kind: "rename" | "move" | "delete";
    item: DriveItem;
  } | null>(null);
  const [moveFolders, setMoveFolders] = useState<DriveFolder[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [folderResult, fileResult] = await Promise.all([
        api.listFolders({ search: query }),
        api.listFiles({ search: query }),
      ]);
      setItems([
        ...folderResult.map((folder): DriveItem => ({ type: "folder", data: folder })),
        ...fileResult.map((file): DriveItem => ({ type: "file", data: file })),
      ]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    localStorage.setItem("mydrive-view", view);
  }, [view]);

  const shortcuts = useMemo(
    () => ({
      v: () => setView((curr) => (curr === "grid" ? "list" : "grid")),
      r: () => void load(),
    }),
    [load],
  );

  useKeyboardShortcuts(shortcuts);

  function openItem(item: DriveItem) {
    if (item.type === "folder") {
      router.push(`/drive?folder=${item.data.id}`);
    } else {
      setPreviewFile(item.data);
    }
  }

  async function toggleStar(item: DriveItem) {
    const starred = !item.data.starred;
    const target = starred
      ? item.type === "folder"
        ? api.starFolder(item.data.id)
        : api.starFile(item.data.id)
      : item.type === "folder"
        ? api.unstarFolder(item.data.id)
        : api.unstarFile(item.data.id);
    try {
      const result = await target;
      setItems((prev) => updateDriveItem(prev, item, { starred: result.starred }));
      toast.success(
        starred
          ? `Ditambahkan ke berbintang: ${item.data.name}`
          : `Dihapus dari berbintang: ${item.data.name}`,
      );
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function handleRename(item: DriveItem, name: string) {
    const result =
      item.type === "folder"
        ? await api.updateFolder(item.data.id, { name })
        : await api.updateFile(item.data.id, { name });
    setItems((prev) => updateDriveItem(prev, item, { name: result.name }));
    toast.success(`Nama berhasil diubah menjadi "${result.name}"`);
  }

  async function openMoveDialog(item: DriveItem) {
    setActionLoading(true);
    try {
      const all = await api.listFolders({ flat: true });
      setMoveFolders(all);
      setAction({ kind: "move", item });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMove(item: DriveItem, parentFolderId: string | null) {
    if (item.type === "folder") {
      await api.updateFolder(item.data.id, { parentFolderId });
    } else {
      await api.updateFile(item.data.id, { parentFolderId });
    }
    toast.success(`"${item.data.name}" berhasil dipindahkan`);
    await load();
  }

  async function handleDelete(item: DriveItem) {
    setActionLoading(true);
    try {
      if (item.type === "folder") {
        await api.deleteFolder(item.data.id);
      } else {
        await api.deleteFile(item.data.id);
      }
      setItems((prev) => prev.filter((i) => i.data.id !== item.data.id));
      toast.success(`"${item.data.name}" dipindahkan ke Sampah`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDownload(item: DriveItem) {
    if (item.type === "folder") return;
    try {
      toast.info(`Mengunduh ${item.data.name}...`);
      await api.downloadFile(item.data.id);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const renameTarget = action?.kind === "rename" ? action.item : null;
  const moveTarget = action?.kind === "move" ? action.item : null;
  const deleteTarget = action?.kind === "delete" ? action.item : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-4 dark:border-zinc-800/80">
        <h1 className="flex min-w-0 items-center gap-2.5 text-base font-bold text-zinc-900 dark:text-zinc-100 sm:text-lg">
          <Search className="size-5 shrink-0 text-zinc-400" />
          <span className="truncate">Hasil pencarian untuk &quot;{query}&quot;</span>
        </h1>

        <div className="flex items-center rounded-xl border border-zinc-200/80 bg-zinc-100/80 p-0.5 dark:border-zinc-800 dark:bg-zinc-900/80">
          <button
            type="button"
            aria-label="Tampilan grid"
            title="Tampilan grid (Tekan 'V')"
            onClick={() => setView("grid")}
            className={`rounded-lg p-1.5 transition-all ${
              view === "grid"
                ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Tampilan daftar"
            title="Tampilan daftar (Tekan 'V')"
            onClick={() => setView("list")}
            className={`rounded-lg p-1.5 transition-all ${
              view === "list"
                ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {loading ? (
          <SkeletonView view={view} count={8} />
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <RefreshCw className="size-3.5" />
              Coba Lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Tidak ada hasil ditemukan"
            description={`Tidak ada file atau folder yang cocok dengan kata kunci "${query}". Coba periksa ejaan atau gunakan kata kunci lain.`}
            action={
              <button
                type="button"
                onClick={() => router.push("/drive")}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 sm:text-sm"
              >
                <FolderOpen className="size-4" />
                Kembali ke My Drive
              </button>
            }
          />
        ) : (
          <FileGrid
            items={items}
            view={view}
            onOpen={openItem}
            onStar={toggleStar}
            onRename={(item) => setAction({ kind: "rename", item })}
            onMove={(item) => void openMoveDialog(item)}
            onDelete={(item) => setAction({ kind: "delete", item })}
            onDownload={(item) => void handleDownload(item)}
          />
        )}
      </div>

      {renameTarget && (
        <RenameDialog
          open
          key={renameTarget.data.id}
          initialName={renameTarget.data.name}
          onClose={() => setAction(null)}
          onSubmit={(name) => handleRename(renameTarget, name)}
        />
      )}
      {moveTarget && (
        <MoveDialog
          open
          key={moveTarget.data.id}
          folders={moveFolders}
          currentFolderId={moveTarget.data.id}
          onClose={() => setAction(null)}
          onSubmit={(parentFolderId) => handleMove(moveTarget, parentFolderId)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          open
          title="Hapus Item"
          message={`"${deleteTarget.data.name}" akan dipindahkan ke Sampah. Lanjutkan?`}
          loading={actionLoading}
          onClose={() => setAction(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}

      <PreviewModal key={previewFile?.id} file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
