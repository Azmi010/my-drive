import { Injectable, Logger, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";
import { MinioService } from "../storage/minio.service";

@Injectable()
export class TrashService {
  private readonly logger = new Logger(TrashService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async list(userId: string) {
    const [folders, files] = await Promise.all([
      this.prisma.folder.findMany({
        where: { ownerId: userId, deleted: true },
        orderBy: { deletedAt: "desc" },
      }),
      this.prisma.file.findMany({
        where: { ownerId: userId, deleted: true },
        orderBy: { deletedAt: "desc" },
      }),
    ]);

    return { folders, files };
  }

  async restoreFile(userId: string, fileId: string) {
    const file = await this.assertTrashedFile(userId, fileId);

    const parentFolderId =
      file.parentFolderId && (await this.parentRestorable(userId, file.parentFolderId))
        ? file.parentFolderId
        : null;

    return this.prisma.file.update({
      where: { id: file.id },
      data: { deleted: false, deletedAt: null, parentFolderId },
    });
  }

  async restoreFolder(userId: string, folderId: string) {
    const folder = await this.assertTrashedFolder(userId, folderId);
    const treeIds = await this.collectTreeIds(folder.id);

    const parentFolderId =
      folder.parentFolderId && (await this.parentRestorable(userId, folder.parentFolderId))
        ? folder.parentFolderId
        : null;

    await this.prisma.$transaction([
      this.prisma.folder.updateMany({
        where: { id: { in: treeIds } },
        data: { deleted: false, deletedAt: null },
      }),
      this.prisma.folder.update({
        where: { id: folder.id },
        data: { parentFolderId },
      }),
      this.prisma.file.updateMany({
        where: { parentFolderId: { in: treeIds } },
        data: { deleted: false, deletedAt: null },
      }),
    ]);

    return { restored: treeIds.length };
  }

  async deleteFile(userId: string, fileId: string) {
    const file = await this.assertTrashedFile(userId, fileId);

    await this.prisma.file.delete({ where: { id: file.id } });

    await this.minio
      .removeObject(file.storageKey)
      .catch((error) => this.logger.error(`Gagal hapus object MinIO '${file.storageKey}'`, error));

    return { deleted: 1 };
  }

  async deleteFolder(userId: string, folderId: string) {
    const folder = await this.assertTrashedFolder(userId, folderId);
    const treeIds = await this.collectTreeIds(folder.id);

    const files = await this.prisma.file.findMany({
      where: { parentFolderId: { in: treeIds } },
      select: { id: true, storageKey: true },
    });

    await this.prisma.$transaction([
      this.prisma.file.deleteMany({ where: { id: { in: files.map((f) => f.id) } } }),
      this.prisma.folder.deleteMany({ where: { id: { in: treeIds } } }),
    ]);

    for (const file of files) {
      await this.minio
        .removeObject(file.storageKey)
        .catch((error) =>
          this.logger.error(`Gagal hapus object MinIO '${file.storageKey}'`, error),
        );
    }

    return { folders: treeIds.length, files: files.length };
  }

  private async assertTrashedFile(userId: string, fileId: string) {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, ownerId: userId, deleted: true },
    });

    if (!file) {
      throw new NotFoundException("File tidak ditemukan di sampah");
    }

    return file;
  }

  private async assertTrashedFolder(userId: string, folderId: string) {
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, ownerId: userId, deleted: true },
    });

    if (!folder) {
      throw new NotFoundException("Folder tidak ditemukan di sampah");
    }

    return folder;
  }

  private async parentRestorable(userId: string, parentId: string): Promise<boolean> {
    const parent = await this.prisma.folder.findFirst({
      where: { id: parentId, ownerId: userId, deleted: false },
      select: { id: true },
    });

    return parent !== null;
  }

  private async collectTreeIds(rootId: string): Promise<string[]> {
    const result = [rootId];
    let frontier = [rootId];

    while (frontier.length > 0) {
      const children = await this.prisma.folder.findMany({
        where: { parentFolderId: { in: frontier } },
        select: { id: true },
      });

      const childIds = children.map((c) => c.id);
      result.push(...childIds);
      frontier = childIds;
    }

    return result;
  }
}
