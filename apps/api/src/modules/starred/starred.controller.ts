import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { StarredService } from "./starred.service";

@ApiTags("Starred")
@ApiBearerAuth()
@Controller("starred")
@UseGuards(JwtAuthGuard)
export class StarredController {
  constructor(private readonly starredService: StarredService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.starredService.list(user.id);
  }
}
