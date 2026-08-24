"use client";

import { useState } from "react";
import { Folder, Loader2, TriangleAlert } from "lucide-react";

import type { DriveFolder } from "@/lib/types";
import { errorMessage } from "@/lib/utils";
import { Modal } from "./modal";

interface DialogFormProps {
  open: boolean;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 shadow-2xs outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-900 dark:focus:ring-zinc-800";

const submitClass =
  "flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200";

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
    <Modal title="Folder Baru" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          autoFocus
          placeholder="Nama folder"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        {error && (
          <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </button>
          <button type="submit" disabled={loading || !name.trim()} className={submitClass}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            <span>Buat Folder</span>
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
    <Modal title="Ganti Nama" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onSelect={(e) => e.currentTarget.select()}
          className={inputClass}
        />
        {error && (
          <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim() || name === initialName}
            className={submitClass}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            <span>Simpan</span>
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
        <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-zinc-200 p-1.5 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
              selected === null
                ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <Folder className="size-4 text-amber-500" />
            <span>My Drive (Utama)</span>
          </button>
          {candidates.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => setSelected(folder.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                selected === folder.id
                  ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Folder className="size-4 text-amber-500" />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </button>
          <button type="submit" disabled={loading} className={submitClass}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            <span>Pindahkan</span>
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
        <div className="flex items-start gap-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <TriangleAlert className="size-5" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{message}</p>
        </div>
        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-red-500 disabled:opacity-50"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
