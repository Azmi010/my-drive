import { ApiError } from "./api";
import type { DriveFile, DriveFolder, DriveItem } from "./types";

export function formatBytes(size: number): string {
  if (!size) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / Math.pow(1024, index);
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[index]}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    try {
      const parsed = JSON.parse(err.message) as { message?: string | string[] };
      if (Array.isArray(parsed.message)) return parsed.message[0] ?? "Terjadi kesalahan";
      if (parsed.message) return parsed.message;
    } catch {
      // fall through
    }
    return err.message || "Terjadi kesalahan";
  }
  if (err instanceof Error) return err.message;
  return "Terjadi kesalahan";
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
