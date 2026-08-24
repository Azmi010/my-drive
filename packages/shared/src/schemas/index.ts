import { z } from "zod";

/** Accepts real booleans and `"true"`/`"false"` query strings. */
export const booleanLike = z
  .union([z.boolean(), z.string()])
  .transform((v) => v === true || v === "true");

export const idString = z.string().min(1);

export const nameSchema = z.string().min(1, { message: "Nama tidak boleh kosong" });

export const registerSchema = z.object({
  email: z.email({ message: "Email tidak valid" }),
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
});

export const loginSchema = z.object({
  email: z.email({ message: "Email tidak valid" }),
  password: z.string().min(1, { message: "Password wajib diisi" }),
});

export const createFolderSchema = z.object({
  name: z.string().min(1, { message: "Nama folder tidak boleh kosong" }),
  parentFolderId: idString.nullish(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1, { message: "Nama folder tidak boleh kosong" }).optional(),
  parentFolderId: idString.nullish(),
});

export const updateFileSchema = z.object({
  name: z.string().min(1, { message: "Nama file tidak boleh kosong" }).optional(),
  parentFolderId: idString.nullish(),
});

export const listItemsQuerySchema = z.object({
  folderId: idString.optional(),
  search: z.string().optional(),
  flat: booleanLike.optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
export type UpdateFileInput = z.infer<typeof updateFileSchema>;
export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;
