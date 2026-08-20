"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, LayoutGrid, List, LoaderCircle, RefreshCw, Upload } from "lucide-react";

import { api } from "@/lib/api";
import type { DriveFile, DriveFolder, DriveItem, ViewMode } from "@/lib/types";
import { errorMessage } from "@/lib/utils";
import { Breadcrumb } from "./breadcrumb";
import { ConfirmDialog, CreateFolderDialog, MoveDialog, RenameDialog } from "./dialogs";
import { FileGrid } from "./file-grid";
import { PreviewModal } from "./preview-modal";
import { UploadProgress, type UploadTask } from "./upload-progress";

interface DriveViewProps {
  folderId: string | null;
}

interface ActionItem {
  kind: "rename" | "move" | "delete";
  item: DriveItem;
}

export function DriveView({ folderId }: DriveViewProps) {
  const router = useRouter();
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<ViewMode>(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("mydrive-view") as ViewMode) === "list"
        ? "list"
        : "grid"
      : "grid",
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [action, setAction] = useState<ActionItem | null>(null);
  const [moveFolders, setMoveFolders] = useState<DriveFolder[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);

  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadId = useRef(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [folderResult, fileResult] = await Promise.all([
        api.listFolders({ folderId: folderId ?? undefined }),
        api.listFiles({ folderId: folderId ?? undefined }),
      ]);
      setFolders(folderResult);
      setFiles(fileResult);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    localStorage.setItem("mydrive-view", view);
  }, [view]);

  function changeView(next: ViewMode) {
    setView(next);
  }

  function openItem(item: DriveItem) {
    if (item.type === "folder") {
      router.push(`/drive?folder=${item.data.id}`);
    } else {
      setPreviewFile(item.data);
    }
  }

  function patchItem(item: DriveItem, update: Partial<DriveFile> | Partial<DriveFolder>) {
    if (item.type === "folder") {
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === item.data.id ? { ...folder, ...(update as Partial<DriveFolder>) } : folder,
        ),
      );
    } else {
      setFiles((prev) =>
        prev.map((file) =>
          file.id === item.data.id ? { ...file, ...(update as Partial<DriveFile>) } : file,
        ),
      );
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
    patchItem(item, { starred });
    try {
      const result = await target;
      patchItem(item, { starred: result.starred });
    } catch (err) {
      patchItem(item, { starred: !starred });
      setError(errorMessage(err));
    }
  }

  async function handleCreateFolder(name: string) {
    await api.createFolder({ name, parentFolderId: folderId });
    await load();
  }

  async function handleRename(item: DriveItem, name: string) {
    const result =
      item.type === "folder"
        ? await api.updateFolder(item.data.id, { name })
        : await api.updateFile(item.data.id, { name });
    patchItem(item, { name: result.name });
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
        setFolders((prev) => prev.filter((folder) => folder.id !== item.data.id));
      } else {
        await api.deleteFile(item.data.id);
        setFiles((prev) => prev.filter((file) => file.id !== item.data.id));
      }
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

  function uploadFiles(fileList: File[]) {
    for (const file of fileList) {
      const id = ++uploadId.current;
      const task: UploadTask = { id, name: file.name, progress: 0, status: "uploading" };
      setUploads((prev) => [...prev, task]);
      api
        .uploadFile(file, {
          folderId,
          onProgress: (progress) => {
            setUploads((prev) => prev.map((t) => (t.id === id ? { ...t, progress } : t)));
          },
        })
        .then((created) => {
          setUploads((prev) =>
            prev.map((t) => (t.id === id ? { ...t, progress: 100, status: "done" } : t)),
          );
          setFiles((prev) => [created, ...prev]);
          setTimeout(() => {
            setUploads((prev) => prev.filter((t) => t.id !== id));
          }, 2500);
        })
        .catch((err) => {
          setUploads((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: "error", name: `${t.name}` } : t)),
          );
          setError(`Upload ${file.name} gagal: ${errorMessage(err)}`);
          setTimeout(() => {
            setUploads((prev) => prev.filter((t) => t.id !== id));
          }, 4000);
        });
    }
  }

  function handleInputFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > 0) uploadFiles(selected);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files ?? []);
    if (dropped.length > 0) uploadFiles(dropped);
  }

  const items: DriveItem[] = [
    ...folders.map((folder): DriveItem => ({ type: "folder", data: folder })),
    ...files.map((file): DriveItem => ({ type: "file", data: file })),
  ];

  const renameTarget = action?.kind === "rename" ? action.item : null;
  const moveTarget = action?.kind === "move" ? action.item : null;
  const deleteTarget = action?.kind === "delete" ? action.item : null;

  return (
    <div
      className={`relative flex min-h-0 flex-1 flex-col ${dragging ? "pointer-events-none" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {dragging && (
        <div className="absolute inset-0 z-30 flex items-center justify-center rounded-xl border-2 border-dashed border-zinc-400 bg-white/60 backdrop-blur-sm dark:bg-zinc-900/60">
          <div className="flex flex-col items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <Upload className="h-8 w-8" />
            <p className="text-sm font-medium">Lepaskan untuk mengupload</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <Breadcrumb folderId={folderId} />
        <div className="flex items-center gap-1.5">
          <div className="mr-1 flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
            <button
              type="button"
              aria-label="Tampilan grid"
              onClick={() => changeView("grid")}
              className={`rounded-md p-1.5 ${
                view === "grid"
                  ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-zinc-500"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Tampilan daftar"
              onClick={() => changeView("list")}
              className={`rounded-md p-1.5 ${
                view === "list"
                  ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-zinc-500"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <ToolbarButton
            icon={FolderPlus}
            label="Folder baru"
            onClick={() => setCreateOpen(true)}
          />
          <ToolbarButton
            icon={Upload}
            label="Upload"
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleInputFiles}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {loading ? (
          <div className="flex flex-col items-center gap-2 py-16 text-zinc-400">
            <LoaderCircle className="h-8 w-8 animate-spin" />
            <p className="text-sm">Memuat...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="flex items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
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

      {createOpen && (
        <CreateFolderDialog
          open
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreateFolder}
        />
      )}

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
          message={
            deleteTarget.type === "folder"
              ? `Folder "${deleteTarget.data.name}" beserta semua isinya akan dihapus permanen. Lanjutkan?`
              : `File "${deleteTarget.data.name}" akan dihapus. Lanjutkan?`
          }
          loading={actionLoading}
          onClose={() => setAction(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}

      <PreviewModal key={previewFile?.id} file={previewFile} onClose={() => setPreviewFile(null)} />

      <UploadProgress tasks={uploads} />
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
