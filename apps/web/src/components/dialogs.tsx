"use client";

import { useState } from "react";
import { Folder, TriangleAlert } from "lucide-react";

import type { DriveFolder } from "@/lib/types";
import { errorMessage } from "@/lib/utils";
import { Modal } from "./modal";

interface DialogFormProps {
  open: boolean;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";

const submitClass =
  "rounded-md bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";

export function CreateFolderDialog({
  open,
  onClose,
  onSubmit,
}: DialogFormProps & { onSubmit: (name: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(name.trim());
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Folder baru" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          autoFocus
          placeholder="Nama folder"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </button>
          <button type="submit" disabled={loading || !name.trim()} className={submitClass}>
            Buat
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function RenameDialog({
  open,
  onClose,
  initialName,
  onSubmit,
}: DialogFormProps & { initialName: string; onSubmit: (name: string) => Promise<void> }) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name === initialName) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(name.trim());
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Ganti nama" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onSelect={(e) => e.currentTarget.select()}
          className={inputClass}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim() || name === initialName}
            className={submitClass}
          >
            Simpan
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function MoveDialog({
  open,
  onClose,
  folders,
  currentFolderId,
  onSubmit,
}: DialogFormProps & {
  folders: DriveFolder[];
  currentFolderId: string | null;
  onSubmit: (parentFolderId: string | null) => Promise<void>;
}) {
  const [selected, setSelected] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const candidates = folders.filter((folder) => folder.id !== currentFolderId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(selected);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Pindahkan ke" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="max-h-64 overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
              selected === null ? "bg-zinc-100 dark:bg-zinc-800" : ""
            }`}
          >
            <Folder className="h-4 w-4 text-amber-400" />
            My Drive
          </button>
          {candidates.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => setSelected(folder.id)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                selected === folder.id ? "bg-zinc-100 dark:bg-zinc-800" : ""
              }`}
            >
              <Folder className="h-4 w-4 text-amber-400" />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </button>
          <button type="submit" disabled={loading} className={submitClass}>
            Pindahkan
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  confirmLabel = "Hapus",
  loading,
  onConfirm,
}: DialogFormProps & {
  title: string;
  message: string;
  confirmLabel?: string;
  loading: boolean;
  onConfirm: () => Promise<void>;
}) {
  async function handleConfirm() {
    await onConfirm();
    onClose();
  }

  return (
    <Modal title={title} open={open} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <TriangleAlert className="h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{message}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
