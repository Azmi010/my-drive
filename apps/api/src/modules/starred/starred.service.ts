import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class StarredService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const [folders, files] = await Promise.all([
      this.prisma.folder.findMany({
        where: { ownerId: userId, starred: true, deleted: false },
        orderBy: { updatedAt: "desc" },
      }),
      this.prisma.file.findMany({
        where: { ownerId: userId, starred: true, deleted: false },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return { folders, files };
  }
}
