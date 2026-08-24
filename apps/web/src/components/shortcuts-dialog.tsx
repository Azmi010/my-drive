"use client";

import { Keyboard, X } from "lucide-react";
import { useEffect } from "react";

interface ShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    title: "Navigasi & Pencarian",
    shortcuts: [
      { keys: ["Ctrl/⌘", "K"], description: "Fokus ke pencarian" },
      { keys: ["/"], description: "Cari cepat" },
      { keys: ["?"], description: "Buka bantuan pintasan ini" },
      { keys: ["Esc"], description: "Tutup dialog / batal" },
    ],
  },
  {
    title: "Operasi & Tampilan",
    shortcuts: [
      { keys: ["Ctrl/⌘", "U"], description: "Upload file baru" },
      { keys: ["Ctrl/⌘", "Shift", "N"], description: "Buat folder baru" },
      { keys: ["V"], description: "Beralih mode Grid / List" },
      { keys: ["R"], description: "Muat ulang daftar file" },
    ],
  },
  {
    title: "Aksi Item Terpilih",
    shortcuts: [
      { keys: ["Enter"], description: "Buka folder / Pratinjau file" },
      { keys: ["Delete"], description: "Hapus item" },
      { keys: ["F2"], description: "Ganti nama item" },
      { keys: ["S"], description: "Tandai / Hapus bintang" },
      { keys: ["M"], description: "Pindahkan item" },
    ],
  },
];

export function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in-50 duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              <Keyboard className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Pintasan Keyboard
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Gunakan tombol keyboard untuk navigasi cepat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Tutup"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 max-h-[65vh] space-y-5 overflow-y-auto pr-1">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {group.title}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map((sc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300">{sc.description}</span>
                    <div className="flex items-center gap-1">
                      {sc.keys.map((k, ki) => (
                        <kbd
                          key={ki}
                          className="min-w-6 rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-center font-mono text-[11px] font-medium text-zinc-800 shadow-2xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-400 dark:border-zinc-800">
          <span>
            Tekan{" "}
            <kbd className="rounded border bg-zinc-100 px-1 py-0.5 font-mono text-[10px] dark:bg-zinc-800">
              ?
            </kbd>{" "}
            kapan saja untuk membuka
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-900 px-3.5 py-1.5 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
