import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { randomUUID } from "node:crypto";
import * as path from "node:path";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { MAX_FILE_SIZE_BYTES } from "@mydrive/shared";
import { UploadExceptionFilter } from "../../common/filters/upload-exception.filter";
import { UPLOAD_TMP_DIR } from "../../common/utils/upload-tmp";
import { FilesService } from "./files.service";
import { ListFilesQueryDto } from "./dto/list-files.dto";
import { UpdateFileDto } from "./dto/update-file.dto";
import { UploadFileDto } from "./dto/upload-file.dto";

@ApiTags("Files")
@ApiBearerAuth()
@Controller("files")
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListFilesQueryDto) {
    return this.filesService.list(user.id, query);
  }

  @Post("upload")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["file"],
      properties: {
        file: { type: "string", format: "binary" },
        folderId: { type: "string" },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: UPLOAD_TMP_DIR,
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
      }),
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  )
  @UseFilters(UploadExceptionFilter)
  upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
  ) {
    if (!file) {
      throw new BadRequestException("File wajib diupload");
    }

    return this.filesService.upload(user.id, file, dto.folderId);
  }

  @Get(":id")
  metadata(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.filesService.metadata(user.id, id);
  }

  @Get(":id/preview")
  preview(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.filesService.preview(user.id, id);
  }

  @Get(":id/content")
  content(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.filesService.content(user.id, id);
  }

  @Get(":id/download")
  async download(@CurrentUser() user: AuthUser, @Param("id") id: string, @Res() res: Response) {
    const { stream, size, name, mimeType } = await this.filesService.download(user.id, id);

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", size);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
    );

    stream.pipe(res);
  }

  @Patch(":id")
  update(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: UpdateFileDto) {
    return this.filesService.update(user.id, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.filesService.remove(user.id, id);
  }

  @Post(":id/star")
  star(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.filesService.star(user.id, id, true);
  }

  @Post(":id/unstar")
  unstar(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.filesService.star(user.id, id, false);
  }
}
