import { IsOptional, IsString } from "class-validator";

export class ListFilesQueryDto {
  @IsOptional()
  @IsString()
  folderId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
