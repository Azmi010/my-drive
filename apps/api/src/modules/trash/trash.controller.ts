import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { TrashService } from "./trash.service";

@ApiTags("Trash")
@ApiBearerAuth()
@Controller("trash")
@UseGuards(JwtAuthGuard)
export class TrashController {
  constructor(private readonly trashService: TrashService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.trashService.list(user.id);
  }

  @Post("files/:id/restore")
  restoreFile(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.trashService.restoreFile(user.id, id);
  }

  @Post("folders/:id/restore")
  restoreFolder(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.trashService.restoreFolder(user.id, id);
  }

  @Delete("files/:id")
  deleteFile(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.trashService.deleteFile(user.id, id);
  }

  @Delete("folders/:id")
  deleteFolder(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.trashService.deleteFolder(user.id, id);
  }
}
