"use client";

import {
  File,
  FileArchive,
  FileCode,
  FileImage,
  FileMusic,
  FileSpreadsheet,
  FileText,
  FileVideoCamera,
  Folder,
  FolderOpen,
  Presentation,
  type LucideIcon,
} from "lucide-react";

import type { DriveFile } from "@/lib/types";

const EXTENSION_ICON: Record<string, { icon: LucideIcon; color: string }> = {
  jpg: { icon: FileImage, color: "text-sky-500" },
  jpeg: { icon: FileImage, color: "text-sky-500" },
  png: { icon: FileImage, color: "text-sky-500" },
  gif: { icon: FileImage, color: "text-sky-500" },
  svg: { icon: FileImage, color: "text-sky-500" },
  webp: { icon: FileImage, color: "text-sky-500" },
  bmp: { icon: FileImage, color: "text-sky-500" },
  heic: { icon: FileImage, color: "text-sky-500" },
  mp4: { icon: FileVideoCamera, color: "text-rose-500" },
  webm: { icon: FileVideoCamera, color: "text-rose-500" },
  mov: { icon: FileVideoCamera, color: "text-rose-500" },
  mkv: { icon: FileVideoCamera, color: "text-rose-500" },
  avi: { icon: FileVideoCamera, color: "text-rose-500" },
  mp3: { icon: FileMusic, color: "text-emerald-500" },
  wav: { icon: FileMusic, color: "text-emerald-500" },
  ogg: { icon: FileMusic, color: "text-emerald-500" },
  flac: { icon: FileMusic, color: "text-emerald-500" },
  m4a: { icon: FileMusic, color: "text-emerald-500" },
  pdf: { icon: FileText, color: "text-red-500" },
  zip: { icon: FileArchive, color: "text-amber-500" },
  rar: { icon: FileArchive, color: "text-amber-500" },
  "7z": { icon: FileArchive, color: "text-amber-500" },
  tar: { icon: FileArchive, color: "text-amber-500" },
  gz: { icon: FileArchive, color: "text-amber-500" },
  csv: { icon: FileSpreadsheet, color: "text-green-600" },
  xls: { icon: FileSpreadsheet, color: "text-green-600" },
  xlsx: { icon: FileSpreadsheet, color: "text-green-600" },
  ppt: { icon: Presentation, color: "text-orange-500" },
  pptx: { icon: Presentation, color: "text-orange-500" },
  js: { icon: FileCode, color: "text-indigo-500" },
  jsx: { icon: FileCode, color: "text-indigo-500" },
  ts: { icon: FileCode, color: "text-indigo-500" },
  tsx: { icon: FileCode, color: "text-indigo-500" },
  py: { icon: FileCode, color: "text-indigo-500" },
  java: { icon: FileCode, color: "text-indigo-500" },
  rb: { icon: FileCode, color: "text-indigo-500" },
  go: { icon: FileCode, color: "text-indigo-500" },
  rs: { icon: FileCode, color: "text-indigo-500" },
  php: { icon: FileCode, color: "text-indigo-500" },
  c: { icon: FileCode, color: "text-indigo-500" },
  cpp: { icon: FileCode, color: "text-indigo-500" },
  cs: { icon: FileCode, color: "text-indigo-500" },
  h: { icon: FileCode, color: "text-indigo-500" },
  sh: { icon: FileCode, color: "text-indigo-500" },
  sql: { icon: FileCode, color: "text-indigo-500" },
  html: { icon: FileCode, color: "text-indigo-500" },
  css: { icon: FileCode, color: "text-indigo-500" },
  json: { icon: FileCode, color: "text-indigo-500" },
  xml: { icon: FileCode, color: "text-indigo-500" },
  yaml: { icon: FileCode, color: "text-indigo-500" },
  yml: { icon: FileCode, color: "text-indigo-500" },
  md: { icon: FileText, color: "text-stone-500" },
  txt: { icon: FileText, color: "text-stone-500" },
  log: { icon: FileText, color: "text-stone-500" },
  doc: { icon: FileText, color: "text-blue-500" },
  docx: { icon: FileText, color: "text-blue-500" },
};

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

export function fileKind(file: DriveFile): { icon: LucideIcon; color: string } {
  const ext = (file.extension ?? file.name.split(".").pop() ?? "").toLowerCase();
  if (EXTENSION_ICON[ext]) return EXTENSION_ICON[ext];

  const byMime = MIME_TO_EXTENSION[file.mimeType];
  if (byMime && EXTENSION_ICON[byMime]) return EXTENSION_ICON[byMime];

  if (file.mimeType.startsWith("image/")) return { icon: FileImage, color: "text-sky-500" };
  if (file.mimeType.startsWith("video/")) return { icon: FileVideoCamera, color: "text-rose-500" };
  if (file.mimeType.startsWith("audio/")) return { icon: FileMusic, color: "text-emerald-500" };
  if (file.mimeType.startsWith("text/")) return { icon: FileText, color: "text-stone-500" };

  return { icon: File, color: "text-stone-400" };
}

export function FileTypeIcon({ file, className }: { file: DriveFile; className?: string }) {
  const { icon: Icon, color } = fileKind(file);
  return <Icon className={`${className ?? "h-5 w-5"} ${color}`} />;
}

export function FolderTypeIcon({
  open = false,
  className,
}: {
  open?: boolean;
  className?: string;
}) {
  const Icon = open ? FolderOpen : Folder;
  return <Icon className={`${className ?? "h-5 w-5"} text-amber-400`} />;
}
