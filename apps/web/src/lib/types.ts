export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  storageKey: string;
  extension: string | null;
  starred: boolean;
  deleted: boolean;
  deletedAt: string | null;
  parentFolderId: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  starred: boolean;
  deleted: boolean;
  deletedAt: string | null;
  parentFolderId: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FolderTreeItem {
  id: string;
  name: string;
  parentFolderId: string | null;
}

export interface PreviewResponse {
  file: DriveFile;
  url: string;
  mimeType: string;
  kind: string;
}

export interface FileContent {
  name: string;
  mimeType: string;
  content: string;
  size: number;
}

export type DriveItem = { type: "file"; data: DriveFile } | { type: "folder"; data: DriveFolder };

export type ViewMode = "grid" | "list";
