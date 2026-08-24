import { DEFAULT_MIME, EXTENSION_MIME, TEXT_PREVIEW_MIMES } from "../constants/mime.js";
import type { PreviewKind } from "../types/index.js";

export function mimeFromExtension(extension?: string | null): string | null {
  if (!extension) {
    return null;
  }

  const ext = extension.startsWith(".") ? extension.slice(1) : extension;

  return EXTENSION_MIME[ext.toLowerCase()] ?? null;
}

export function resolveMimeType(extension?: string | null, fallback?: string | null): string {
  return mimeFromExtension(extension) ?? fallback ?? DEFAULT_MIME;
}

export function isTextMime(mime: string): boolean {
  return mime.startsWith("text/") || TEXT_PREVIEW_MIMES.has(mime);
}

export function previewKind(mime: string): PreviewKind {
  if (mime === "application/pdf") {
    return "pdf";
  }

  if (mime.startsWith("image/")) {
    return "image";
  }

  if (mime.startsWith("video/")) {
    return "video";
  }

  if (mime.startsWith("audio/")) {
    return "audio";
  }

  if (isTextMime(mime)) {
    return "text";
  }

  return "other";
}
