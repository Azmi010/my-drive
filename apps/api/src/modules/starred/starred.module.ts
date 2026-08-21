import { Module } from "@nestjs/common";

import { StarredController } from "./starred.controller";
import { StarredService } from "./starred.service";

@Module({
  controllers: [StarredController],
  providers: [StarredService],
})
export class StarredModule {}
