"use client";

import { useEffect, useRef, useState } from "react";
import { Download, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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
          <ZoomableImage src={preview.url} alt={file.name} />
        ) : preview.kind === "pdf" ? (
          <iframe src={preview.url} title={file.name} className="h-full w-full" />
        ) : preview.kind === "video" ? (
          <video src={preview.url} controls className="max-h-full max-w-full" />
        ) : preview.kind === "audio" ? (
          <audio src={preview.url} controls className="w-full max-w-lg" />
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
    return <p className="text-sm text-zinc-400">Memuat konten...</p>;
  }

  if (isMarkdown(file, preview)) {
    return (
      <div className="h-full w-full overflow-auto">
        <div className="markdown-body mx-auto max-w-3xl p-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto">
      <SyntaxHighlighter
        language={languageFromExtension(file.extension, preview.mimeType) ?? "text"}
        style={vscDarkPlus}
        showLineNumbers
        customStyle={{ margin: 0, height: "100%", minWidth: "max-content" }}
      >
        {content.length > 0 ? content : `(file kosong / tidak bisa dibaca) - ${file.name}`}
      </SyntaxHighlighter>
    </div>
  );
}

const EXTENSION_LANGUAGE: Record<string, string> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  json: "json",
  xml: "markup",
  html: "markup",
  htm: "markup",
  css: "css",
  yml: "yaml",
  yaml: "yaml",
  py: "python",
  go: "go",
  rs: "rust",
  java: "java",
  c: "c",
  h: "c",
  cpp: "cpp",
  hpp: "cpp",
  cs: "csharp",
  php: "php",
  rb: "ruby",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  sql: "sql",
  toml: "toml",
  ini: "ini",
  env: "ini",
  md: "markdown",
  csv: "csv",
  log: "text",
  txt: "text",
};

function languageFromExtension(extension: string | null, mimeType: string): string | undefined {
  const ext = (extension ?? "").replace(/^\./, "").toLowerCase();
  if (EXTENSION_LANGUAGE[ext]) return EXTENSION_LANGUAGE[ext];

  if (mimeType.includes("javascript")) return "javascript";
  if (mimeType.includes("typescript")) return "typescript";
  if (mimeType.includes("json")) return "json";
  if (mimeType.includes("xml") || mimeType === "text/html") return "markup";
  if (mimeType.includes("css")) return "css";
  if (mimeType.includes("yaml")) return "yaml";
  if (mimeType.includes("python")) return "python";
  if (mimeType.includes("sql")) return "sql";
  if (mimeType.includes("bash") || mimeType.includes("shellscript")) return "bash";

  return undefined;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;

function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startX: 0, startY: 0, px: 0, py: 0 });
  const posRef = useRef(pos);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  function clampScale(n: number) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, +(n * 100).toFixed(0) / 100));
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      setScale((current) => {
        const next = clampScale(e.deltaY < 0 ? current * 1.15 : current / 1.15);
        if (next <= 1 && current > 1) setPos({ x: 0, y: 0 });
        return next;
      });
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (scale <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPanning(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      px: posRef.current.x,
      py: posRef.current.y,
    };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!panning) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({ x: dragRef.current.px + dx, y: dragRef.current.py + dy });
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    setPanning(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function zoomIn() {
    setScale((current) => {
      const next = clampScale(current * 1.2);
      if (next <= 1) setPos({ x: 0, y: 0 });
      return next;
    });
  }

  function zoomOut() {
    setScale((current) => {
      const next = clampScale(current / 1.2);
      if (next <= 1) setPos({ x: 0, y: 0 });
      return next;
    });
  }

  function reset() {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }

  function onDoubleClick() {
    if (scale > 1) {
      reset();
    } else {
      zoomIn();
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full touch-none items-center justify-center overflow-hidden"
    >
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg border border-white/10 bg-black/60 px-1.5 py-1 text-white backdrop-blur">
        <button
          type="button"
          onClick={zoomOut}
          aria-label="Perkecil"
          className="rounded-md p-1.5 hover:bg-white/10"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={zoomIn}
          aria-label="Perbesar"
          className="rounded-md p-1.5 hover:bg-white/10"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset zoom"
          className="rounded-md p-1.5 hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <span className="w-10 text-center text-xs tabular-nums">{Math.round(scale * 100)}%</span>
      </div>

      <div
        className={`select-none ${scale > 1 ? (panning ? "cursor-grabbing" : "cursor-grab") : "cursor-default"}`}
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
          className="max-h-[75vh] max-w-[80vw] object-contain"
        />
      </div>
    </div>
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
