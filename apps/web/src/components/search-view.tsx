"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, RefreshCw, Search } from "lucide-react";

import { api } from "@/lib/api";
import type { DriveFile, DriveFolder, DriveItem, ViewMode } from "@/lib/types";
import { errorMessage, updateDriveItem } from "@/lib/utils";
import { ConfirmDialog, MoveDialog, RenameDialog } from "./dialogs";
import { FileGrid } from "./file-grid";
import { PreviewModal } from "./preview-modal";

export function SearchView({ query }: { query: string }) {
  const router = useRouter();
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
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleRename(item: DriveItem, name: string) {
    const result =
      item.type === "folder"
        ? await api.updateFolder(item.data.id, { name })
        : await api.updateFile(item.data.id, { name });
    setItems((prev) => updateDriveItem(prev, item, { name: result.name }));
  }

  async function openMoveDialog(item: DriveItem) {
    setActionLoading(true);
    try {
      const all = await api.listFolders({ flat: true });
      setMoveFolders(all);
      setAction({ kind: "move", item });
    } catch (err) {
      setError(errorMessage(err));
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
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDownload(item: DriveItem) {
    if (item.type === "folder") return;
    try {
      await api.downloadFile(item.data.id);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const renameTarget = action?.kind === "rename" ? action.item : null;
  const moveTarget = action?.kind === "move" ? action.item : null;
  const deleteTarget = action?.kind === "delete" ? action.item : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h1 className="flex min-w-0 items-center gap-2 text-lg font-semibold">
          <Search className="h-5 w-5 shrink-0 text-zinc-400" />
          <span className="truncate">Hasil untuk &quot;{query}&quot;</span>
        </h1>
        <div className="flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`rounded-md px-3 py-1.5 text-sm ${view === "grid" ? "bg-zinc-200 dark:bg-zinc-700" : "text-zinc-500"}`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-md px-3 py-1.5 text-sm ${view === "list" ? "bg-zinc-200 dark:bg-zinc-700" : "text-zinc-500"}`}
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
          title="Hapus item"
          message={`"${deleteTarget.data.name}" akan dihapus. Lanjutkan?`}
          loading={actionLoading}
          onClose={() => setAction(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}

      <PreviewModal key={previewFile?.id} file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
