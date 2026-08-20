import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { FoldersService } from "./folders.service";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
import { ListFoldersQueryDto } from "./dto/list-folders.dto";

@ApiTags("Folders")
@ApiBearerAuth()
@Controller("folders")
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListFoldersQueryDto) {
    return this.foldersService.list(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateFolderDto) {
    return this.foldersService.create(user.id, dto);
  }

  @Get(":id")
  metadata(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.foldersService.metadata(user.id, id);
  }

  @Get(":id/contents")
  contents(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.foldersService.contents(user.id, id);
  }

  @Get(":id/tree")
  tree(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.foldersService.tree(user.id, id);
  }

  @Patch(":id")
  update(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: UpdateFolderDto) {
    return this.foldersService.update(user.id, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.foldersService.remove(user.id, id);
  }

  @Post(":id/star")
  star(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.foldersService.star(user.id, id, true);
  }

  @Post(":id/unstar")
  unstar(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.foldersService.star(user.id, id, false);
  }
}
