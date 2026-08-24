import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import * as fs from "node:fs";
import * as path from "node:path";

import { PrismaService } from "../../prisma/prisma.service";
import { MinioService } from "../storage/minio.service";
import { UPLOAD_TMP_DIR } from "../../common/utils/upload-tmp";

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async hardDeleteTrashedFiles() {
    const files = await this.prisma.file.findMany({
      where: { deleted: true, deletedAt: { not: null } },
      select: { id: true, storageKey: true },
    });

    let removed = 0;

    for (const file of files) {
      await this.prisma.file.delete({ where: { id: file.id } });

      await this.minio
        .removeObject(file.storageKey)
        .catch((error) =>
          this.logger.error(`Gagal hapus object MinIO '${file.storageKey}'`, error),
        );

      removed++;
    }

    this.logger.log(`Hard delete selesai: ${removed} file dihapus permanen`);
  }

  @Cron("0 0 2 1 * *")
  async hardDeleteTrashedFolders() {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const folders = await this.prisma.folder.findMany({
      where: { deleted: true, deletedAt: { lte: cutoff } },
      select: { id: true, name: true },
    });

    let removedFolders = 0;
    let removedFiles = 0;

    for (const folder of folders) {
      const affectedIds = await this.collectFolderTreeIds(folder.id);
      const files = await this.prisma.file.findMany({
        where: { parentFolderId: { in: affectedIds } },
        select: { id: true, storageKey: true },
      });

      await this.prisma.$transaction([
        this.prisma.file.deleteMany({ where: { id: { in: files.map((f) => f.id) } } }),
        this.prisma.folder.deleteMany({ where: { id: { in: affectedIds } } }),
      ]);

      for (const file of files) {
        await this.minio
          .removeObject(file.storageKey)
          .catch((error) =>
            this.logger.error(`Gagal hapus object MinIO '${file.storageKey}'`, error),
          );
      }

      removedFolders += affectedIds.length;
      removedFiles += files.length;
    }

    this.logger.log(
      `Hard delete folder selesai: ${removedFolders} folder, ${removedFiles} file dihapus permanen`,
    );
  }

  @Cron("0 0 3 1 * *")
  async cleanupOrphanedObjects() {
    const dbKeys = new Set(
      (await this.prisma.file.findMany({ select: { storageKey: true } })).map(
        (row) => row.storageKey,
      ),
    );

    let removed = 0;
    const stream = this.minio.listObjects("users/");

    for await (const item of stream) {
      const name = (item as { name: string }).name;

      if (dbKeys.has(name)) {
        continue;
      }

      removed++;

      await this.minio
        .removeObject(name)
        .catch((error) => this.logger.error(`Gagal hapus orphan '${name}'`, error));
    }

    this.logger.log(`Cleanup orphan selesai: ${removed} object dihapus`);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupStaleTempUploads() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const entries = await fs.promises.readdir(UPLOAD_TMP_DIR).catch(() => [] as string[]);

    let removed = 0;

    for (const entry of entries) {
      const filePath = path.join(UPLOAD_TMP_DIR, entry);
      const stat = await fs.promises.stat(filePath).catch(() => null);

      if (!stat || !stat.isFile() || stat.mtimeMs > cutoff) {
        continue;
      }

      await fs.promises.rm(filePath, { force: true }).catch(() => undefined);
      removed++;
    }

    if (removed > 0) {
      this.logger.log(`Purge temp upload selesai: ${removed} file dihapus`);
    }
  }

  private async collectFolderTreeIds(rootId: string): Promise<string[]> {
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
