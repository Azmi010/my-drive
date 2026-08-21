import type {
  AuthResponse,
  AuthUser,
  DriveFile,
  DriveFolder,
  FileContent,
  FolderTreeItem,
  PreviewResponse,
} from "./types";
import { getTokenCookie } from "./cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

function authToken(): string | undefined {
  return getTokenCookie();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { headers, body, ...rest } = options;
  const token = authToken();

  const res = await fetch(`${API_URL}/api${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const message = await res.text().catch(() => null);
    throw new ApiError(res.status, message || res.statusText);
  }

  return (await res.json()) as T;
}

function buildQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

interface ListParams {
  folderId?: string | null;
  search?: string;
  flat?: boolean;
}

export const api = {
  register: (data: { email: string; name: string; password: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: data }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: data }),

  me: (token: string) =>
    request<AuthUser>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Folders
  listFolders: (params: ListParams = {}) => request<DriveFolder[]>(`/folders${buildQuery(params)}`),

  createFolder: (data: { name: string; parentFolderId?: string | null }) =>
    request<DriveFolder>("/folders", { method: "POST", body: data }),

  getFolder: (id: string) => request<DriveFolder>(`/folders/${id}`),

  getFolderTree: (id: string) => request<FolderTreeItem[]>(`/folders/${id}/tree`),

  updateFolder: (id: string, data: { name?: string; parentFolderId?: string | null }) =>
    request<DriveFolder>(`/folders/${id}`, { method: "PATCH", body: data }),

  deleteFolder: (id: string) =>
    request<{ deleted: number }>(`/folders/${id}`, { method: "DELETE" }),

  starFolder: (id: string) => request<DriveFolder>(`/folders/${id}/star`, { method: "POST" }),

  unstarFolder: (id: string) => request<DriveFolder>(`/folders/${id}/unstar`, { method: "POST" }),

  // Files
  listFiles: (params: ListParams = {}) => request<DriveFile[]>(`/files${buildQuery(params)}`),

  getFile: (id: string) => request<DriveFile>(`/files/${id}`),

  getFilePreview: (id: string) => request<PreviewResponse>(`/files/${id}/preview`),

  getFileContent: (id: string) => request<FileContent>(`/files/${id}/content`),

  updateFile: (id: string, data: { name?: string; parentFolderId?: string | null }) =>
    request<DriveFile>(`/files/${id}`, { method: "PATCH", body: data }),

  deleteFile: (id: string) => request<DriveFile>(`/files/${id}`, { method: "DELETE" }),

  starFile: (id: string) => request<DriveFile>(`/files/${id}/star`, { method: "POST" }),

  unstarFile: (id: string) => request<DriveFile>(`/files/${id}/unstar`, { method: "POST" }),

  // Trash
  listTrash: () => request<{ folders: DriveFolder[]; files: DriveFile[] }>("/trash"),

  restoreTrashFile: (id: string) =>
    request<DriveFile>(`/trash/files/${id}/restore`, { method: "POST" }),

  restoreTrashFolder: (id: string) =>
    request<{ restored: number }>(`/trash/folders/${id}/restore`, { method: "POST" }),

  deleteTrashFile: (id: string) =>
    request<{ deleted: number }>(`/trash/files/${id}`, { method: "DELETE" }),

  deleteTrashFolder: (id: string) =>
    request<{ folders: number; files: number }>(`/trash/folders/${id}`, { method: "DELETE" }),

  // Starred
  listStarred: () => request<{ folders: DriveFolder[]; files: DriveFile[] }>("/starred"),

  uploadFile: (
    file: File,
    options: { folderId?: string | null; onProgress?: (progress: number) => void } = {},
  ): Promise<DriveFile> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const form = new FormData();
      form.append("file", file);
      if (options.folderId) form.append("folderId", options.folderId);

      xhr.open("POST", `${API_URL}/api/files/upload`);
      const token = authToken();
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      if (options.onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            options.onProgress?.(Math.round((e.loaded / e.total) * 100));
          }
        };
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as DriveFile);
        } else {
          reject(new ApiError(xhr.status, xhr.responseText || xhr.statusText));
        }
      };
      xhr.onerror = () => reject(new ApiError(0, "Network error"));
      xhr.send(form);
    }),

  downloadFile: async (id: string): Promise<void> => {
    const token = authToken();
    const res = await fetch(`${API_URL}/api/files/${id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const message = await res.text().catch(() => null);
      throw new ApiError(res.status, message || res.statusText);
    }
    const blob = await res.blob();
    const disposition = res.headers.get("content-disposition") ?? "";
    const match = disposition.match(/filename\*=UTF-8''([^;]+)/);
    const filename = match ? decodeURIComponent(match[1]) : `download-${id}`;

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },
};
