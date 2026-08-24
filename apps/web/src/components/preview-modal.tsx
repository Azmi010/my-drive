"use client";

import { useEffect, useRef, useState } from "react";
import { Download, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import { api } from "@/lib/api";
import type { DriveFile, PreviewResponse } from "@/lib/types";
import { errorMessage, formatBytes } from "@/lib/utils";
import { SkeletonPreview } from "./skeleton";

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
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/85 p-3 backdrop-blur-xs animate-in fade-in-50 duration-200 sm:p-6"
      onClick={onClose}
    >
      <div className="mb-3 flex items-center justify-between gap-4 text-white">
        <div className="flex min-w-0 items-center gap-2.5">
          <h2 className="truncate text-sm font-semibold sm:text-base">{file.name}</h2>
          <span className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-xs text-zinc-300">
            {formatBytes(file.size)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => api.downloadFile(file.id)}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
            title="Unduh file"
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Unduh</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Tutup"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {error ? (
          <ErrorState message={error} onDownload={() => api.downloadFile(file.id)} />
        ) : preview === null ? (
          <SkeletonPreview />
        ) : preview.kind === "image" ? (
          <ZoomableImage src={preview.url} alt={file.name} />
        ) : preview.kind === "pdf" ? (
          <iframe src={preview.url} title={file.name} className="h-full w-full rounded-2xl" />
        ) : preview.kind === "video" ? (
          <video src={preview.url} controls className="max-h-full max-w-full rounded-xl" autoPlay />
        ) : preview.kind === "audio" ? (
          <div className="flex flex-col items-center gap-4 p-8">
            <div className="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <audio src={preview.url} controls className="w-full max-w-lg" />
            </div>
          </div>
        ) : preview.kind === "text" ? (
          <TextContent file={file} preview={preview} content={content} />
        ) : (
          <Unsupported file={file} />
        )}
      </div>
    </div>
  );
}

function isMarkdown(file: DriveFile, preview: PreviewResponse): boolean {
  const ext = (file.extension ?? "").replace(/^\./, "").toLowerCase();
  return ext === "md" || ext === "markdown" || preview.mimeType === "text/markdown";
}

function TextContent({
  file,
  preview,
  content,
}: {
  file: DriveFile;
  preview: PreviewResponse;
  content: string | null;
}) {
  if (content === null) {
    return (
      <div className="flex flex-col items-center gap-2 text-zinc-400">
        <SkeletonPreview />
      </div>
    );
  }

  if (isMarkdown(file, preview)) {
    return (
      <div className="h-full w-full overflow-auto p-4 sm:p-8">
        <div className="markdown-body mx-auto max-w-3xl rounded-xl bg-zinc-900/60 p-6 text-zinc-100">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  const ext = (file.extension ?? file.name.split(".").pop() ?? "").toLowerCase();
  const language = detectLanguage(ext, preview.mimeType);

  return (
    <div className="h-full w-full overflow-auto p-4 sm:p-6">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-zinc-800">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: "0.85rem",
            background: "#09090b",
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

function detectLanguage(ext: string, mime: string): string {
  const map: Record<string, string> = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    json: "json",
    html: "html",
    css: "css",
    scss: "scss",
    sql: "sql",
    sh: "bash",
    bash: "bash",
    yml: "yaml",
    yaml: "yaml",
    xml: "xml",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    go: "go",
    rs: "rust",
    php: "php",
    rb: "ruby",
  };
  return map[ext] || mime.split("/")[1] || "text";
}

function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });

  function zoomIn() {
    setScale((s) => Math.min(s * 1.3, 5));
  }

  function zoomOut() {
    setScale((s) => {
      const next = s / 1.3;
      if (next <= 1) {
        setPos({ x: 0, y: 0 });
        return 1;
      }
      return next;
    });
  }

  function reset() {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }

  function onPointerDown(e: React.PointerEvent) {
    if (scale <= 1) return;
    setPanning(true);
    startRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!panning) return;
    setPos({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y });
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!panning) return;
    setPanning(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  }

  function onDoubleClick() {
    if (scale > 1) {
      reset();
    } else {
      setScale(2);
    }
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Floating Zoom Controls */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/10 bg-zinc-900/90 px-3 py-1.5 text-white shadow-xl backdrop-blur-md">
        <button
          type="button"
          onClick={zoomOut}
          disabled={scale <= 1}
          aria-label="Perkecil"
          className="rounded-lg p-1.5 transition-colors hover:bg-white/10 disabled:opacity-30"
        >
          <ZoomOut className="size-4" />
        </button>
        <button
          type="button"
          onClick={zoomIn}
          disabled={scale >= 5}
          aria-label="Perbesar"
          className="rounded-lg p-1.5 transition-colors hover:bg-white/10 disabled:opacity-30"
        >
          <ZoomIn className="size-4" />
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset zoom"
          className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
        >
          <RotateCcw className="size-4" />
        </button>
        <span className="w-12 text-center font-mono text-xs tabular-nums">
          {Math.round(scale * 100)}%
        </span>
      </div>

      <div
        className={`select-none ${
          scale > 1 ? (panning ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
        }`}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          transition: panning ? undefined : "transform 100ms ease-out",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="max-h-[75vh] max-w-[85vw] object-contain"
        />
      </div>
    </div>
  );
}

function Unsupported({ file }: { file: DriveFile }) {
  return (
    <div className="flex flex-col items-center gap-3 p-8 text-center">
      <p className="text-sm text-zinc-400">Pratinjau tidak tersedia untuk jenis berkas ini.</p>
      <button
        type="button"
        onClick={() => api.downloadFile(file.id)}
        className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
      >
        <Download className="size-4" />
        Unduh Berkas
      </button>
    </div>
  );
}

function ErrorState({ message, onDownload }: { message: string; onDownload: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-8 text-center">
      <p className="text-sm text-red-400">{message}</p>
      <button
        type="button"
        onClick={onDownload}
        className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
      >
        <Download className="size-4" />
        Unduh Berkas
      </button>
    </div>
  );
}
