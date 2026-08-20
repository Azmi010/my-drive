export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type File = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  starred: boolean;
  parentFolderId: string | null;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Folder = {
  id: string;
  name: string;
  starred: boolean;
  parentFolderId: string | null;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
};