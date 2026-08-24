import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { MinioService } from "../storage/minio.service";
import { isTextMime, previewKind, resolveMimeType } from "../../common/utils/mime-types";
import { TEXT_PREVIEW_MAX_BYTES } from "@mydrive/shared";
import type { UpdateFileDto } from "./dto/update-file.dto";
import type { ListFilesQueryDto } from "./dto/list-files.dto";

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async list(userId: string, query: ListFilesQueryDto) {
    const { folderId, search } = query;

    const where: Prisma.FileWhereInput = {
      ownerId: userId,
      deleted: false,
    };

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    } else if (folderId) {
      where.parentFolderId = folderId;
    } else {
      where.parentFolderId = null;
    }

    return this.prisma.file.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async upload(userId: string, file: Express.Multer.File, folderId?: string) {
    try {
      const parentFolderId = folderId?.trim() || null;

      if (parentFolderId) {
        await this.assertFolderOwned(userId, parentFolderId);
      }

      const extension = path.extname(file.originalname) || null;
      const storageKey = `users/${userId}/${randomUUID()}${extension ?? ""}`;

      await this.minio.putObject(storageKey, fs.createReadStream(file.path), file.size, {
        "Content-Type": file.mimetype,
      });

      return await this.prisma.file.create({
        data: {
          name: file.originalname,
          mimeType: file.mimetype,
          size: BigInt(file.size),
          storageKey,
          extension,
          parentFolderId,
          ownerId: userId,
        },
      });
    } finally {
      await fs.promises.rm(file.path, { force: true }).catch(() => undefined);
    }
  }

  private async assertFileOwned(userId: string, fileId: string) {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, ownerId: userId, deleted: false },
    });

    if (!file) {
      throw new NotFoundException("File tidak ditemukan");
    }

    return file;
  }

  private async assertFolderOwned(userId: string, folderId: string) {
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, ownerId: userId, deleted: false },
    });

    if (!folder) {
      throw new NotFoundException("Folder tidak ditemukan");
    }

    return folder;
  }

  async metadata(userId: string, fileId: string) {
    return this.assertFileOwned(userId, fileId);
  }

  async preview(userId: string, fileId: string) {
    const file = await this.assertFileOwned(userId, fileId);
    const mimeType = resolveMimeType(file.extension, file.mimeType);
    const url = await this.minio.presignedUrl(file.storageKey);

    return { file, url, mimeType, kind: previewKind(mimeType) };
  }

  async content(userId: string, fileId: string) {
    const file = await this.assertFileOwned(userId, fileId);
    const mimeType = resolveMimeType(file.extension, file.mimeType);

    if (!isTextMime(mimeType)) {
      throw new BadRequestException("File berformat bukan teks/code");
    }

    if (file.size > TEXT_PREVIEW_MAX_BYTES) {
      throw new PayloadTooLargeException("File terlalu besar untuk preview teks");
    }

    const buffer = await this.minio.getBuffer(file.storageKey);

    return {
      name: file.name,
      mimeType,
      content: buffer.toString("utf-8"),
      size: buffer.byteLength,
    };
  }

  async download(userId: string, fileId: string) {
    const file = await this.assertFileOwned(userId, fileId);

    const [stat, stream] = await Promise.all([
      this.minio.statObject(file.storageKey),
      this.minio.getObject(file.storageKey),
    ]);

    return {
      stream,
      size: stat.size,
      name: file.name,
      mimeType: file.mimeType,
    };
  }

  async update(userId: string, fileId: string, dto: UpdateFileDto) {
    if (dto.name === undefined && dto.parentFolderId === undefined) {
      throw new BadRequestException("Tidak ada field yang diubah");
    }

    await this.assertFileOwned(userId, fileId);

    const parentFolderId =
      dto.parentFolderId === undefined ? undefined : dto.parentFolderId?.trim() || null;

    if (parentFolderId) {
      await this.assertFolderOwned(userId, parentFolderId);
    }

    return this.prisma.file.update({
      where: { id: fileId },
      data: {
        name: dto.name,
        parentFolderId,
      },
    });
  }

  async remove(userId: string, fileId: string) {
    await this.assertFileOwned(userId, fileId);

    return this.prisma.file.update({
      where: { id: fileId },
      data: { deleted: true, deletedAt: new Date() },
    });
  }

  async star(userId: string, fileId: string, starred: boolean) {
    await this.assertFileOwned(userId, fileId);

    return this.prisma.file.update({
      where: { id: fileId },
      data: { starred },
    });
  }
}
