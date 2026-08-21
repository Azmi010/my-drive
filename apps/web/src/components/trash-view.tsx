"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, RefreshCw, Trash2 } from "lucide-react";

import { api } from "@/lib/api";
import type { DriveFile, DriveItem, ViewMode } from "@/lib/types";
import { errorMessage } from "@/lib/utils";
import { ConfirmDialog } from "./dialogs";
import { FileGrid } from "./file-grid";
import { PreviewModal } from "./preview-modal";

export function TrashView() {
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(false);
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
    } catch (err) {
      setError(errorMessage(err));
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
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <Trash2 className="h-5 w-5 text-zinc-400" />
          Sampah
        </h1>
        <div className="flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              view === "grid" ? "bg-zinc-200 dark:bg-zinc-700" : "text-zinc-500"
            }`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              view === "list" ? "bg-zinc-200 dark:bg-zinc-700" : "text-zinc-500"
            }`}
          >
            Daftar
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-zinc-400">
            <LoaderCircle className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <RefreshCw className="h-4 w-4" />
              Coba lagi
            </button>
          </div>
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
          title="Hapus permanen"
          message={`"${deleteTarget.data.name}" akan dihapus permanen dan tidak bisa dipulihkan. Lanjutkan?`}
          confirmLabel="Hapus permanen"
          loading={actionLoading}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}

      <PreviewModal key={previewFile?.id} file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
