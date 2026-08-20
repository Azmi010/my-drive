import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Minio from "minio";

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Minio.Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.getOrThrow<string>("minio.bucket");
    this.client = new Minio.Client({
      endPoint: this.config.getOrThrow<string>("minio.endpoint"),
      port: this.config.getOrThrow<number>("minio.port"),
      accessKey: this.config.getOrThrow<string>("minio.accessKey"),
      secretKey: this.config.getOrThrow<string>("minio.secretKey"),
      useSSL: this.config.get("minio.useSSL", false),
    });
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  private async ensureBucket() {
    const exists = await this.client.bucketExists(this.bucket);

    if (!exists) {
      await this.client.makeBucket(this.bucket);
      this.logger.log(`Bucket '${this.bucket}' created`);
    }
  }

  putObject(key: string, stream: Buffer, size: number, metaData?: Minio.ItemBucketMetadata) {
    return this.client.putObject(this.bucket, key, stream, size, metaData);
  }

  getObject(key: string) {
    return this.client.getObject(this.bucket, key);
  }

  statObject(key: string) {
    return this.client.statObject(this.bucket, key);
  }

  listObjects(prefix = "") {
    return this.client.listObjects(this.bucket, prefix, true);
  }

  removeObject(key: string) {
    return this.client.removeObject(this.bucket, key);
  }

  presignedUrl(key: string, expirySeconds = 3600) {
    return this.client.presignedGetObject(this.bucket, key, expirySeconds);
  }
}
