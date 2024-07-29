import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  /** 다양한 조건으로 유저 찾기 */
  public async findUser(conditions: Partial<User>): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: Object.entries(conditions).map(([key, value]) => ({
          [key]: value,
        })),
      },
    });
  }

  /** 유저 생성 */
  public async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  /** 리프레시 토큰 저장 */
  public async saveRefreshToken(userId: number, token: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: token },
    });
  }

  /** 리프레시 토큰으로 유저 찾기 */
  public async findUserWithRefreshToken(
    userId: number,
    token: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        refreshToken: token,
      },
    });
  }

  /** 모든 유저 조회 */
  public async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}
