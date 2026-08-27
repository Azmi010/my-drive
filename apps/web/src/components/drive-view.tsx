"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, FolderPlus, LayoutGrid, List, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { DriveFile, DriveFolder, DriveItem, ViewMode } from "@/lib/types";
import { errorMessage } from "@/lib/utils";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Breadcrumb } from "./breadcrumb";
import { ConfirmDialog, CreateFolderDialog, MoveDialog, RenameDialog } from "./dialogs";
import { EmptyState } from "./empty-state";
import { FileGrid } from "./file-grid";
import { PreviewModal } from "./preview-modal";
import { SkeletonView } from "./skeleton";
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
  const [loading, setLoading] = useState(true);
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

  const shortcuts = useMemo(
    () => ({
      "mod+u": () => fileInputRef.current?.click(),
      "mod+shift+n": () => setCreateOpen(true),
      v: () => setView((curr) => (curr === "grid" ? "list" : "grid")),
      r: () => void load(),
    }),
    [load],
  );

  useKeyboardShortcuts(shortcuts);

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
      toast.success(
        starred
          ? `Ditambahkan ke berbintang: ${item.data.name}`
          : `Dihapus dari berbintang: ${item.data.name}`,
      );
    } catch (err) {
      patchItem(item, { starred: !starred });
      toast.error(errorMessage(err));
    }
  }

  async function handleCreateFolder(name: string) {
    await api.createFolder({ name, parentFolderId: folderId });
    toast.success(`Folder "${name}" berhasil dibuat`);
    await load();
  }

  async function handleRename(item: DriveItem, name: string) {
    const result =
      item.type === "folder"
        ? await api.updateFolder(item.data.id, { name })
        : await api.updateFile(item.data.id, { name });
    patchItem(item, { name: result.name });
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
        setFolders((prev) => prev.filter((folder) => folder.id !== item.data.id));
      } else {
        await api.deleteFile(item.data.id);
        setFiles((prev) => prev.filter((file) => file.id !== item.data.id));
      }
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
          toast.success(`${file.name} berhasil diunggah`);
          setTimeout(() => {
            setUploads((prev) => prev.filter((t) => t.id !== id));
          }, 2500);
        })
        .catch((err) => {
          setUploads((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: "error", name: `${t.name}` } : t)),
          );
          toast.error(`Upload ${file.name} gagal: ${errorMessage(err)}`);
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
        <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl border-2 border-dashed border-sky-400 bg-white/80 p-6 backdrop-blur-xs dark:bg-stone-950/80">
          <div className="flex flex-col items-center gap-3 text-sky-500">
            <Upload className="size-10 animate-bounce" />
            <p className="text-sm font-semibold">Lepaskan file di sini untuk mengupload</p>
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-4 dark:border-stone-800/80">
        <Breadcrumb folderId={folderId} />

        <div className="flex items-center gap-2">
          {/* Grid / List Switcher */}
          <div className="flex items-center rounded-xl border border-stone-200/80 bg-stone-100/80 p-0.5 dark:border-stone-800 dark:bg-stone-900/80">
            <button
              type="button"
              aria-label="Tampilan grid"
              title="Tampilan grid (Tekan 'V')"
              onClick={() => changeView("grid")}
              className={`rounded-lg p-1.5 transition-all ${
                view === "grid"
                  ? "bg-white text-stone-900 shadow-2xs dark:bg-stone-800 dark:text-stone-100"
                  : "text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Tampilan daftar"
              title="Tampilan daftar (Tekan 'V')"
              onClick={() => changeView("list")}
              className={`rounded-lg p-1.5 transition-all ${
                view === "list"
                  ? "bg-white text-stone-900 shadow-2xs dark:bg-stone-800 dark:text-stone-100"
                  : "text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              }`}
            >
              <List className="size-4" />
            </button>
          </div>

          <ToolbarButton
            icon={FolderPlus}
            label="Folder Baru"
            shortcut="Ctrl+Shift+N"
            onClick={() => setCreateOpen(true)}
          />

          <ToolbarButton
            icon={Upload}
            label="Upload"
            shortcut="Ctrl+U"
            primary
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

      {/* Main Content Area */}
      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {loading ? (
          <SkeletonView view={view} count={12} />
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              <RefreshCw className="size-3.5" />
              Coba Lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title={folderId ? "Folder ini masih kosong" : "Drive Anda masih kosong"}
            description="Tarik dan lepas file ke sini, atau klik tombol Upload untuk memulai menyimpan dokumen"
            action={
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 sm:text-sm"
              >
                <Upload className="size-4" />
                Upload File Sekarang
              </button>
            }
            secondaryAction={
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 sm:text-sm"
              >
                <FolderPlus className="size-4 text-sky-500" />
                Buat Folder Baru
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
          title="Hapus Item"
          message={
            deleteTarget.type === "folder"
              ? `Folder "${deleteTarget.data.name}" beserta seluruh isinya akan dipindahkan ke Sampah. Lanjutkan?`
              : `File "${deleteTarget.data.name}" akan dipindahkan ke Sampah. Lanjutkan?`
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
  primary = false,
  shortcut,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  primary?: boolean;
  shortcut?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
        primary
          ? "bg-stone-900 text-white shadow-xs hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
          : "border border-stone-200/80 bg-white text-stone-700 shadow-2xs hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
      }`}
    >
      <Icon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
