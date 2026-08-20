import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateFolderDto {
  @IsString()
  @MinLength(1, { message: "Nama folder tidak boleh kosong" })
  name!: string;

  @IsOptional()
  @IsString()
  parentFolderId?: string | null;
}
