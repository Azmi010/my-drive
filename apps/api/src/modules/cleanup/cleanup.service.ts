import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { PrismaService } from "../../prisma/prisma.service";
import { MinioService } from "../storage/minio.service";

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

  @Cron("0 0 1,16 * *")
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
}
