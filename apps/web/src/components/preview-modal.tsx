"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

import { api } from "@/lib/api";
import type { DriveFile, PreviewResponse } from "@/lib/types";
import { errorMessage } from "@/lib/utils";

interface PreviewModalProps {
  file: DriveFile | null;
  onClose: () => void;
}

export function PreviewModal({ file, onClose }: PreviewModalProps) {
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;

    api
      .getFilePreview(file.id)
      .then(async (result) => {
        if (cancelled) return;
        setPreview(result);
        if (result.kind === "text") {
          try {
            const text = await api.getFileContent(file.id);
            if (!cancelled) setContent(text.content);
          } catch {
            // content optional
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      });

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      document.removeEventListener("keydown", onKey);
    };
  }, [file, onClose]);

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 p-4 sm:p-8" onClick={onClose}>
      <div className="mb-3 flex items-center justify-between text-white">
        <h2 className="truncate text-sm font-medium sm:text-base">{file.name}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-2 text-white/80 hover:bg-white/10"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-xl bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {error ? (
          <ErrorState message={error} onDownload={() => api.downloadFile(file.id)} />
        ) : preview === null ? (
          <p className="text-sm text-zinc-400">Memuat...</p>
        ) : preview.kind === "image" ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={preview.url} alt={file.name} className="max-h-full max-w-full object-contain" />
        ) : preview.kind === "pdf" ? (
          <iframe src={preview.url} title={file.name} className="h-full w-full" />
        ) : preview.kind === "video" ? (
          <video src={preview.url} controls className="max-h-full max-w-full" />
        ) : preview.kind === "audio" ? (
          <audio src={preview.url} controls className="w-full max-w-lg" />
        ) : preview.kind === "text" ? (
          <TextContent file={file} content={content} />
        ) : (
          <Unsupported file={file} />
        )}
      </div>
    </div>
  );
}

function TextContent({ file, content }: { file: DriveFile; content: string | null }) {
  if (content === null) {
    return <p className="text-sm text-zinc-400">Memuat konten...</p>;
  }
  return (
    <pre className="h-full w-full overflow-auto whitespace-pre p-4 text-xs leading-relaxed text-zinc-200">
      {content.length > 0 ? content : `(file kosong / tidak bisa dibaca) - ${file.name}`}
    </pre>
  );
}

function Unsupported({ file }: { file: DriveFile }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-sm text-zinc-400">Pratinjau tidak tersedia untuk format ini.</p>
      <button
        type="button"
        onClick={() => api.downloadFile(file.id)}
        className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
      >
        <Download className="h-4 w-4" />
        Unduh file
      </button>
    </div>
  );
}

function ErrorState({ message, onDownload }: { message: string; onDownload: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-sm text-red-400">{message}</p>
      <button
        type="button"
        onClick={onDownload}
        className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
      >
        <Download className="h-4 w-4" />
        Unduh file
      </button>
    </div>
  );
}
