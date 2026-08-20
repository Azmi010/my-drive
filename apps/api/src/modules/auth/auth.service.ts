import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, type JwtSignOptions } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { PrismaService } from "../../prisma/prisma.service";
import type { AuthUser, JwtPayload } from "./interfaces/auth-user.interface";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException("Email sudah terdaftar");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
      },
      select: { id: true, email: true, name: true },
    });

    return { accessToken: await this.signToken(user), user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Email atau password salah");
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException("Email atau password salah");
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    return { accessToken: await this.signToken(authUser), user: authUser };
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new UnauthorizedException("Token tidak valid");
    }

    return user;
  }

  private async signToken(user: AuthUser) {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    return this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>("jwt.secret"),
      expiresIn: this.config.getOrThrow<string>("jwt.expiresIn") as JwtSignOptions["expiresIn"],
    });
  }
}
