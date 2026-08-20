import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import type { CreateFolderDto } from "./dto/create-folder.dto";
import type { UpdateFolderDto } from "./dto/update-folder.dto";
import type { ListFoldersQueryDto } from "./dto/list-folders.dto";

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: ListFoldersQueryDto) {
    const { folderId, search, flat } = query;

    const where: Prisma.FolderWhereInput = {
      ownerId: userId,
      deleted: false,
    };

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    } else if (flat) {
      return this.prisma.folder.findMany({
        where,
        orderBy: { name: "asc" },
      });
    } else if (folderId) {
      where.parentFolderId = folderId;
    } else {
      where.parentFolderId = null;
    }

    return this.prisma.folder.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async create(userId: string, dto: CreateFolderDto) {
    const parentFolderId = dto.parentFolderId?.trim() || null;

    if (parentFolderId) {
      await this.assertFolderOwned(userId, parentFolderId);
    }

    return this.prisma.folder.create({
      data: {
        name: dto.name,
        parentFolderId,
        ownerId: userId,
      },
    });
  }

  async metadata(userId: string, folderId: string) {
    return this.assertFolderOwned(userId, folderId);
  }

  async contents(userId: string, folderId: string) {
    const folder = await this.assertFolderOwned(userId, folderId);

    const [folders, files] = await Promise.all([
      this.prisma.folder.findMany({
        where: { ownerId: userId, parentFolderId: folderId, deleted: false },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.file.findMany({
        where: { ownerId: userId, parentFolderId: folderId, deleted: false },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { folder, folders, files };
  }

  async tree(userId: string, folderId: string) {
    const folder = await this.assertFolderOwned(userId, folderId);

    const path = [folder];
    let current = folder;

    while (current.parentFolderId) {
      const parent = await this.prisma.folder.findUnique({
        where: { id: current.parentFolderId },
      });

      if (!parent || parent.ownerId !== userId || parent.deleted) {
        break;
      }

      path.unshift(parent);
      current = parent;
    }

    return path.map((f) => ({
      id: f.id,
      name: f.name,
      parentFolderId: f.parentFolderId,
    }));
  }

  async update(userId: string, folderId: string, dto: UpdateFolderDto) {
    if (dto.name === undefined && dto.parentFolderId === undefined) {
      throw new BadRequestException("Tidak ada field yang diubah");
    }

    await this.assertFolderOwned(userId, folderId);

    const parentFolderId =
      dto.parentFolderId === undefined ? undefined : dto.parentFolderId?.trim() || null;

    if (parentFolderId) {
      await this.assertFolderOwned(userId, parentFolderId);
      await this.assertNotDescendant(folderId, parentFolderId);
    }

    return this.prisma.folder.update({
      where: { id: folderId },
      data: {
        name: dto.name,
        parentFolderId,
      },
    });
  }

  async remove(userId: string, folderId: string) {
    await this.assertFolderOwned(userId, folderId);

    const descendantIds = await this.collectDescendantIds(folderId);
    const affectedIds = [folderId, ...descendantIds];

    await this.prisma.$transaction([
      this.prisma.folder.updateMany({
        where: { id: { in: affectedIds } },
        data: { deleted: true, deletedAt: new Date() },
      }),
      this.prisma.file.updateMany({
        where: { parentFolderId: { in: affectedIds } },
        data: { deleted: true, deletedAt: new Date() },
      }),
    ]);

    return { deleted: affectedIds.length };
  }

  async star(userId: string, folderId: string, starred: boolean) {
    await this.assertFolderOwned(userId, folderId);

    return this.prisma.folder.update({
      where: { id: folderId },
      data: { starred },
    });
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

  private async collectDescendantIds(folderId: string): Promise<string[]> {
    const result: string[] = [];
    let frontier = [folderId];

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

  private async assertNotDescendant(folderId: string, targetId: string) {
    if (folderId === targetId) {
      throw new BadRequestException("Folder tidak bisa dipindahkan ke dalam dirinya sendiri");
    }

    const descendantIds = await this.collectDescendantIds(folderId);

    if (descendantIds.includes(targetId)) {
      throw new BadRequestException("Folder tidak bisa dipindahkan ke dalam sub-foldernya sendiri");
    }
  }
}
