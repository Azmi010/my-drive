"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, LayoutGrid, List, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { DriveFile, DriveItem, ViewMode } from "@/lib/types";
import { errorMessage } from "@/lib/utils";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ConfirmDialog } from "./dialogs";
import { EmptyState } from "./empty-state";
import { FileGrid } from "./file-grid";
import { PreviewModal } from "./preview-modal";
import { SkeletonView } from "./skeleton";

export function TrashView() {
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
  const [deleteTarget, setDeleteTarget] = useState<DriveItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.listTrash();
      const trash: DriveItem[] = [
        ...result.folders.map((folder): DriveItem => ({ type: "folder", data: folder })),
        ...result.files.map((file): DriveItem => ({ type: "file", data: file })),
      ];
      setItems(trash);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (item.type === "folder") return;
    setPreviewFile(item.data);
  }

  async function handleRestore(item: DriveItem) {
    try {
      if (item.type === "folder") {
        await api.restoreTrashFolder(item.data.id);
      } else {
        await api.restoreTrashFile(item.data.id);
      }
      setItems((prev) => prev.filter((i) => i.data.id !== item.data.id));
      toast.success(`"${item.data.name}" berhasil dipulihkan`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function handleDelete(item: DriveItem) {
    setActionLoading(true);
    try {
      if (item.type === "folder") {
        await api.deleteTrashFolder(item.data.id);
      } else {
        await api.deleteTrashFile(item.data.id);
      }
      setItems((prev) => prev.filter((i) => i.data.id !== item.data.id));
      setDeleteTarget(null);
      toast.success(`"${item.data.name}" berhasil dihapus permanen`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-4 dark:border-zinc-800/80">
        <h1 className="flex items-center gap-2.5 text-base font-bold text-zinc-900 dark:text-zinc-100 sm:text-lg">
          <Trash2 className="size-5 text-zinc-500" />
          <span>Sampah</span>
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
            icon={Trash2}
            title="Sampah masih kosong"
            description="Item yang dihapus dari My Drive akan dipindahkan ke sini sebelum dapat dihapus secara permanen"
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
            mode="trash"
            onOpen={openItem}
            onStar={() => {}}
            onRename={() => {}}
            onMove={() => {}}
            onDelete={(item) => setDeleteTarget(item)}
            onRestore={(item) => void handleRestore(item)}
          />
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          open
          title="Hapus Permanen"
          message={`"${deleteTarget.data.name}" akan dihapus permanen dari server dan tidak dapat dipulihkan lagi. Lanjutkan?`}
          confirmLabel="Hapus Permanen"
          loading={actionLoading}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}

      <PreviewModal key={previewFile?.id} file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
