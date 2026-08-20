import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateFileDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: "Nama file tidak boleh kosong" })
  name?: string;

  @IsOptional()
  @IsString()
  parentFolderId?: string | null;
}
