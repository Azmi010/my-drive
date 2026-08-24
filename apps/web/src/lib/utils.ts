import { ApiError } from "./api";
import type { DriveFile, DriveFolder, DriveItem } from "./types";

export function formatBytes(size: number): string {
  if (!size || size === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / Math.pow(1024, index);
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[index]}`;
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function errorMessage(err: unknown): string {
  if (!err) return "Terjadi kesalahan yang tidak diketahui";

  if (err instanceof ApiError) {
    try {
      const parsed = JSON.parse(err.message) as {
        message?: string | string[];
        error?: string;
        statusCode?: number;
      };

      if (Array.isArray(parsed.message)) {
        return parsed.message.join(", ") || "Terjadi kesalahan validasi";
      }
      if (typeof parsed.message === "string" && parsed.message.trim()) {
        return parsed.message;
      }
      if (parsed.error) {
        return parsed.error;
      }
    } catch {
      // If parsing fails, use raw message
    }
    if (err.message && err.message.trim()) {
      return err.message;
    }
    return `Kesalahan server (${err.status})`;
  }

  if (err instanceof Error) {
    if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      return "Gagal terhubung ke server. Pastikan server backend sedang berjalan.";
    }
    return err.message;
  }

  if (typeof err === "string" && err.trim()) {
    return err;
  }

  return "Terjadi kesalahan, silakan coba lagi";
}

export function updateDriveItem(
  items: DriveItem[],
  item: DriveItem,
  patch: Partial<DriveFile> & Partial<DriveFolder>,
): DriveItem[] {
  return items.map((i) => {
    if (i.data.id !== item.data.id) return i;
    if (i.type === "folder") {
      return {
        type: "folder",
        data: { ...(i.data as DriveFolder), ...patch } as DriveFolder,
      };
    }
    return {
      type: "file",
      data: { ...(i.data as DriveFile), ...patch } as DriveFile,
    };
  });
}
